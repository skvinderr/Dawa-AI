import { db } from "./db";

export interface BasketMedicineItem {
  medicineId: string;
  name: string;
  genericName?: string;
  mrp: number;
}

export interface StoreBasketMatch {
  storeId: string;
  storeName: string;
  storeType: string;
  area: string;
  address: string;
  phone: string;
  openHours: string;
  lat: number;
  lng: number;
  distanceKm: number;
  matchedCount: number;
  totalRequested: number;
  availableItems: Array<{
    medicineId: string;
    brandName: string;
    sellingPrice: number;
    mrp: number;
    quantity: number;
    isJanAushadhi: boolean;
  }>;
  missingItems: Array<{
    medicineId: string;
    name: string;
  }>;
  totalCost: number;
  totalMrp: number;
  totalSavings: number;
  savingsPercent: number;
  score: number;
}

export interface TwoStoreCombo {
  storeA: StoreBasketMatch;
  storeB: StoreBasketMatch;
  itemsFromA: Array<{ medicineId: string; brandName: string; price: number }>;
  itemsFromB: Array<{ medicineId: string; brandName: string; price: number }>;
  combinedMatchedCount: number;
  totalRequested: number;
  missingItems: Array<{ medicineId: string; name: string }>;
  totalCost: number;
  totalSavings: number;
  combinedDistanceKm: number;
}

export interface BasketOptimizerResult {
  bestSingleStore: StoreBasketMatch | null;
  bestTwoStoreCombo: TwoStoreCombo | null;
  rankedStores: StoreBasketMatch[];
  userLocation: { lat: number; lng: number };
}

/**
 * Haversine distance formula between two lat/lng points in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Default central Lucknow location (Hazratganj)
export const LUCKNOW_CENTER = { lat: 26.8528, lng: 80.9463 };

/**
 * Find single store and 2-store combination that stocks maximum medicines, nearest & cheapest
 */
