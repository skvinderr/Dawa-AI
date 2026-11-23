import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeOrderSavings,
  computeUserLifetimeSavings,
  canAccumulateToLifetimeSavings,
  CartItemSavingsInput,
} from "../savings";

describe("Auditable Savings Calculation Engine", () => {
  it("should calculate exact savings for typical generic substitution", () => {
    // Augmentin 625 Duo (MRP 220) switched to Jan Aushadhi Amoxyclav (54)
    const items: CartItemSavingsInput[] = [
      {
        medicineId: "med-1",
        medicineName: "Jan Aushadhi Amoxyclav 625",
        quantity: 1,
        baselinePrice: 220.0,
        actualPrice: 54.0,
        highestNearbyPrice: 220.0,
      },
    ];

    const result = computeOrderSavings(items);

    assert.equal(result.totalActualPaid, 54.0);
    assert.equal(result.totalMrpBaseline, 220.0);
    assert.equal(result.totalSavingsVsMrp, 166.0);
    assert.equal(result.overallSavingsPercentVsMrp, 75.5);
    assert.equal(result.items[0].savingsVsMrp, 166.0);
  });

  it("should handle edge case: zero savings when actualPrice equals baselinePrice", () => {
    const items: CartItemSavingsInput[] = [
      {
        medicineId: "med-dolo",
        medicineName: "Dolo 650",
        quantity: 2,
        baselinePrice: 34.0,
        actualPrice: 34.0,
      },
    ];

    const result = computeOrderSavings(items);

    assert.equal(result.totalActualPaid, 68.0);
    assert.equal(result.totalMrpBaseline, 68.0);
    assert.equal(result.totalSavingsVsMrp, 0);
    assert.equal(result.overallSavingsPercentVsMrp, 0);
    assert.equal(result.items[0].savingsVsMrp, 0);
  });

  it("should handle edge case: negative savings clamped/floored at 0", () => {
    // If a user chooses an imported or premium alternative priced above original baseline
    const items: CartItemSavingsInput[] = [
      {
        medicineId: "med-premium",
        medicineName: "Specialty Imported Paracetamol",
        quantity: 1,
        baselinePrice: 30.0, // original baseline
        actualPrice: 45.0, // actual higher price
      },
    ];

    const result = computeOrderSavings(items);

    // Negative savings must NEVER be displayed or deducted
    assert.equal(result.totalSavingsVsMrp, 0);
    assert.equal(result.items[0].savingsVsMrp, 0);
    assert.equal(result.overallSavingsPercentVsMrp, 0);
    assert.equal(result.totalActualPaid, 45.0);
    assert.equal(result.totalMrpBaseline, 30.0);
  });

  it("should correctly scale savings across multiple quantities", () => {
    // Glycomet-GP 2: Baseline 165 vs Jan Aushadhi 32 -> saves 133 per pack. 3 packs = 399 savings.
    const items: CartItemSavingsInput[] = [
      {
        medicineId: "med-glyco",
        medicineName: "Jan Aushadhi Glimepiride & Metformin",
        quantity: 4,
        baselinePrice: 165.0,
        actualPrice: 32.0,
      },
    ];

    const result = computeOrderSavings(items);

    assert.equal(result.totalActualPaid, 128.0);
    assert.equal(result.totalMrpBaseline, 660.0);
    assert.equal(result.totalSavingsVsMrp, 532.0); // (165 - 32) * 4 = 133 * 4 = 532
    assert.equal(result.items[0].savingsVsMrp, 532.0);
  });

  it("should compute secondary transparency metric: savings vs highest nearby price", () => {
    const items: CartItemSavingsInput[] = [
      {
        medicineId: "med-telma",
        medicineName: "Jan Aushadhi Telmisartan 40",
        quantity: 1,
        baselinePrice: 145.0, // official MRP
        actualPrice: 22.0, // Jan Aushadhi price
        highestNearbyPrice: 148.0, // local retail store markup
      },
    ];

    const result = computeOrderSavings(items);

    assert.equal(result.totalSavingsVsMrp, 123.0); // 145 - 22 = 123
    assert.equal(result.totalSavingsVsHighest, 126.0); // 148 - 22 = 126 (secondary figure)
    assert.ok(result.totalSavingsVsHighest >= result.totalSavingsVsMrp);
  });

  it("should strictly accumulate lifetime savings ONLY on COMPLETED orders", () => {
    assert.equal(canAccumulateToLifetimeSavings("COMPLETED"), true);
    assert.equal(canAccumulateToLifetimeSavings("completed"), true);
    assert.equal(canAccumulateToLifetimeSavings("HOLD_REQUESTED"), false);
    assert.equal(canAccumulateToLifetimeSavings("CONFIRMED"), false);
    assert.equal(canAccumulateToLifetimeSavings("READY"), false);
    assert.equal(canAccumulateToLifetimeSavings("CANCELLED"), false);

    const userOrders = [
      { status: "COMPLETED", savings: 340.0 },
      { status: "HOLD_REQUESTED", savings: 150.0 }, // must NOT count
      { status: "READY", savings: 80.0 }, // must NOT count
      { status: "COMPLETED", savings: 900.0 },
      { status: "CANCELLED", savings: 500.0 }, // must NOT count
    ];

    const lifetimeSavings = computeUserLifetimeSavings(userOrders);
    assert.equal(lifetimeSavings, 1240.0); // 340 + 900 = 1240
  });
});
