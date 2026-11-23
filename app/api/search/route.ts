import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const area = searchParams.get("area") || "Hazratganj";

    let medicines;

    if (!query) {
      // Return popular medicines
      medicines = await db.medicine.findMany({
        take: 12,
        include: {
          salts: {
            include: { salt: true },
          },
          inventory: {
            where: { quantity: { gt: 0 } },
            include: { store: true },
          },
        },
        orderBy: { mrp: "desc" },
      });
    } else {
      // Fuzzy search by brandName or salt name
      medicines = await db.medicine.findMany({
        where: {
          OR: [
            { brandName: { contains: query } },
            {
              salts: {
                some: {
                  salt: {
                    name: { contains: query },
                  },
                },
              },
            },
          ],
        },
        include: {
          salts: {
            include: { salt: true },
          },
          inventory: {
            where: { quantity: { gt: 0 } },
            include: { store: true },
          },
        },
        take: 20,
      });

      // Log SearchEvent telemetry (area-level, no PII)
      try {
        await db.searchEvent.create({
          data: {
            query,
            area,
            lat: 26.8528,
            lng: 80.9463,
            medicineId: medicines.length > 0 ? medicines[0].id : null,
            saltId: medicines.length > 0 && medicines[0].salts.length > 0 ? medicines[0].salts[0].saltId : null,
          },
        });
      } catch (logErr) {
        console.warn("SearchEvent logging skipped:", logErr);
      }
    }

    const formatted = medicines.map((m) => {
      const inStockStores = m.inventory.map((inv) => ({
        storeId: inv.store.id,
        storeName: inv.store.name,
        storeType: inv.store.type,
        area: inv.store.area,
        sellingPrice: inv.sellingPrice,
        quantity: inv.quantity,
      }));

      return {
        id: m.id,
        brandName: m.brandName,
        manufacturer: m.manufacturer,
        dosageForm: m.dosageForm,
        packSize: m.packSize,
        mrp: m.mrp,
        unitPrice: Number((m.mrp / Math.max(1, m.packSize)).toFixed(2)),
        isJanAushadhi: m.isJanAushadhi,
        isGeneric: m.isGeneric,
        isScheduledPriceControlled: m.isScheduledPriceControlled,
        ceilingPrice: m.ceilingPrice,
        salts: m.salts.map((s) => ({
          name: s.salt.name,
          strength: s.strength,
          category: s.salt.category,
          isNarrowTherapeuticIndex: s.salt.isNarrowTherapeuticIndex,
        })),
        inStockCount: inStockStores.length,
        lowestPrice: inStockStores.length > 0 ? Math.min(...inStockStores.map((s) => s.sellingPrice)) : m.mrp,
      };
    });

    return NextResponse.json({
      success: true,
      query,
      count: formatted.length,
      medicines: formatted,
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Search failed" },
      { status: 500 }
    );
  }
}
