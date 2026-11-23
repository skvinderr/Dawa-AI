import { db } from "./db";
import { calculateDistanceKm, LUCKNOW_CENTER } from "./basket";

export type SubstituteTier = "Jan Aushadhi" | "Generic" | "Cheaper brand";

export interface SaltComponent {
  saltId: string;
  name: string;
  strength: string;
  category?: string;
  isNarrowTherapeuticIndex?: boolean;
}

export interface StoreInventoryStock {
  storeId: string;
  storeName: string;
  storeType: string;
  area: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  sellingPrice: number;
  unitPrice: number;
  quantity: number;
}

export interface SubstituteCandidate {
  id: string;
  brandName: string;
  manufacturer: string;
  dosageForm: string;
  packSize: number;
  mrp: number;
  unitPriceMrp: number; // mrp / packSize
  isGeneric: boolean;
  isJanAushadhi: boolean;
  isScheduledPriceControlled: boolean;
  ceilingPrice?: number | null;
  salts: SaltComponent[];
  inStockStores?: StoreInventoryStock[];
}

export interface MatchComparisonItem {
  attribute: string;
  originalValue: string;
  substituteValue: string;
  isExactMatch: boolean;
}

export interface SubstituteResult {
  id: string;
  brandName: string;
  manufacturer: string;
  dosageForm: string;
  packSize: number;
  mrp: number;
  tier: SubstituteTier;
  effectiveUnitPrice: number; // lowest sellingPrice / packSize among nearby stores
  effectivePackPrice: number;
  unitSavings: number; // originalUnitPrice - effectiveUnitPrice
  savingsPercent: number; // (unitSavings / originalUnitPrice) * 100
  savingsPerPackOfOriginal: number; // unitSavings * original.packSize
  nearestStore?: StoreInventoryStock | null;
  inStockStoresCount: number;
  matchExplanation: {
    comparisonTable: MatchComparisonItem[];
    whyMatchSummary: string;
  };
}

export interface SubstitutionEngineResponse {
  originalMedicine: {
    id: string;
    brandName: string;
    manufacturer: string;
    dosageForm: string;
    packSize: number;
    mrp: number;
    unitPrice: number;
    salts: SaltComponent[];
  };
  substitutes: SubstituteResult[];
  maxSavingsAmount: number;
  maxSavingsPercent: number;
  isNarrowTherapeuticIndex: boolean;
  safetyNotice: string | null;
  disclaimer: string;
}

export interface SubstitutionOptions {
  userLat?: number;
  userLng?: number;
  onlyInStock?: boolean;
}

export const MANDATORY_DISCLAIMER =
  "Substitutes have the same active ingredient and strength. Confirm with your doctor or pharmacist before switching.";

export const NTI_SAFETY_WARNING =
  "This medicine needs careful dosing. Please consult your doctor before switching brands.";

/**
 * Pure deterministic substitution engine logic
 * Matches exact composition, exact strength, exact dosage form, and ranks by unit price.
 */
