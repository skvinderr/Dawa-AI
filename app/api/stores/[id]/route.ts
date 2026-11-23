import { NextResponse } from "next/server";
import { db, isStoreOpenNow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id;

    const store = await db.store.findUnique({
      where: { id: storeId },
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
          orderBy: {
            medicine: {
              brandName: "asc",
            },
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    const isOpen = isStoreOpenNow(store.openHours);

    // Format inventory items
    const inventory = store.inventory.map((inv) => {
      const med = inv.medicine;
      const discountPercent =
        med.mrp > 0 && inv.sellingPrice < med.mrp
          ? Math.round(((med.mrp - inv.sellingPrice) / med.mrp) * 100)
          : 0;

      const stockStatus =
        inv.quantity <= 0
          ? "OUT_OF_STOCK"
          : inv.quantity < 10
          ? "LOW_STOCK"
          : "IN_STOCK";

      return {
        inventoryId: inv.id,
        medicineId: med.id,
        brandName: med.brandName,
        manufacturer: med.manufacturer,
        dosageForm: med.dosageForm,
        packSize: med.packSize,
        mrp: med.mrp,
        sellingPrice: inv.sellingPrice,
        discountPercent,
        quantity: inv.quantity,
        stockStatus,
        batchNo: inv.batchNo,
        expiryDate: inv.expiryDate,
        isGeneric: med.isGeneric,
        isJanAushadhi: med.isJanAushadhi,
        isScheduledPriceControlled: med.isScheduledPriceControlled,
        ceilingPrice: med.ceilingPrice,
        salts: med.salts.map((ms) => ({
          saltId: ms.salt.id,
          name: ms.salt.name,
          category: ms.salt.category,
          strength: ms.strength,
          isNarrowTherapeuticIndex: ms.salt.isNarrowTherapeuticIndex,
        })),
      };
    });

    // Summary counts
    const totalSkus = inventory.length;
    const inStockSkus = inventory.filter((i) => i.quantity > 0).length;
    const janAushadhiSkus = inventory.filter((i) => i.isJanAushadhi).length;
    const averageSavingsPercent =
      inventory.length > 0
        ? Math.round(
            inventory.reduce((acc, i) => acc + i.discountPercent, 0) / inventory.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        type: store.type,
        address: store.address,
        area: store.area,
        lat: store.lat,
        lng: store.lng,
        phone: store.phone,
        ownerName: store.ownerName,
        openHours: store.openHours,
        isOpenNow: isOpen,
        isVerified: store.isVerified,
        stats: {
          totalSkus,
          inStockSkus,
          janAushadhiSkus,
          averageSavingsPercent,
        },
        inventory,
      },
    });
  } catch (error) {
    console.error("Store detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch store details" },
      { status: 500 }
    );
  }
}
