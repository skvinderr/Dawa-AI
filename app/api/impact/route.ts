import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const storesCount = await db.store.count();

    const orders = await db.order.findMany({
      include: {
        store: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    const completedOrders = orders.filter((o) => o.status === "COMPLETED");

    // Total savings across all users
    const totalSavingsAllUsers = Number(
      completedOrders.reduce((acc, o) => acc + Math.max(0, o.savings || 0), 0).toFixed(2)
    );

    // Total Jan Aushadhi purchases
    let janAushadhiPurchasesCount = 0;
    const medicineSavingsMap = new Map<
      string,
      {
        id: string;
        name: string;
        isJanAushadhi: boolean;
        manufacturer: string;
        unitsSold: number;
        totalSavings: number;
      }
    >();

    // Area-wise breakdown
    const areaMap = new Map<string, { totalSavings: number; orderCount: number }>();

    // Month-wise trend
    const monthMap = new Map<string, { savings: number; orders: number }>();

    completedOrders.forEach((order) => {
      // Area metrics
      const area = order.store.area || "Hazratganj";
      const currentArea = areaMap.get(area) || { totalSavings: 0, orderCount: 0 };
      currentArea.totalSavings = Number((currentArea.totalSavings + order.savings).toFixed(2));
      currentArea.orderCount += 1;
      areaMap.set(area, currentArea);

      // Monthly metrics
      const monthKey = order.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const currentMonth = monthMap.get(monthKey) || { savings: 0, orders: 0 };
      currentMonth.savings = Number((currentMonth.savings + order.savings).toFixed(2));
      currentMonth.orders += 1;
      monthMap.set(monthKey, currentMonth);

      // Medicine level savings
      order.items.forEach((item) => {
        if (item.medicine.isJanAushadhi) {
          janAushadhiPurchasesCount += item.quantity;
        }

        const medId = item.medicine.id;
        const curMed = medicineSavingsMap.get(medId) || {
          id: medId,
          name: item.medicine.brandName,
          isJanAushadhi: item.medicine.isJanAushadhi,
          manufacturer: item.medicine.manufacturer,
          unitsSold: 0,
          totalSavings: 0,
        };

        const itemSaving = Math.max(0, (item.baselinePrice - item.unitPrice) * item.quantity);
        curMed.unitsSold += item.quantity;
        curMed.totalSavings = Number((curMed.totalSavings + itemSaving).toFixed(2));
        medicineSavingsMap.set(medId, curMed);
      });
    });

    // Top 5 Most-Saved Medicines
    const topSavedMedicines = Array.from(medicineSavingsMap.values())
      .sort((a, b) => b.totalSavings - a.totalSavings)
      .slice(0, 5);

    // Format Area breakdown array
    const districtWiseSavings = Array.from(areaMap.entries()).map(([area, data]) => ({
      area,
      totalSavings: data.totalSavings,
      orderCount: data.orderCount,
    }));

    // Format Monthly trend array
    const monthlySavingsTrend = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      savings: data.savings,
      orders: data.orders,
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalSavingsAllUsers,
        totalOrdersCount: orders.length,
        completedOrdersCount: completedOrders.length,
        janAushadhiPurchasesCount,
        totalStoresOnboarded: storesCount,
      },
      districtWiseSavings,
      monthlySavingsTrend,
      topSavedMedicines,
    });
  } catch (error: any) {
    console.error("Impact API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load impact analytics" },
      { status: 500 }
    );
  }
}
