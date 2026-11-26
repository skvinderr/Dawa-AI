import { describe, it } from "node:test";
import assert from "node:assert";
import {
  matchesSignalGroup,
  computeAreaOutbreakSignals,
  computeMedicineShortages,
  PRIVACY_THRESHOLD,
  SIGNAL_GROUPS,
} from "../outbreak";

describe("Outbreak & Syndromic Surveillance Engine (/lib/outbreak.ts)", () => {
  it("should correctly classify medicines and search queries into symptom-signal groups", () => {
    // Fever
    assert.strictEqual(
      matchesSignalGroup("Dolo 650 tablet", "Paracetamol", "analgesic", "FEVER"),
      true
    );
    assert.strictEqual(
      matchesSignalGroup("High fever and headache", "", "", "FEVER"),
      true
    );
    assert.strictEqual(
      matchesSignalGroup("Metformin 500mg", "Metformin", "anti-diabetic", "FEVER"),
      false
    );

    // Gastro
    assert.strictEqual(
      matchesSignalGroup("Electral powder sachet", "Oral Rehydration Salts", "electrolyte", "GASTRO"),
      true
    );
    assert.strictEqual(
      matchesSignalGroup("Vomiting and nausea medicine", "Ondansetron", "anti-emetic", "GASTRO"),
      true
    );
    assert.strictEqual(
      matchesSignalGroup("Cough syrup for cold", "Dextromethorphan", "cough syrup", "GASTRO"),
      false
    );

    // Respiratory
    assert.strictEqual(
      matchesSignalGroup("Azithral 500", "Azithromycin", "antibiotic", "RESPIRATORY"),
      true
    );
    assert.strictEqual(
      matchesSignalGroup("Cough syrup dry cough", "Cetirizine", "anti-histaminic", "RESPIRATORY"),
      true
    );

    // Skin
    assert.strictEqual(
      matchesSignalGroup("Anti-fungal skin cream", "Clotrimazole", "anti-fungal", "SKIN"),
      true
    );

    // All signals
    assert.strictEqual(
      matchesSignalGroup("Any medicine", "Any Salt", "Any Category", "ALL"),
      true
    );
  });

  it("should enforce privacy threshold (<5 events masked) for municipal areas", () => {
    const now = new Date();
    // 3 events for "Gomti Nagar" (< 5 threshold)
    const testEvents = [
      {
        area: "Gomti Nagar",
        lat: 26.85,
        lng: 80.99,
        query: "Paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: now,
      },
      {
        area: "Gomti Nagar",
        lat: 26.85,
        lng: 80.99,
        query: "Dolo 650",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - 24 * 3600 * 1000),
      },
      {
        area: "Gomti Nagar",
        lat: 26.85,
        lng: 80.99,
        query: "Crocin",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000),
      },
    ];

    const result = computeAreaOutbreakSignals({
      events: testEvents,
      referenceDate: now,
      selectedGroup: "FEVER",
      timeframeDays: 14,
    });

    const gomti = result.areas.find((a) => a.area === "Gomti Nagar");
    assert.ok(gomti, "Gomti Nagar should be present in results");
    assert.strictEqual(gomti.isSuppressed, true, "Should be flagged as suppressed when count < 5");
    assert.strictEqual(gomti.displayCount, "< 5", "Display count should show < 5");
  });

  it("should compute anomaly ratio and flag 'ALERT' (>2.5x) and 'RISING' (>1.5x) correctly", () => {
    const now = new Date();
    const mockEvents: any[] = [];

    // Area 1: "Chowk" - 30 events in last 3 days (10/day), 11 events in days 3..13 (1/day) -> Ratio ~ 10x (ALERT)
    for (let i = 0; i < 30; i++) {
      const day = i % 3; // 0, 1, 2 (last 3 days)
      mockEvents.push({
        area: "Chowk",
        lat: 26.868,
        lng: 80.912,
        query: "High fever paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - day * 24 * 3600 * 1000),
      });
    }
    for (let i = 3; i < 14; i++) {
      mockEvents.push({
        area: "Chowk",
        lat: 26.868,
        lng: 80.912,
        query: "Paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - i * 24 * 3600 * 1000),
      });
    }

    // Area 2: "Hazratganj" - 6 events in last 3 days (2/day), 11 events in days 3..13 (1/day) -> Ratio ~ 2.0x (RISING)
    for (let i = 0; i < 6; i++) {
      const day = i % 3;
      mockEvents.push({
        area: "Hazratganj",
        lat: 26.852,
        lng: 80.946,
        query: "Paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - day * 24 * 3600 * 1000),
      });
    }
    for (let i = 3; i < 14; i++) {
      mockEvents.push({
        area: "Hazratganj",
        lat: 26.852,
        lng: 80.946,
        query: "Paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - i * 24 * 3600 * 1000),
      });
    }

    // Area 3: "Aliganj" - 3 events in last 3 days (1/day), 11 events in days 3..13 (1/day) -> Ratio ~ 1.0x (NORMAL)
    for (let i = 0; i < 3; i++) {
      const day = i % 3;
      mockEvents.push({
        area: "Aliganj",
        lat: 26.887,
        lng: 80.938,
        query: "Paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - day * 24 * 3600 * 1000),
      });
    }
    for (let i = 3; i < 14; i++) {
      mockEvents.push({
        area: "Aliganj",
        lat: 26.887,
        lng: 80.938,
        query: "Paracetamol",
        saltName: "Paracetamol",
        saltCategory: "analgesic",
        createdAt: new Date(now.getTime() - i * 24 * 3600 * 1000),
      });
    }

    const result = computeAreaOutbreakSignals({
      events: mockEvents,
      referenceDate: now,
      selectedGroup: "FEVER",
      timeframeDays: 14,
    });

    const chowk = result.areas.find((a) => a.area === "Chowk");
    const hazratganj = result.areas.find((a) => a.area === "Hazratganj");
    const aliganj = result.areas.find((a) => a.area === "Aliganj");

    assert.ok(chowk);
    assert.ok(hazratganj);
    assert.ok(aliganj);

    // Assert anomaly levels
    assert.strictEqual(chowk.anomalyLevel, "ALERT", "Chowk should be ALERT (>2.5x)");
    assert.strictEqual(chowk.isAlert, true);
    assert.ok(chowk.anomalyRatio > 2.5, "Anomaly ratio should exceed 2.5x");

    assert.strictEqual(hazratganj.anomalyLevel, "RISING", "Hazratganj should be RISING (>1.5x)");
    assert.strictEqual(hazratganj.isRising, true);
    assert.ok(hazratganj.anomalyRatio > 1.5 && hazratganj.anomalyRatio <= 2.5);

    assert.strictEqual(aliganj.anomalyLevel, "NORMAL", "Aliganj should be NORMAL (<=1.5x)");
  });

  it("should compute medicine shortages (<20% store coverage within an area)", () => {
    // 5 stores in "Chowk"
    const mockStores: any[] = [
      {
        id: "s1",
        name: "Store 1",
        type: "PRIVATE",
        area: "Chowk",
        inventory: [
          {
            medicineId: "med-paracetamol",
            quantity: 50, // in stock at 1 store
            medicine: {
              id: "med-paracetamol",
              brandName: "Dolo 650",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Paracetamol", category: "analgesic" } }],
            },
          },
          {
            medicineId: "med-amoxicillin",
            quantity: 40,
            medicine: {
              id: "med-amoxicillin",
              brandName: "Augmentin 625",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Amoxicillin", category: "antibiotic" } }],
            },
          },
        ],
      },
      {
        id: "s2",
        name: "Store 2",
        type: "PRIVATE",
        area: "Chowk",
        inventory: [
          {
            medicineId: "med-paracetamol",
            quantity: 0, // out of stock
            medicine: {
              id: "med-paracetamol",
              brandName: "Dolo 650",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Paracetamol", category: "analgesic" } }],
            },
          },
          {
            medicineId: "med-amoxicillin",
            quantity: 25,
            medicine: {
              id: "med-amoxicillin",
              brandName: "Augmentin 625",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Amoxicillin", category: "antibiotic" } }],
            },
          },
        ],
      },
      {
        id: "s3",
        name: "Store 3",
        type: "PRIVATE",
        area: "Chowk",
        inventory: [
          {
            medicineId: "med-paracetamol",
            quantity: 0, // out of stock
            medicine: {
              id: "med-paracetamol",
              brandName: "Dolo 650",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Paracetamol", category: "analgesic" } }],
            },
          },
          {
            medicineId: "med-amoxicillin",
            quantity: 30,
            medicine: {
              id: "med-amoxicillin",
              brandName: "Augmentin 625",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Amoxicillin", category: "antibiotic" } }],
            },
          },
        ],
      },
      {
        id: "s4",
        name: "Store 4",
        type: "PRIVATE",
        area: "Chowk",
        inventory: [
          {
            medicineId: "med-paracetamol",
            quantity: 0, // out of stock
            medicine: {
              id: "med-paracetamol",
              brandName: "Dolo 650",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Paracetamol", category: "analgesic" } }],
            },
          },
          {
            medicineId: "med-amoxicillin",
            quantity: 30,
            medicine: {
              id: "med-amoxicillin",
              brandName: "Augmentin 625",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Amoxicillin", category: "antibiotic" } }],
            },
          },
        ],
      },
      {
        id: "s5",
        name: "Store 5",
        type: "PRIVATE",
        area: "Chowk",
        inventory: [
          {
            medicineId: "med-paracetamol",
            quantity: 0, // out of stock
            medicine: {
              id: "med-paracetamol",
              brandName: "Dolo 650",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Paracetamol", category: "analgesic" } }],
            },
          },
          {
            medicineId: "med-amoxicillin",
            quantity: 30,
            medicine: {
              id: "med-amoxicillin",
              brandName: "Augmentin 625",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Amoxicillin", category: "antibiotic" } }],
            },
          },
        ],
      },
      {
        id: "s6",
        name: "Store 6",
        type: "PRIVATE",
        area: "Chowk",
        inventory: [
          {
            medicineId: "med-paracetamol",
            quantity: 0, // out of stock
            medicine: {
              id: "med-paracetamol",
              brandName: "Dolo 650",
              dosageForm: "tablet",
              salts: [{ salt: { name: "Paracetamol", category: "analgesic" } }],
            },
          },
        ],
      },
    ];

    // In Chowk: 6 stores.
    // Dolo 650 is in stock at 1 store (1 / 6 = 16.7% < 20% -> Shortage!)
    // Augmentin 625 is in stock at 5 stores (5 / 6 = 83.3% >= 20% -> Not a shortage)

    const shortages = computeMedicineShortages(mockStores);

    const doloShortage = shortages.find((s) => s.medicineId === "med-paracetamol");
    const augmentinShortage = shortages.find((s) => s.medicineId === "med-amoxicillin");

    assert.ok(doloShortage, "Dolo 650 should be flagged as shortage (<20% coverage)");
    assert.strictEqual(doloShortage.area, "Chowk");
    assert.strictEqual(doloShortage.inStockStoresCount, 1);
    assert.strictEqual(doloShortage.totalStoresInArea, 6);
    assert.strictEqual(doloShortage.storeCoveragePercent, 16.7);
    assert.strictEqual(doloShortage.outOfStockStoresCount, 5);

    assert.strictEqual(
      augmentinShortage,
      undefined,
      "Augmentin 625 with 83% coverage should NOT be flagged as shortage"
    );
  });
});
