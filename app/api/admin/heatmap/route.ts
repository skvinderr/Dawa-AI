import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  computeAreaOutbreakSignals,
  computeMedicineShortages,
  SignalGroupKey,
  PRIVACY_THRESHOLD,
} from "@/lib/outbreak";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = (searchParams.get("category") || "ALL").toUpperCase();
    const validCategories: SignalGroupKey[] = [
      "ALL",
      "FEVER",
      "GASTRO",
      "RESPIRATORY",
      "SKIN",
      "OTHER",
    ];
    const selectedGroup: SignalGroupKey = validCategories.includes(
      categoryParam as SignalGroupKey
    )
      ? (categoryParam as SignalGroupKey)
      : "ALL";

    const daysParam = parseInt(searchParams.get("days") || "14", 10);
    const timeframeDays = isNaN(daysParam) ? 14 : Math.min(Math.max(daysParam, 3), 14);

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 14); // Always fetch 14 days for baseline computation

    // 1. Fetch SearchEvents
    const searchEvents = await db.searchEvent.findMany({
      where: {
        createdAt: {
          gte: cutoffDate,
        },
      },
      include: {
        salt: true,
        medicine: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Fetch completed Orders & items to incorporate fulfillment volume
    const completedOrders = await db.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: cutoffDate,
        },
      },
      include: {
        store: true,
        items: {
          include: {
            medicine: {
              include: {
                salts: {
                  include: {
                    salt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. Unify search events + completed order signals
    const combinedSignals = [
      ...searchEvents.map((se) => ({
        area: se.area,
        lat: se.lat,
        lng: se.lng,
        query: se.query,
        saltName: se.salt?.name || null,
        saltCategory: se.salt?.category || null,
        medicineBrand: se.medicine?.brandName || null,
        createdAt: se.createdAt,
      })),
      ...completedOrders.flatMap((order) =>
        order.items.map((item) => ({
          area: order.store.area,
          lat: order.store.lat,
          lng: order.store.lng,
          query: item.medicine.brandName,
          saltName: item.medicine.salts[0]?.salt.name || null,
          saltCategory: item.medicine.salts[0]?.salt.category || null,
          medicineBrand: item.medicine.brandName,
          createdAt: order.createdAt,
        }))
      ),
    ];

    // 4. Fetch all stores in Lucknow with inventory and salts
    const stores = await db.store.findMany({
      include: {
        inventory: {
          include: {
            medicine: {
              include: {
                salts: {
                  include: {
                    salt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 5. Run Outbreak & Anomaly Detection Engine
    const outbreakResult = computeAreaOutbreakSignals({
      events: combinedSignals,
      referenceDate: now,
      selectedGroup,
      timeframeDays,
    });

    // 6. Run Medicine Shortage Detection Engine (<20% store coverage)
    const shortages = computeMedicineShortages(stores);

    // 7. Store pins for map overlay
    const storePins = stores.map((s) => {
      const outOfStockItems = s.inventory.filter((inv) => inv.quantity === 0);
      const lowStockItems = s.inventory.filter(
        (inv) => inv.quantity > 0 && inv.quantity < 10
      );
      return {
        id: s.id,
        name: s.name,
        type: s.type,
        address: s.address,
        area: s.area,
        lat: s.lat,
        lng: s.lng,
        phone: s.phone,
        openHours: s.openHours,
        totalSkus: s.inventory.length,
        outOfStockCount: outOfStockItems.length,
        lowStockCount: lowStockItems.length,
      };
    });

    return NextResponse.json({
      success: true,
      timeframeDays,
      selectedCategory: selectedGroup,
      privacyThreshold: PRIVACY_THRESHOLD,
      privacyNote:
        "All signals are aggregated strictly at the municipal area level. Any cell or cohort with fewer than 5 events is suppressed (<5) to ensure citizen privacy.",
      citywide: {
        totalSignals: outbreakResult.totalSignalsAnalyzed,
        alertAreasCount: outbreakResult.alertAreasCount,
        risingAreasCount: outbreakResult.risingAreasCount,
        normalAreasCount:
          outbreakResult.areas.length -
          (outbreakResult.alertAreasCount + outbreakResult.risingAreasCount),
        totalPharmacies: stores.length,
        janAushadhiCount: stores.filter((s) => s.type === "JAN_AUSHADHI").length,
        criticalShortagesCount: shortages.length,
      },
      areas: outbreakResult.areas,
      heatmapPoints: outbreakResult.heatmapPoints,
      shortages,
      stores: storePins,
    });
  } catch (error) {
    console.error("Heatmap API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate outbreak surveillance data",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/heatmap
 * Broadcast official Health Department advisory to all pharmacies in an area
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { area, signalGroup = "FEVER", customMessage } = body;

    if (!area) {
      return NextResponse.json(
        { success: false, error: "Area is required to dispatch advisory" },
        { status: 400 }
      );
    }

    // Find all pharmacies in this area
    const stores = await db.store.findMany({
      where: {
        area: {
          contains: area,
        },
      },
    });

    const defaultMessage = `Health Dept Advisory for ${area}: Elevated demand detected for ${signalGroup.toLowerCase()}-related medicines. Please maintain buffer stock of essential antipyretics and ORS.`;
    const finalMessage = customMessage || defaultMessage;

    // Record advisory notification for each pharmacy
    for (const store of stores) {
      await db.message.create({
        data: {
          storeId: store.id,
          senderRole: "HEALTH_DEPT",
          text: finalMessage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      area,
      notifiedStoresCount: stores.length,
      storeNames: stores.map((s) => s.name),
      message: finalMessage,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Advisory dispatch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to broadcast health advisory" },
      { status: 500 }
    );
  }
}
