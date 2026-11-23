import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET citizen orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (status) {
      whereClause.status = status;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            area: true,
            address: true,
            phone: true,
            type: true,
          },
        },
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                brandName: true,
                dosageForm: true,
                packSize: true,
                isJanAushadhi: true,
                mrp: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    const formattedOrders = orders.map((o) => {
      const isExpired =
        o.status === "HOLD_REQUESTED" &&
        o.holdExpiresAt !== null &&
        new Date(o.holdExpiresAt) < now;

      return {
        id: o.id,
        userId: o.userId,
        storeId: o.storeId,
        storeName: o.store.name,
        storeArea: o.store.area,
        storeAddress: o.store.address,
        storePhone: o.store.phone,
        storeType: o.store.type,
        status: isExpired ? "CANCELLED" : o.status,
        mode: o.mode,
        createdAt: o.createdAt.toISOString(),
        holdExpiresAt: o.holdExpiresAt ? o.holdExpiresAt.toISOString() : null,
        isExpired,
        totalPaid: o.totalPaid,
        totalMrpBaseline: o.totalMrpBaseline,
        savings: o.savings,
        items: o.items.map((i) => ({
          id: i.id,
          medicineId: i.medicineId,
          brandName: i.medicine.brandName,
          dosageForm: i.medicine.dosageForm,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          baselinePrice: i.baselinePrice,
          isJanAushadhi: i.medicine.isJanAushadhi,
          mrp: i.medicine.mrp,
        })),
        lastMessage: o.messages[0]
          ? {
              text: o.messages[0].text,
              senderRole: o.messages[0].senderRole,
              createdAt: o.messages[0].createdAt.toISOString(),
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST create 2-hour hold reservation / order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      storeId,
      mode = "PICKUP",
      paymentMethod = "PAY_AT_STORE",
      deliveryAddress,
      deliveryFee = 0,
      deliveryEta = "30-45 mins",
      items = [],
    } = body;
    let { userId } = body;

    if (!storeId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "storeId and at least one item required" },
        { status: 400 }
      );
    }

    // Default to first citizen if not provided
    if (!userId) {
      const defaultCitizen = await db.user.findFirst({
        where: { role: "CITIZEN" },
      });
      userId = defaultCitizen?.id || "demo-citizen";
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // 1. Verify stock availability for all items to guarantee stock cannot go negative
    const inventoryItemsToUpdate: { inventoryId: string; newQty: number }[] = [];

    for (const item of items) {
      const inv = await db.inventory.findFirst({
        where: {
          storeId,
          medicineId: item.medicineId,
        },
        include: {
          medicine: { select: { brandName: true } },
        },
      });

      if (!inv) {
        return NextResponse.json(
          {
            success: false,
            error: `Store does not stock medicine ID ${item.medicineId}`,
          },
          { status: 400 }
        );
      }

      if (inv.quantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${inv.medicine.brandName}. Available: ${inv.quantity}, requested: ${item.quantity}. Stock cannot go negative.`,
          },
          { status: 400 }
        );
      }

      inventoryItemsToUpdate.push({
        inventoryId: inv.id,
        newQty: inv.quantity - item.quantity,
      });
    }

    // 2. Compute financial totals and savings
    let itemsSubtotal = 0;
    let itemsMrpBaseline = 0;

    items.forEach((it: any) => {
      const qty = Math.max(1, it.quantity || 1);
      const price = Number(it.unitPrice) || 0;
      const baseline = Number(it.baselinePrice) || price;

      itemsSubtotal += price * qty;
      itemsMrpBaseline += baseline * qty;
    });

    const netDeliveryFee = mode === "DELIVERY" ? Number(deliveryFee) || 0 : 0;
    const totalPaid = Number((itemsSubtotal + netDeliveryFee).toFixed(2));
    const totalMrpBaseline = Number(itemsMrpBaseline.toFixed(2));
    const savings = Number(Math.max(0, totalMrpBaseline - itemsSubtotal).toFixed(2));

    // 2-Hour Hold expiration
    const holdExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // 3. Execute atomic transaction: lock inventory & create order + items + initial message
    const createdOrder = await db.$transaction(async (tx) => {
      // Temporarily reserve stock so quantity decreases immediately
      for (const invUpdate of inventoryItemsToUpdate) {
        await tx.inventory.update({
          where: { id: invUpdate.inventoryId },
          data: { quantity: invUpdate.newQty },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          storeId,
          status: "HOLD_REQUESTED",
          mode,
          holdExpiresAt,
          totalPaid,
          totalMrpBaseline,
          savings,
          items: {
            create: items.map((it: any) => ({
              medicineId: it.medicineId,
              quantity: Math.max(1, it.quantity || 1),
              unitPrice: Number(it.unitPrice) || 0,
              baselinePrice: Number(it.baselinePrice) || Number(it.unitPrice) || 0,
            })),
          },
        },
        include: {
          items: {
            include: { medicine: true },
          },
        },
      });

      // Create system/citizen notification message in thread
      const detailsMsg =
        mode === "DELIVERY"
          ? `Hold requested for 2 hours (Delivery to: ${deliveryAddress || "Lucknow"}, ETA: ${deliveryEta}). Payment: ${paymentMethod}.`
          : `Hold requested for 2 hours (Store Counter Pickup). Payment: ${paymentMethod}.`;

      await tx.message.create({
        data: {
          orderId: newOrder.id,
          storeId,
          userId,
          senderRole: "CITIZEN",
          text: detailsMsg,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: createdOrder.id,
        status: createdOrder.status,
        mode: createdOrder.mode,
        holdExpiresAt: createdOrder.holdExpiresAt?.toISOString(),
        totalPaid: createdOrder.totalPaid,
        totalMrpBaseline: createdOrder.totalMrpBaseline,
        savings: createdOrder.savings,
        itemsCount: createdOrder.items.length,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place medicine hold order" },
      { status: 500 }
    );
  }
}
