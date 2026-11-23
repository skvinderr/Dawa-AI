import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET inventory for a store or list of stores
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    // If no storeId, return all stores for selection dropdown
    if (!storeId) {
      const stores = await db.store.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          area: true,
          address: true,
          phone: true,
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ success: true, stores });
    }

    const inventory = await db.inventory.findMany({
      where: { storeId },
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
    });

    const store = await db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        type: true,
        area: true,
        phone: true,
        address: true,
      },
    });

    return NextResponse.json({
      success: true,
      store,
      inventory: inventory.map((inv) => ({
        id: inv.id,
        storeId: inv.storeId,
        medicineId: inv.medicineId,
        brandName: inv.medicine.brandName,
        manufacturer: inv.medicine.manufacturer,
        dosageForm: inv.medicine.dosageForm,
        packSize: inv.medicine.packSize,
        mrp: inv.medicine.mrp,
        sellingPrice: inv.sellingPrice,
        quantity: inv.quantity,
        batchNo: inv.batchNo,
        expiryDate: inv.expiryDate,
        isJanAushadhi: inv.medicine.isJanAushadhi,
        isGeneric: inv.medicine.isGeneric,
        salts: inv.medicine.salts.map((s) => ({
          name: s.salt.name,
          strength: s.strength,
        })),
      })),
    });
  } catch (error) {
    console.error("Shop inventory GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shop inventory" },
      { status: 500 }
    );
  }
}

// PATCH update quantity or selling price
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { inventoryId, quantity, sellingPrice } = body;

    if (!inventoryId) {
      return NextResponse.json(
        { success: false, error: "Inventory ID required" },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (typeof quantity === "number") {
      dataToUpdate.quantity = Math.max(0, quantity);
    }
    if (typeof sellingPrice === "number") {
      dataToUpdate.sellingPrice = Math.max(0, sellingPrice);
    }

    const updated = await db.inventory.update({
      where: { id: inventoryId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Shop inventory PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