export function findSubstitutesPure(
  original: SubstituteCandidate,
  allCandidates: SubstituteCandidate[],
  options: SubstitutionOptions = {}
): SubstitutionEngineResponse {
  const { userLat = LUCKNOW_CENTER.lat, userLng = LUCKNOW_CENTER.lng, onlyInStock = true } = options;

  const originalUnitPrice = Number((original.mrp / Math.max(1, original.packSize)).toFixed(2));
  const normForm = original.dosageForm.trim().toLowerCase();

  // Check if any active salt has narrow therapeutic index
  const isNarrowTherapeuticIndex = original.salts.some(
    (s) => Boolean(s.isNarrowTherapeuticIndex)
  );

  // Map of original salts by saltId: key = saltId, value = normalized strength
  const origSaltMap = new Map<string, string>();
  original.salts.forEach((s) => {
    origSaltMap.set(s.saltId, s.strength.trim().toLowerCase());
  });

  const matchingResults: SubstituteResult[] = [];

  for (const candidate of allCandidates) {
    // 0. Cannot substitute with itself
    if (candidate.id === original.id) continue;

    // 1. Same dosage form check (tablet vs tablet, capsule vs capsule, etc. Never substitute across forms)
    if (candidate.dosageForm.trim().toLowerCase() !== normForm) {
      continue;
    }

    // 2. Exact composition count check (combinations must match all components, no extra, no missing)
    if (candidate.salts.length !== original.salts.length) {
      continue;
    }

    // 3. Exact salt IDs and exact strength check
    let allSaltsMatch = true;
    for (const candSalt of candidate.salts) {
      const origStrength = origSaltMap.get(candSalt.saltId);
      if (!origStrength) {
        allSaltsMatch = false;
        break;
      }
      if (origStrength !== candSalt.strength.trim().toLowerCase()) {
        allSaltsMatch = false;
        break;
      }
    }
    if (!allSaltsMatch) {
      continue;
    }

    // 4. In-stock and price-per-unit check
    const inStockStores = candidate.inStockStores || [];
    const validStores = inStockStores.filter((s) => s.quantity > 0);

    if (onlyInStock && inStockStores.length > 0 && validStores.length === 0) {
      // Out of stock in all stores
      continue;
    }

    // Determine effective unit price:
    // If stores available, take lowest unit price among in-stock stores.
    // Otherwise fallback to candidate's own MRP unit price.
    let effectiveUnitPrice = Number(
      (candidate.mrp / Math.max(1, candidate.packSize)).toFixed(2)
    );
    let effectivePackPrice = candidate.mrp;
    let nearestStore: StoreInventoryStock | null = null;

    if (validStores.length > 0) {
      // Sort stores by lowest unitPrice, then nearest distance
      const sortedStores = [...validStores].sort((a, b) => {
        if (a.unitPrice !== b.unitPrice) return a.unitPrice - b.unitPrice;
        return a.distanceKm - b.distanceKm;
      });
      nearestStore = sortedStores[0];
      effectiveUnitPrice = nearestStore.unitPrice;
      effectivePackPrice = nearestStore.sellingPrice;
    }

    // Calculate unit savings
    const unitSavings = Number(Math.max(0, originalUnitPrice - effectiveUnitPrice).toFixed(2));
    const savingsPercent =
      originalUnitPrice > 0
        ? Number(((unitSavings / originalUnitPrice) * 100).toFixed(1))
        : 0;

    const savingsPerPackOfOriginal = Number(
      (unitSavings * original.packSize).toFixed(1)
    );

    // 5. Classify tier: Jan Aushadhi | Generic | Cheaper brand
    let tier: SubstituteTier = "Cheaper brand";
    if (candidate.isJanAushadhi) {
      tier = "Jan Aushadhi";
    } else if (candidate.isGeneric) {
      tier = "Generic";
    }

    // 6. Transparent comparison table ("Why is this a match?")
    const origSaltsText = original.salts
      .map((s) => `${s.name} (${s.strength})`)
      .sort()
      .join(" + ");
    const candSaltsText = candidate.salts
      .map((s) => `${s.name} (${s.strength})`)
      .sort()
      .join(" + ");

    const comparisonTable: MatchComparisonItem[] = [
      {
        attribute: "Active Composition",
        originalValue: origSaltsText,
        substituteValue: candSaltsText,
        isExactMatch: true,
      },
      {
        attribute: "Dosage Form",
        originalValue: original.dosageForm,
        substituteValue: candidate.dosageForm,
        isExactMatch: true,
      },
      {
        attribute: "Pack Size",
        originalValue: `${original.packSize} units`,
        substituteValue: `${candidate.packSize} units`,
        isExactMatch: original.packSize === candidate.packSize,
      },
      {
        attribute: "Pack MRP",
        originalValue: `₹${original.mrp.toFixed(1)}`,
        substituteValue: `₹${candidate.mrp.toFixed(1)}`,
        isExactMatch: false,
      },
      {
        attribute: "Price Per Unit (Fair Comparison)",
        originalValue: `₹${originalUnitPrice.toFixed(2)} / unit`,
        substituteValue: `₹${effectiveUnitPrice.toFixed(2)} / unit`,
        isExactMatch: false,
      },
    ];

    const whyMatchSummary = `Exact biological salt bioequivalence: contains identical active ${origSaltsText} in ${original.dosageForm} form. Evaluated on price per unit to account for pack size variance.`;

    matchingResults.push({
      id: candidate.id,
      brandName: candidate.brandName,
      manufacturer: candidate.manufacturer,
      dosageForm: candidate.dosageForm,
      packSize: candidate.packSize,
      mrp: candidate.mrp,
      tier,
      effectiveUnitPrice,
      effectivePackPrice,
      unitSavings,
      savingsPercent,
      savingsPerPackOfOriginal,
      nearestStore,
      inStockStoresCount: validStores.length,
      matchExplanation: {
        comparisonTable,
        whyMatchSummary,
      },
    });
  }

  // 7. Rank by lowest effective unit price ascending (cheapest per unit first)
  matchingResults.sort((a, b) => {
    if (a.effectiveUnitPrice !== b.effectiveUnitPrice) {
      return a.effectiveUnitPrice - b.effectiveUnitPrice;
    }
    // If same unit price, prioritize Jan Aushadhi
    if (a.tier === "Jan Aushadhi" && b.tier !== "Jan Aushadhi") return -1;
    if (b.tier === "Jan Aushadhi" && a.tier !== "Jan Aushadhi") return 1;
    return 0;
  });

  const maxSavingsAmount =
    matchingResults.length > 0
      ? Math.max(...matchingResults.map((r) => r.savingsPerPackOfOriginal))
      : 0;

  const maxSavingsPercent =
    matchingResults.length > 0
      ? Math.max(...matchingResults.map((r) => r.savingsPercent))
      : 0;

  return {
    originalMedicine: {
      id: original.id,
      brandName: original.brandName,
      manufacturer: original.manufacturer,
      dosageForm: original.dosageForm,
      packSize: original.packSize,
      mrp: original.mrp,
      unitPrice: originalUnitPrice,
      salts: original.salts,
    },
    substitutes: matchingResults,
    maxSavingsAmount,
    maxSavingsPercent,
    isNarrowTherapeuticIndex,
    safetyNotice: isNarrowTherapeuticIndex ? NTI_SAFETY_WARNING : null,
    disclaimer: MANDATORY_DISCLAIMER,
  };
}

