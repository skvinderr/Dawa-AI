import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, items = [] } = body;

    if (!storeId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "storeId and at least one item required" },
        { status: 400 }
      );
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Pharmacy store not found" },
        { status: 404 }
      );
    }

    let updatedCount = 0;
    let newMedicinesCreated = 0;
    const processedItems: any[] = [];

    await db.$transaction(async (tx) => {
      for (const item of items) {
        let targetMedicineId = item.matchedMedicineId;

        // If unmatched or marked as new medicine, create in Medicine table
        if (!targetMedicineId || item.isNewMedicine) {
          const newMed = await tx.medicine.create({
            data: {
              brandName: item.productName || "New Medicine",
              manufacturer: item.manufacturer || "Generic Pharma",
              dosageForm: item.dosageForm || "tablet",
              packSize: item.packSize ? Number(item.packSize) : 10,
              mrp: Number(item.mrp) || 100,
              ceilingPrice: item.ceilingPrice ? Number(item.ceilingPrice) : null,
              isScheduledPriceControlled: item.isScheduledPriceControlled || false,
              isGeneric: true,
              isJanAushadhi: false,
            },
          });
          targetMedicineId = newMed.id;
          newMedicinesCreated += 1;
        }

        const qtyToAdd = Math.max(1, parseInt(item.quantity, 10) || 10);
        const sellingPrice = Number(item.sellingPrice) || Number(item.mrp) || 50;
        const batchNo = (item.batchNo || "BATCH-GEN").trim();
        const expiryDate = item.expiryDate
          ? new Date(item.expiryDate)
          : new Date(Date.now() + 365 * 24 * 3600 * 1000);

        // Check if an inventory row exists for this store + medicine
        const existingInv = await tx.inventory.findFirst({
          where: {
            storeId,
            medicineId: targetMedicineId,
          },
        });

        if (existingInv) {
          // Increment quantity and update batch/expiry/price
          const updated = await tx.inventory.update({
            where: { id: existingInv.id },
            data: {
              quantity: existingInv.quantity + qtyToAdd,
              sellingPrice,
              batchNo,
              expiryDate,
              lastUpdated: new Date(),
            },
          });
          updatedCount += 1;
          processedItems.push({
            name: item.productName,
            action: "INCREMENTED",
            quantityAdded: qtyToAdd,
            totalStock: updated.quantity,
          });
        } else {
          // Create new inventory record
          const created = await tx.inventory.create({
            data: {
              storeId,
              medicineId: targetMedicineId,
              quantity: qtyToAdd,
              sellingPrice,
              batchNo,
              expiryDate,
            },
          });
          updatedCount += 1;
          processedItems.push({
            name: item.productName,
            action: "CREATED",
            quantityAdded: qtyToAdd,
            totalStock: created.quantity,
          });
        }
      }
    });

    const summaryMessage = `${updatedCount} items updated, ${newMedicinesCreated} new medicines added`;

    return NextResponse.json({
      success: true,
      storeName: store.name,
      summary: {
        totalProcessed: items.length,
        updatedCount,
        newMedicinesCreated,
        message: summaryMessage,
      },
      details: processedItems,
    });
  } catch (error) {
    console.error("Bill confirm error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm and update pharmacy stock" },
      { status: 500 }
    );
  }
}
