import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET orders for a store (or all stores if storeId is omitted)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    const whereClause: any = {};
    if (storeId) {
      whereClause.storeId = storeId;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            area: true,
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => {
        const isExpired =
          o.status === "HOLD_REQUESTED" &&
          o.holdExpiresAt !== null &&
          new Date(o.holdExpiresAt) < now;

        return {
          id: o.id,
          storeId: o.storeId,
          storeName: o.store.name,
          storeArea: o.store.area,
          status: isExpired ? "CANCELLED" : o.status,
          mode: o.mode,
          createdAt: o.createdAt.toISOString(),
          holdExpiresAt: o.holdExpiresAt ? o.holdExpiresAt.toISOString() : null,
          isExpired,
          totalPaid: o.totalPaid,
          totalMrpBaseline: o.totalMrpBaseline,
          savings: o.savings,
          customerName: o.user.name,
          customerPhone: o.user.phone,
          customerId: o.user.id,
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
          messages: o.messages.map((m) => ({
            id: m.id,
            senderRole: m.senderRole,
            text: m.text,
            createdAt: m.createdAt.toISOString(),
          })),
        };
      }),
    });
  } catch (error) {
    console.error("Shop orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH update order status (Confirm, Mark Ready, Complete, or Reject with stock restore)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, rejectionReason } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "HOLD_REQUESTED",
      "CONFIRMED",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = existingOrder.status;

    const result = await db.$transaction(async (tx) => {
      // 1. Update status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // 2. If status moves to COMPLETED for the first time, increment user lifetime savings
      if (status === "COMPLETED" && previousStatus !== "COMPLETED") {
        await tx.user.update({
          where: { id: existingOrder.userId },
          data: {
            savedTotal: {
              increment: existingOrder.savings,
            },
          },
        });

        // Add confirmation message
        await tx.message.create({
          data: {
            orderId: existingOrder.id,
            storeId: existingOrder.storeId,
            userId: existingOrder.userId,
            senderRole: "STORE",
            text: `Order completed! Total savings of ₹${existingOrder.savings.toFixed(2)} recorded. Thank you for choosing generic medicine.`,
          },
        });
      }

      // 3. If status moves to CANCELLED / REJECTED, restore the reserved stock quantity
      if (status === "CANCELLED" && previousStatus !== "CANCELLED") {
        for (const item of existingOrder.items) {
          const inv = await tx.inventory.findFirst({
            where: {
              storeId: existingOrder.storeId,
              medicineId: item.medicineId,
            },
          });
          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                quantity: inv.quantity + item.quantity,
              },
            });
          }
        }

        const reasonText = rejectionReason
          ? `Hold rejected by pharmacy. Reason: ${rejectionReason}. Reserved stock has been restored.`
          : "Hold cancelled. Reserved stock has been restored.";

        await tx.message.create({
          data: {
            orderId: existingOrder.id,
            storeId: existingOrder.storeId,
            userId: existingOrder.userId,
            senderRole: "STORE",
            text: reasonText,
          },
        });
      }

      // 4. Status notifications for CONFIRMED and READY
      if (status === "CONFIRMED" && previousStatus !== "CONFIRMED") {
        await tx.message.create({
          data: {
            orderId: existingOrder.id,
            storeId: existingOrder.storeId,
            userId: existingOrder.userId,
            senderRole: "STORE",
            text: "Pharmacist confirmed your 2-hour hold reservation. Your medicines are secured.",
          },
        });
      }

      if (status === "READY" && previousStatus !== "READY") {
        await tx.message.create({
          data: {
            orderId: existingOrder.id,
            storeId: existingOrder.storeId,
            userId: existingOrder.userId,
            senderRole: "STORE",
            text: existingOrder.mode === "DELIVERY"
              ? "Your medicine package is packed and out for local delivery!"
              : "Your medicine package is packed and ready for pickup at our counter!",
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error) {
    console.error("Shop orders PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
