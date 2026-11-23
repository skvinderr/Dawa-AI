import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  findSubstitutesPure,
  SubstituteCandidate,
  NTI_SAFETY_WARNING,
  MANDATORY_DISCLAIMER,
} from "../substitution";

describe("Generic Substitution Engine", () => {
  // Test 1: Exact Match (Single Salt)
  it("should match medicines with exact same salt and strength and classify Jan Aushadhi", () => {
    const target: SubstituteCandidate = {
      id: "med-dolo-650",
      brandName: "Dolo 650",
      manufacturer: "Micro Labs",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 34.0,
      unitPriceMrp: 2.27,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      salts: [
        {
          saltId: "salt-paracetamol",
          name: "Paracetamol",
          strength: "650mg",
          category: "analgesic",
          isNarrowTherapeuticIndex: false,
        },
      ],
    };

    const candidates: SubstituteCandidate[] = [
      {
        id: "med-janaushadhi-para-650",
        brandName: "Jan Aushadhi Paracetamol 650",
        manufacturer: "BPPI",
        dosageForm: "tablet",
        packSize: 15,
        mrp: 10.5,
        unitPriceMrp: 0.7,
        isGeneric: true,
        isJanAushadhi: true,
        isScheduledPriceControlled: false,
        salts: [
          {
            saltId: "salt-paracetamol",
            name: "Paracetamol",
            strength: "650mg",
            category: "analgesic",
            isNarrowTherapeuticIndex: false,
          },
        ],
        inStockStores: [
          {
            storeId: "store-1",
            storeName: "PM Jan Aushadhi Kendra Hazratganj",
            storeType: "JAN_AUSHADHI",
            area: "Hazratganj",
            address: "Park Road",
            phone: "+91 94150 88001",
            lat: 26.8528,
            lng: 80.9463,
            distanceKm: 0.5,
            sellingPrice: 10.5,
            unitPrice: 0.7,
            quantity: 50,
          },
        ],
      },
    ];

    const result = findSubstitutesPure(target, candidates);

    assert.equal(result.substitutes.length, 1);
    const sub = result.substitutes[0];
    assert.equal(sub.brandName, "Jan Aushadhi Paracetamol 650");
    assert.equal(sub.tier, "Jan Aushadhi");
    assert.equal(sub.effectiveUnitPrice, 0.7);
    assert.ok(sub.unitSavings > 1.5);
    assert.ok(sub.savingsPercent > 65);
    assert.equal(sub.matchExplanation.comparisonTable[0].isExactMatch, true);
  });

  // Test 2: Strength Mismatch Exclusion
  it("should exclude candidate if salt strength does not match (e.g. 500mg vs 650mg)", () => {
    const target: SubstituteCandidate = {
      id: "med-dolo-650",
      brandName: "Dolo 650",
      manufacturer: "Micro Labs",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 34.0,
      unitPriceMrp: 2.27,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      salts: [
        {
          saltId: "salt-paracetamol",
          name: "Paracetamol",
          strength: "650mg",
        },
      ],
    };

    const candidates: SubstituteCandidate[] = [
      {
        id: "med-crocin-500",
        brandName: "Crocin 500 Advance",
        manufacturer: "GSK",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 24.0,
        unitPriceMrp: 2.4,
        isGeneric: false,
        isJanAushadhi: false,
        isScheduledPriceControlled: true,
        salts: [
          {
            saltId: "salt-paracetamol",
            name: "Paracetamol",
            strength: "500mg", // Different strength!
          },
        ],
      },
    ];

    const result = findSubstitutesPure(target, candidates);
    assert.equal(result.substitutes.length, 0, "500mg must not be substituted for 650mg");
  });

  // Test 3: Dosage Form Mismatch Exclusion
  it("should exclude candidate if dosage form does not match (e.g. tablet vs syrup)", () => {
    const target: SubstituteCandidate = {
      id: "med-cough-syrup",
      brandName: "Benadryl DR Syrup",
      manufacturer: "J&J",
      dosageForm: "syrup",
      packSize: 1,
      mrp: 135.0,
      unitPriceMrp: 135.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        {
          saltId: "salt-dextromethorphan",
          name: "Dextromethorphan Hydrobromide",
          strength: "10mg/5ml",
        },
      ],
    };

    const candidates: SubstituteCandidate[] = [
      {
        id: "med-cough-tablet",
        brandName: "Dextromethorphan Lozenges/Tablet",
        manufacturer: "Cipla",
        dosageForm: "tablet", // Form mismatch: tablet vs syrup
        packSize: 10,
        mrp: 45.0,
        unitPriceMrp: 4.5,
        isGeneric: true,
        isJanAushadhi: false,
        isScheduledPriceControlled: false,
        salts: [
          {
            saltId: "salt-dextromethorphan",
            name: "Dextromethorphan Hydrobromide",
            strength: "10mg/5ml",
          },
        ],
      },
    ];

    const result = findSubstitutesPure(target, candidates);
    assert.equal(result.substitutes.length, 0, "Tablet must never be substituted for syrup");
  });

  // Test 4: Combination Drugs (Exact Multi-Salt Matching)
  it("should strictly match all components of combination medicines", () => {
    const targetAugmentin: SubstituteCandidate = {
      id: "med-augmentin-625",
      brandName: "Augmentin 625 Duo",
      manufacturer: "GSK",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 220.0,
      unitPriceMrp: 22.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      salts: [
        { saltId: "salt-amox", name: "Amoxicillin", strength: "500mg" },
        { saltId: "salt-clav", name: "Potassium Clavulanate", strength: "125mg" },
      ],
    };

    const candidates: SubstituteCandidate[] = [
      // Valid exact match: both Amox 500mg + Clav 125mg
      {
        id: "med-jan-amoxyclav-625",
        brandName: "Jan Aushadhi Amoxyclav 625",
        manufacturer: "BPPI",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 54.0,
        unitPriceMrp: 5.4,
        isGeneric: true,
        isJanAushadhi: true,
        isScheduledPriceControlled: false,
        salts: [
          { saltId: "salt-amox", name: "Amoxicillin", strength: "500mg" },
          { saltId: "salt-clav", name: "Potassium Clavulanate", strength: "125mg" },
        ],
      },
      // Invalid: missing Potassium Clavulanate
      {
        id: "med-novamox-500",
        brandName: "Novamox 500",
        manufacturer: "Cipla",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 92.0,
        unitPriceMrp: 9.2,
        isGeneric: false,
        isJanAushadhi: false,
        isScheduledPriceControlled: false,
        salts: [{ saltId: "salt-amox", name: "Amoxicillin", strength: "500mg" }],
      },
      // Invalid: Clavulanate strength mismatch (250mg instead of 125mg)
      {
        id: "med-amox-high-clav",
        brandName: "Amoxyclav High Strength",
        manufacturer: "Alkem",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 240.0,
        unitPriceMrp: 24.0,
        isGeneric: false,
        isJanAushadhi: false,
        isScheduledPriceControlled: false,
        salts: [
          { saltId: "salt-amox", name: "Amoxicillin", strength: "500mg" },
          { saltId: "salt-clav", name: "Potassium Clavulanate", strength: "250mg" },
        ],
      },
    ];

    const result = findSubstitutesPure(targetAugmentin, candidates);
    assert.equal(result.substitutes.length, 1);
    assert.equal(result.substitutes[0].brandName, "Jan Aushadhi Amoxyclav 625");
    assert.equal(result.substitutes[0].tier, "Jan Aushadhi");
  });

  // Test 5: Narrow-Therapeutic-Index (NTI) Safety Warning
  it("should detect narrow-therapeutic-index medicines and attach safety warning", () => {
    const targetThyroid: SubstituteCandidate = {
      id: "med-eltroxin-50",
      brandName: "Eltroxin 50mcg",
      manufacturer: "GSK",
      dosageForm: "tablet",
      packSize: 100,
      mrp: 165.0,
      unitPriceMrp: 1.65,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      salts: [
        {
          saltId: "salt-levothyroxine",
          name: "Levothyroxine Sodium",
          strength: "50mcg",
          isNarrowTherapeuticIndex: true, // NARROW THERAPEUTIC INDEX!
        },
      ],
    };

    const candidates: SubstituteCandidate[] = [
      {
        id: "med-thyronorm-50",
        brandName: "Thyronorm 50mcg",
        manufacturer: "Abbott",
        dosageForm: "tablet",
        packSize: 100,
        mrp: 172.0,
        unitPriceMrp: 1.72,
        isGeneric: false,
        isJanAushadhi: false,
        isScheduledPriceControlled: true,
        salts: [
          {
            saltId: "salt-levothyroxine",
            name: "Levothyroxine Sodium",
            strength: "50mcg",
            isNarrowTherapeuticIndex: true,
          },
        ],
      },
    ];

    const result = findSubstitutesPure(targetThyroid, candidates);
    assert.equal(result.isNarrowTherapeuticIndex, true);
    assert.equal(result.safetyNotice, NTI_SAFETY_WARNING);
    assert.ok(result.safetyNotice?.includes("careful dosing"));
  });

  // Test 6: Out-of-Stock Exclusion
  it("should exclude candidate if all stores have quantity 0 when onlyInStock is enabled", () => {
    const target: SubstituteCandidate = {
      id: "med-pantocid-40",
      brandName: "Pantocid 40",
      manufacturer: "Sun Pharma",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 122.0,
      unitPriceMrp: 12.2,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      salts: [
        { saltId: "salt-pantoprazole", name: "Pantoprazole", strength: "40mg" },
      ],
    };

    const candidates: SubstituteCandidate[] = [
      // Candidate A: In Stock (quantity = 20)
      {
        id: "med-jan-panto-40",
        brandName: "Jan Aushadhi Pantoprazole 40",
        manufacturer: "BPPI",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 22.0,
        unitPriceMrp: 2.2,
        isGeneric: true,
        isJanAushadhi: true,
        isScheduledPriceControlled: false,
        salts: [{ saltId: "salt-pantoprazole", name: "Pantoprazole", strength: "40mg" }],
        inStockStores: [
          {
            storeId: "store-1",
            storeName: "PM Jan Aushadhi Kendra",
            storeType: "JAN_AUSHADHI",
            area: "Gomti Nagar",
            address: "Patrakarpuram",
            phone: "+91 94150 88002",
            lat: 26.8504,
            lng: 80.9995,
            distanceKm: 1.2,
            sellingPrice: 22.0,
            unitPrice: 2.2,
            quantity: 20, // IN STOCK
          },
        ],
      },
      // Candidate B: Out of stock (quantity = 0 in all stores)
      {
        id: "med-out-of-stock-generic",
        brandName: "Generic Pantoprazole 40",
        manufacturer: "Local Lab",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 18.0,
        unitPriceMrp: 1.8,
        isGeneric: true,
        isJanAushadhi: false,
        isScheduledPriceControlled: false,
        salts: [{ saltId: "salt-pantoprazole", name: "Pantoprazole", strength: "40mg" }],
        inStockStores: [
          {
            storeId: "store-2",
            storeName: "Local Chemist",
            storeType: "PRIVATE",
            area: "Chowk",
            address: "Gol Darwaza",
            phone: "+91 94150 11014",
            lat: 26.8665,
            lng: 80.9152,
            distanceKm: 2.5,
            sellingPrice: 18.0,
            unitPrice: 1.8,
            quantity: 0, // OUT OF STOCK
          },
        ],
      },
    ];

    const result = findSubstitutesPure(target, candidates, { onlyInStock: true });
    assert.equal(result.substitutes.length, 1);
    assert.equal(result.substitutes[0].brandName, "Jan Aushadhi Pantoprazole 40");
  });

  // Test 7: Price-Per-Unit Ranking (Fair comparison across different pack sizes)
  it("should rank substitutes strictly by lowest price per unit (price / packSize)", () => {
    // Target: Telma 40 (Pack of 15, MRP ₹145 -> ₹9.67/unit)
    const targetTelma: SubstituteCandidate = {
      id: "med-telma-40",
      brandName: "Telma 40",
      manufacturer: "Glenmark",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 145.0,
      unitPriceMrp: 9.67,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      salts: [{ saltId: "salt-telmi", name: "Telmisartan", strength: "40mg" }],
    };

    const candidates: SubstituteCandidate[] = [
      // Candidate 1: Cheaper brand, Pack of 10, MRP ₹70 -> Unit price = ₹7.00
      {
        id: "cand-1-brand",
        brandName: "Telmikind 40",
        manufacturer: "Mankind",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 70.0,
        unitPriceMrp: 7.0,
        isGeneric: false,
        isJanAushadhi: false,
        isScheduledPriceControlled: true,
        salts: [{ saltId: "salt-telmi", name: "Telmisartan", strength: "40mg" }],
      },
      // Candidate 2: Jan Aushadhi, Pack of 15, MRP ₹22.5 -> Unit price = ₹1.50
      {
        id: "cand-2-janaushadhi",
        brandName: "Jan Aushadhi Telmisartan 40",
        manufacturer: "BPPI",
        dosageForm: "tablet",
        packSize: 15,
        mrp: 22.5,
        unitPriceMrp: 1.5,
        isGeneric: true,
        isJanAushadhi: true,
        isScheduledPriceControlled: false,
        salts: [{ saltId: "salt-telmi", name: "Telmisartan", strength: "40mg" }],
      },
      // Candidate 3: Generic, Pack of 10, MRP ₹45 -> Unit price = ₹4.50
      {
        id: "cand-3-generic",
        brandName: "Generic Telmisartan 40",
        manufacturer: "Cipla Generics",
        dosageForm: "tablet",
        packSize: 10,
        mrp: 45.0,
        unitPriceMrp: 4.5,
        isGeneric: true,
        isJanAushadhi: false,
        isScheduledPriceControlled: false,
        salts: [{ saltId: "salt-telmi", name: "Telmisartan", strength: "40mg" }],
      },
    ];

    const result = findSubstitutesPure(targetTelma, candidates, { onlyInStock: false });

    assert.equal(result.substitutes.length, 3);
    // Order must be sorted by unit price ascending:
    // 1st: Jan Aushadhi (₹1.50/unit)
    assert.equal(result.substitutes[0].brandName, "Jan Aushadhi Telmisartan 40");
    assert.equal(result.substitutes[0].effectiveUnitPrice, 1.5);
    assert.equal(result.substitutes[0].tier, "Jan Aushadhi");

    // 2nd: Generic (₹4.50/unit)
    assert.equal(result.substitutes[1].brandName, "Generic Telmisartan 40");
    assert.equal(result.substitutes[1].effectiveUnitPrice, 4.5);
    assert.equal(result.substitutes[1].tier, "Generic");

    // 3rd: Cheaper brand (₹7.00/unit)
    assert.equal(result.substitutes[2].brandName, "Telmikind 40");
    assert.equal(result.substitutes[2].effectiveUnitPrice, 7.0);
    assert.equal(result.substitutes[2].tier, "Cheaper brand");
  });
});
