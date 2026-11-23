import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Fetch user or default to senior citizen Ram Swaroop Shukla
    let user;
    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await db.user.findFirst({
        where: { role: "CITIZEN", hasChronicCondition: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's orders
    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: {
        store: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const completedOrders = orders.filter((o) => o.status === "COMPLETED");

    // Month-by-month savings for Recharts bar chart
    const monthMap = new Map<string, { savings: number; orders: number }>();
    completedOrders.forEach((order) => {
      const monthKey = order.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const cur = monthMap.get(monthKey) || { savings: 0, orders: 0 };
      cur.savings = Number((cur.savings + order.savings).toFixed(2));
      cur.orders += 1;
      monthMap.set(monthKey, cur);
    });

    const monthlyHistory = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      savings: data.savings,
      orders: data.orders,
    }));

    const totalLifetimeSavings = Number(
      completedOrders.reduce((acc, o) => acc + Math.max(0, o.savings || 0), 0).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        district: user.district,
        savedTotal: totalLifetimeSavings,
      },
      lifetimeSavings: totalLifetimeSavings,
      ordersCount: orders.length,
      completedOrdersCount: completedOrders.length,
      monthlyHistory,
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        mode: o.mode,
        createdAt: o.createdAt,
        storeName: o.store.name,
        storeArea: o.store.area,
        totalPaid: o.totalPaid,
        totalMrpBaseline: o.totalMrpBaseline,
        savings: o.savings,
        itemsCount: o.items.length,
        items: o.items.map((i) => ({
          medicineName: i.medicine.brandName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          baselinePrice: i.baselinePrice,
          savings: Math.max(0, (i.baselinePrice - i.unitPrice) * i.quantity),
        })),
      })),
    });
  } catch (error: any) {
    console.error("User savings API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load user savings" },
      { status: 500 }
    );
  }
}