/**
 * Database wrapper to fetch medicine from SQLite and run the substitution engine
 */
export async function getSubstitutesForMedicine(
  medicineId: string,
  options: SubstitutionOptions = {}
): Promise<SubstitutionEngineResponse | null> {
  const { userLat = LUCKNOW_CENTER.lat, userLng = LUCKNOW_CENTER.lng, onlyInStock = true } = options;

  // 1. Fetch original medicine with its salts
  const origDb = await db.medicine.findUnique({
    where: { id: medicineId },
    include: {
      salts: {
        include: { salt: true },
      },
    },
  });

  if (!origDb) return null;

  const originalCandidate: SubstituteCandidate = {
    id: origDb.id,
    brandName: origDb.brandName,
    manufacturer: origDb.manufacturer,
    dosageForm: origDb.dosageForm,
    packSize: origDb.packSize,
    mrp: origDb.mrp,
    unitPriceMrp: origDb.mrp / Math.max(1, origDb.packSize),
    isGeneric: origDb.isGeneric,
    isJanAushadhi: origDb.isJanAushadhi,
    isScheduledPriceControlled: origDb.isScheduledPriceControlled,
    ceilingPrice: origDb.ceilingPrice,
    salts: origDb.salts.map((s) => ({
      saltId: s.saltId,
      name: s.salt.name,
      strength: s.strength,
      category: s.salt.category,
      isNarrowTherapeuticIndex: s.salt.isNarrowTherapeuticIndex,
    })),
  };

  // 2. Fetch all medicines with same dosage form that have at least one overlapping salt
  const saltIds = originalCandidate.salts.map((s) => s.saltId);

  const potentialCandidates = await db.medicine.findMany({
    where: {
      id: { not: medicineId },
      dosageForm: {
        equals: origDb.dosageForm,
      },
      salts: {
        some: {
          saltId: { in: saltIds },
        },
      },
    },
    include: {
      salts: {
        include: { salt: true },
      },
      inventory: {
        where: onlyInStock ? { quantity: { gt: 0 } } : undefined,
        include: { store: true },
      },
    },
  });

  // Map to SubstituteCandidate list
  const mappedCandidates: SubstituteCandidate[] = potentialCandidates.map((c) => {
    const inStockStores: StoreInventoryStock[] = c.inventory.map((inv) => {
      const distanceKm = calculateDistanceKm(userLat, userLng, inv.store.lat, inv.store.lng);
      const unitPrice = Number((inv.sellingPrice / Math.max(1, c.packSize)).toFixed(2));
      return {
        storeId: inv.storeId,
        storeName: inv.store.name,
        storeType: inv.store.type,
        area: inv.store.area,
        address: inv.store.address,
        phone: inv.store.phone,
        lat: inv.store.lat,
        lng: inv.store.lng,
        distanceKm,
        sellingPrice: inv.sellingPrice,
        unitPrice,
        quantity: inv.quantity,
      };
    });

    return {
      id: c.id,
      brandName: c.brandName,
      manufacturer: c.manufacturer,
      dosageForm: c.dosageForm,
      packSize: c.packSize,
      mrp: c.mrp,
      unitPriceMrp: c.mrp / Math.max(1, c.packSize),
      isGeneric: c.isGeneric,
      isJanAushadhi: c.isJanAushadhi,
      isScheduledPriceControlled: c.isScheduledPriceControlled,
      ceilingPrice: c.ceilingPrice,
      salts: c.salts.map((s) => ({
        saltId: s.saltId,
        name: s.salt.name,
        strength: s.strength,
        category: s.salt.category,
        isNarrowTherapeuticIndex: s.salt.isNarrowTherapeuticIndex,
      })),
      inStockStores,
    };
  });

  return findSubstitutesPure(originalCandidate, mappedCandidates, options);
}
