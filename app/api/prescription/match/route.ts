import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { optimizePrescriptionBasket, LUCKNOW_CENTER } from "@/lib/basket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const medicines: Array<{
      id: string;
      name: string;
      probable_brand?: string;
      salt?: string;
      strength?: string;
      dosageForm?: string;
    }> = body.medicines || [];

    const userLat = typeof body.userLat === "number" ? body.userLat : LUCKNOW_CENTER.lat;
    const userLng = typeof body.userLng === "number" ? body.userLng : LUCKNOW_CENTER.lng;

    // Fetch all active medicines with salts and stores inventory from DB
    const allDbMedicines = await db.medicine.findMany({
      include: {
        salts: {
          include: {
            salt: true,
          },
        },
        inventory: {
          where: { quantity: { gt: 0 } },
          include: {
            store: true,
          },
        },
      },
    });

    // Helper: normalize string for fuzzy comparison
    const norm = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const matchedMedicines = medicines.map((med) => {
      const searchTerms = [
        med.probable_brand || "",
        med.name || "",
        med.salt || "",
      ].filter(Boolean);

      let bestMatch: (typeof allDbMedicines)[0] | null = null;
      let highestScore = 0;

      for (const dbMed of allDbMedicines) {
        let score = 0;
        const dbBrandNorm = norm(dbMed.brandName);
        const dbSaltsNorm = dbMed.salts.map((s) => norm(s.salt.name)).join("");

        for (const term of searchTerms) {
          const tNorm = norm(term);
          if (!tNorm) continue;

          if (dbBrandNorm.includes(tNorm) || tNorm.includes(dbBrandNorm)) {
            score += 50;
          }
          if (dbSaltsNorm.includes(tNorm) || tNorm.includes(dbSaltsNorm)) {
            score += 40;
          }
          // Exact or partial salt name match
          dbMed.salts.forEach((s) => {
            const sNameNorm = norm(s.salt.name);
            if (sNameNorm && (sNameNorm.includes(tNorm) || tNorm.includes(sNameNorm))) {
              score += 30;
            }
          });
        }

        // Dosage form bonus
        if (med.dosageForm && norm(dbMed.dosageForm) === norm(med.dosageForm)) {
          score += 10;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = dbMed;
        }
      }

      // Default to best match or fallback first medicine if none found
      const primaryMedicine = bestMatch || allDbMedicines[0];

      // Find Generic or Jan Aushadhi substitute that shares at least one active salt
      const primarySaltIds = new Set(primaryMedicine.salts.map((s) => s.saltId));
      const substitutes = allDbMedicines.filter((candidate) => {
        if (candidate.id === primaryMedicine.id) return false;
        // Check if candidate shares the active salts
        const sharesSalt = candidate.salts.some((s) => primarySaltIds.has(s.saltId));
        return sharesSalt && (candidate.isJanAushadhi || candidate.isGeneric);
      });

      // Sort substitutes by price ascending (cheapest / highest savings first)
      substitutes.sort((a, b) => a.mrp - b.mrp);
      const bestGeneric = substitutes.length > 0 ? substitutes[0] : null;

      // Calculate savings if switching from branded to generic
      let savingsAmount = 0;
      let savingsPercent = 0;
      if (bestGeneric && primaryMedicine.mrp > bestGeneric.mrp) {
        savingsAmount = Number((primaryMedicine.mrp - bestGeneric.mrp).toFixed(1));
        savingsPercent = Number(((savingsAmount / primaryMedicine.mrp) * 100).toFixed(0));
      }

      // Calculate lowest available price in nearby inventory
      let lowestAvailablePrice = primaryMedicine.mrp;
      let inStockStoresCount = 0;
      if (primaryMedicine.inventory.length > 0) {
        lowestAvailablePrice = Math.min(...primaryMedicine.inventory.map((i) => i.sellingPrice));
        inStockStoresCount = primaryMedicine.inventory.length;
      }

      let lowestGenericPrice = bestGeneric?.mrp || null;
      let inStockGenericStoresCount = 0;
      if (bestGeneric && bestGeneric.inventory.length > 0) {
        lowestGenericPrice = Math.min(...bestGeneric.inventory.map((i) => i.sellingPrice));
        inStockGenericStoresCount = bestGeneric.inventory.length;
      }

      return {
        prescribedName: med.name,
        extractedItem: med,
        dbMedicine: {
          id: primaryMedicine.id,
          brandName: primaryMedicine.brandName,
          manufacturer: primaryMedicine.manufacturer,
          dosageForm: primaryMedicine.dosageForm,
          packSize: primaryMedicine.packSize,
          mrp: primaryMedicine.mrp,
          isJanAushadhi: primaryMedicine.isJanAushadhi,
          isGeneric: primaryMedicine.isGeneric,
          lowestPrice: lowestAvailablePrice,
          inStockCount: inStockStoresCount,
          salts: primaryMedicine.salts.map((s) => ({
            name: s.salt.name,
            strength: s.strength,
            category: s.salt.category,
            isNarrowTherapeuticIndex: s.salt.isNarrowTherapeuticIndex,
          })),
        },
        genericSubstitute: bestGeneric
          ? {
              id: bestGeneric.id,
              brandName: bestGeneric.brandName,
              manufacturer: bestGeneric.manufacturer,
              mrp: bestGeneric.mrp,
              lowestPrice: lowestGenericPrice,
              isJanAushadhi: bestGeneric.isJanAushadhi,
              inStockCount: inStockGenericStoresCount,
              savingsAmount,
              savingsPercent,
            }
          : null,
      };
    });

    // Run basket optimization for all requested medicines
    const requestedItemsForBasket = matchedMedicines.map((m) => ({
      id: m.dbMedicine.id,
      name: m.dbMedicine.brandName,
      mrp: m.dbMedicine.mrp,
    }));

    const basketResult = await optimizePrescriptionBasket(
      requestedItemsForBasket,
      userLat,
      userLng
    );

    return NextResponse.json({
      success: true,
      matches: matchedMedicines,
      basket: basketResult,
    });
  } catch (error: any) {
    console.error("Prescription match route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to match medicines" },
      { status: 500 }
    );
  }
}
