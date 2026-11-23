/**
 * ============================================================================
 *   DawaaSetu — AUDITABLE SAVINGS CALCULATION ENGINE
 * ============================================================================
 * 
 * CORE DEFINITIONS & PRINCIPLES:
 * 
 * 1. BASELINE PRICE (baselinePrice):
 *    The official Maximum Retail Price (MRP) of the branded medicine originally
 *    searched or prescribed by the doctor (e.g., Augmentin 625 MRP = ₹220.0).
 * 
 * 2. ACTUAL PRICE (actualPrice):
 *    The net selling price of the product actually chosen by the citizen (e.g.,
 *    Jan Aushadhi Amoxyclav 625 = ₹54.0).
 * 
 * 3. ITEM SAVINGS (savings per item):
 *    Formula: Math.max(0, (baselinePrice - actualPrice) * quantity)
 *    Strictly floored at zero so that if a user intentionally chooses a premium
 *    or specialty brand with actualPrice > baselinePrice, negative savings are never
 *    subtracted or displayed.
 * 
 * 4. SECONDARY TRANSPARENCY METRIC ("vs highest nearby price"):
 *    In local retail, chemist shops often charge different markups. We compute:
 *    highestNearbyPrice = maximum selling price found across nearby in-stock stores.
 *    savingsVsHighest = Math.max(0, (highestNearbyPrice - actualPrice) * quantity)
 *    This secondary figure reveals how much the citizen saved compared to the
 *    most expensive retail pharmacy in their locality.
 * 
 * 5. LIFETIME ACCUMULATION RULE:
 *    A citizen's lifetime savings accumulates ONLY when an order reaches
 *    status === "COMPLETED" (i.e. successfully picked up or delivered).
 *    Unfulfilled holds (HOLD_REQUESTED, CANCELLED) are excluded from lifetime stats.
 * ============================================================================
 */

export interface CartItemSavingsInput {
  medicineId: string;
  medicineName: string;
  quantity: number;
  actualPrice: number;
  baselinePrice: number;
  highestNearbyPrice?: number;
}

export interface ItemSavingsResult {
  medicineId: string;
  medicineName: string;
  quantity: number;
  actualPrice: number;
  baselinePrice: number;
  totalActual: number;
  totalBaseline: number;
  savingsVsMrp: number;
  savingsPercentVsMrp: number;
  highestNearbyPrice: number;
  totalHighestNearby: number;
  savingsVsHighest: number;
  savingsPercentVsHighest: number;
}

export interface OrderSavingsSummary {
  items: ItemSavingsResult[];
  totalActualPaid: number;
  totalMrpBaseline: number;
  totalSavingsVsMrp: number;
  overallSavingsPercentVsMrp: number;
  totalHighestNearbyBaseline: number;
  totalSavingsVsHighest: number;
  overallSavingsPercentVsHighest: number;
}

/**
 * Computes deterministic item-by-item and total savings for an order.
 * Floored at 0 for each line item.
 */
export function computeOrderSavings(
  items: CartItemSavingsInput[]
): OrderSavingsSummary {
  if (!items || items.length === 0) {
    return {
      items: [],
      totalActualPaid: 0,
      totalMrpBaseline: 0,
      totalSavingsVsMrp: 0,
      overallSavingsPercentVsMrp: 0,
      totalHighestNearbyBaseline: 0,
      totalSavingsVsHighest: 0,
      overallSavingsPercentVsHighest: 0,
    };
  }

  const processedItems: ItemSavingsResult[] = items.map((item) => {
    const qty = Math.max(0, Math.floor(item.quantity || 1));
    const actual = Math.max(0, Number(item.actualPrice) || 0);
    const baseline = Math.max(0, Number(item.baselinePrice) || 0);

    // If highestNearbyPrice is omitted or lower than baseline, default to at least baseline
    const highestNearby = Math.max(
      baseline,
      Number(item.highestNearbyPrice) || baseline
    );

    const totalActual = Number((actual * qty).toFixed(2));
    const totalBaseline = Number((baseline * qty).toFixed(2));
    const totalHighestNearby = Number((highestNearby * qty).toFixed(2));

    // Savings vs MRP (floored at 0)
    const rawSavingsVsMrp = (baseline - actual) * qty;
    const savingsVsMrp = Number(Math.max(0, rawSavingsVsMrp).toFixed(2));
    const savingsPercentVsMrp =
      totalBaseline > 0
        ? Number(((savingsVsMrp / totalBaseline) * 100).toFixed(1))
        : 0;

    // Savings vs Highest Nearby Retail Price (secondary figure)
    const rawSavingsVsHighest = (highestNearby - actual) * qty;
    const savingsVsHighest = Number(Math.max(0, rawSavingsVsHighest).toFixed(2));
    const savingsPercentVsHighest =
      totalHighestNearby > 0
        ? Number(((savingsVsHighest / totalHighestNearby) * 100).toFixed(1))
        : 0;

    return {
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: qty,
      actualPrice: actual,
      baselinePrice: baseline,
      totalActual,
      totalBaseline,
      savingsVsMrp,
      savingsPercentVsMrp,
      highestNearbyPrice: highestNearby,
      totalHighestNearby,
      savingsVsHighest,
      savingsPercentVsHighest,
    };
  });

  const totalActualPaid = Number(
    processedItems.reduce((acc, i) => acc + i.totalActual, 0).toFixed(2)
  );
  const totalMrpBaseline = Number(
    processedItems.reduce((acc, i) => acc + i.totalBaseline, 0).toFixed(2)
  );
  const totalSavingsVsMrp = Number(
    processedItems.reduce((acc, i) => acc + i.savingsVsMrp, 0).toFixed(2)
  );
  const overallSavingsPercentVsMrp =
    totalMrpBaseline > 0
      ? Number(((totalSavingsVsMrp / totalMrpBaseline) * 100).toFixed(1))
      : 0;

  const totalHighestNearbyBaseline = Number(
    processedItems.reduce((acc, i) => acc + i.totalHighestNearby, 0).toFixed(2)
  );
  const totalSavingsVsHighest = Number(
    processedItems.reduce((acc, i) => acc + i.savingsVsHighest, 0).toFixed(2)
  );
  const overallSavingsPercentVsHighest =
    totalHighestNearbyBaseline > 0
      ? Number(
          ((totalSavingsVsHighest / totalHighestNearbyBaseline) * 100).toFixed(1)
        )
      : 0;

  return {
    items: processedItems,
    totalActualPaid,
    totalMrpBaseline,
    totalSavingsVsMrp,
    overallSavingsPercentVsMrp,
    totalHighestNearbyBaseline,
    totalSavingsVsHighest,
    overallSavingsPercentVsHighest,
  };
}

/**
 * Lifetime accumulation rule:
 * User's lifetime savings accumulates ONLY when order status is "COMPLETED"
 */
export function canAccumulateToLifetimeSavings(status: string): boolean {
  return status.trim().toUpperCase() === "COMPLETED";
}

export function computeUserLifetimeSavings(
  orders: Array<{ status: string; savings: number }>
): number {
  if (!orders || orders.length === 0) return 0;

  const sum = orders
    .filter((order) => canAccumulateToLifetimeSavings(order.status))
    .reduce((acc, order) => acc + Math.max(0, order.savings || 0), 0);

  return Number(sum.toFixed(2));
}