export async function optimizePrescriptionBasket(
  requestedMedicines: Array<{ id: string; name: string; mrp?: number }>,
  userLat: number = LUCKNOW_CENTER.lat,
  userLng: number = LUCKNOW_CENTER.lng
): Promise<BasketOptimizerResult> {
  if (!requestedMedicines || requestedMedicines.length === 0) {
    return {
      bestSingleStore: null,
      bestTwoStoreCombo: null,
      rankedStores: [],
      userLocation: { lat: userLat, lng: userLng },
    };
  }

  const requestedIds = requestedMedicines.map((m) => m.id);

  // 1. Fetch all stores with inventory for requested medicines
  const stores = await db.store.findMany({
    include: {
      inventory: {
        where: {
          medicineId: { in: requestedIds },
          quantity: { gt: 0 },
        },
        include: {
          medicine: true,
        },
      },
    },
  });

  // 2. Evaluate each store
  const storeMatches: StoreBasketMatch[] = stores.map((store) => {
    const distanceKm = calculateDistanceKm(userLat, userLng, store.lat, store.lng);

    const availableMap = new Map<string, (typeof store.inventory)[0]>();
    store.inventory.forEach((inv) => {
      // Pick best selling price if duplicates exist
      if (!availableMap.has(inv.medicineId) || inv.sellingPrice < availableMap.get(inv.medicineId)!.sellingPrice) {
        availableMap.set(inv.medicineId, inv);
      }
    });

    const availableItems = Array.from(availableMap.values()).map((inv) => ({
      medicineId: inv.medicineId,
      brandName: inv.medicine.brandName,
      sellingPrice: inv.sellingPrice,
      mrp: inv.medicine.mrp,
      quantity: inv.quantity,
      isJanAushadhi: inv.medicine.isJanAushadhi,
    }));

    const availableIdSet = new Set(availableItems.map((i) => i.medicineId));
    const missingItems = requestedMedicines
      .filter((m) => !availableIdSet.has(m.id))
      .map((m) => ({ medicineId: m.id, name: m.name }));

    const totalCost = Number(availableItems.reduce((acc, item) => acc + item.sellingPrice, 0).toFixed(2));
    const totalMrp = Number(availableItems.reduce((acc, item) => acc + item.mrp, 0).toFixed(2));
    const totalSavings = Number(Math.max(0, totalMrp - totalCost).toFixed(2));
    const savingsPercent = totalMrp > 0 ? Number(((totalSavings / totalMrp) * 100).toFixed(1)) : 0;

    // Scoring formula:
    // Heavy reward for number of items matched (+100 per matched item)
    // Distance penalty (-3 points per km)
    // Savings bonus (+0.2 per rupee saved)
    const score = availableItems.length * 100 - distanceKm * 3 + totalSavings * 0.2;

    return {
      storeId: store.id,
      storeName: store.name,
      storeType: store.type,
      area: store.area,
      address: store.address,
      phone: store.phone,
      openHours: store.openHours,
      lat: store.lat,
      lng: store.lng,
      distanceKm,
      matchedCount: availableItems.length,
      totalRequested: requestedMedicines.length,
      availableItems,
      missingItems,
      totalCost,
      totalMrp,
      totalSavings,
      savingsPercent,
      score,
    };
  });

  // Sort ranked stores:
  // 1st: matchedCount desc
  // 2nd: distanceKm asc
  // 3rd: totalCost asc
  storeMatches.sort((a, b) => {
    if (b.matchedCount !== a.matchedCount) {
      return b.matchedCount - a.matchedCount;
    }
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return a.totalCost - b.totalCost;
  });

  const bestSingleStore = storeMatches.length > 0 ? storeMatches[0] : null;

  // 3. Compute best 2-store combination if single store doesn't have 100% or to maximize savings
  let bestTwoStoreCombo: TwoStoreCombo | null = null;
  const totalRequestedCount = requestedMedicines.length;

  // Search top candidates for 2-store pairing
  const candidateStores = storeMatches.slice(0, 12);
  let bestComboScore = -Infinity;

  for (let i = 0; i < candidateStores.length; i++) {
    for (let j = i + 1; j < candidateStores.length; j++) {
      const sA = candidateStores[i];
      const sB = candidateStores[j];

      const unionSet = new Set<string>();
      const itemsA: Array<{ medicineId: string; brandName: string; price: number }> = [];
      const itemsB: Array<{ medicineId: string; brandName: string; price: number }> = [];

      requestedMedicines.forEach((med) => {
        const itemA = sA.availableItems.find((x) => x.medicineId === med.id);
        const itemB = sB.availableItems.find((x) => x.medicineId === med.id);

        if (itemA && itemB) {
          // Both have it: pick cheaper one or Jan Aushadhi
          if (itemA.sellingPrice <= itemB.sellingPrice) {
            itemsA.push({ medicineId: med.id, brandName: itemA.brandName, price: itemA.sellingPrice });
          } else {
            itemsB.push({ medicineId: med.id, brandName: itemB.brandName, price: itemB.sellingPrice });
          }
          unionSet.add(med.id);
        } else if (itemA) {
          itemsA.push({ medicineId: med.id, brandName: itemA.brandName, price: itemA.sellingPrice });
          unionSet.add(med.id);
        } else if (itemB) {
          itemsB.push({ medicineId: med.id, brandName: itemB.brandName, price: itemB.sellingPrice });
          unionSet.add(med.id);
        }
      });

      const combinedMatched = unionSet.size;
      // If combo matches more than store A alone or matches all items
      if (combinedMatched >= sA.matchedCount) {
        const totalComboCost = Number(
          (
            itemsA.reduce((sum, item) => sum + item.price, 0) +
            itemsB.reduce((sum, item) => sum + item.price, 0)
          ).toFixed(2)
        );

        const totalComboMrp = Number(
          requestedMedicines
            .filter((m) => unionSet.has(m.id))
            .reduce((sum, m) => sum + (m.mrp || 0), 0)
            .toFixed(2)
        );

        const totalComboSavings = Number(Math.max(0, totalComboMrp - totalComboCost).toFixed(2));
        const combinedDist = Number((sA.distanceKm + sB.distanceKm).toFixed(2));

        // Combo score: strong priority to higher combined coverage
        const comboScore =
          combinedMatched * 150 -
          combinedDist * 4 +
          totalComboSavings * 0.25;

        if (comboScore > bestComboScore) {
          bestComboScore = comboScore;
          const missing = requestedMedicines
            .filter((m) => !unionSet.has(m.id))
            .map((m) => ({ medicineId: m.id, name: m.name }));

          bestTwoStoreCombo = {
            storeA: sA,
            storeB: sB,
            itemsFromA: itemsA,
            itemsFromB: itemsB,
            combinedMatchedCount: combinedMatched,
            totalRequested: totalRequestedCount,
            missingItems: missing,
            totalCost: totalComboCost,
            totalSavings: totalComboSavings,
            combinedDistanceKm: combinedDist,
          };
        }
      }
    }
  }

  return {
    bestSingleStore,
    bestTwoStoreCombo,
    rankedStores: storeMatches,
    userLocation: { lat: userLat, lng: userLng },
  };
}
