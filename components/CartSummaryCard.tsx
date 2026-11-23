"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import { computeOrderSavings, CartItemSavingsInput } from "@/lib/savings";

export interface CheaperNudge {
  medicineName: string;
  substituteName: string;
  storeName: string;
  distanceKm: number;
  potentialSavings: number;
  substitutePrice: number;
}

interface CartSummaryCardProps {
  items: CartItemSavingsInput[];
  nudge?: CheaperNudge | null;
  onApplyNudge?: (nudge: CheaperNudge) => void;
  onCheckout?: () => void;
  checkoutButtonText?: string;
}

export function CartSummaryCard({
  items,
  nudge,
  onApplyNudge,
  onCheckout,
  checkoutButtonText = "Reserve for Pickup",
}: CartSummaryCardProps) {
  const savingsSummary = computeOrderSavings(items);
  const targetSavings = savingsSummary.totalSavingsVsMrp;

  // Animated Count-up effect
  const [displayedSavings, setDisplayedSavings] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 750; // ms
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = targetSavings / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetSavings) {
        setDisplayedSavings(targetSavings);
        clearInterval(timer);
      } else {
        setDisplayedSavings(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetSavings]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft-lg space-y-6">
      {/* 1. Green Prominent Savings Banner with Animated Count-up */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-health-800 rounded-2xl p-5 text-white shadow-soft relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Audited Cart Savings</span>
          </div>

          <span className="text-xs font-bold text-emerald-200 bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
            {savingsSummary.overallSavingsPercentVsMrp}% Saved
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-emerald-100">You save on this order:</p>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
            <span>₹ {displayedSavings.toLocaleString("en-IN", { minimumFractionDigits: 1 })}</span>
            <span className="text-sm font-normal text-emerald-200">total discount</span>
          </div>
        </div>

        {/* Secondary Figure: vs highest nearby price */}
        {savingsSummary.totalSavingsVsHighest > savingsSummary.totalSavingsVsMrp && (
          <div className="mt-3 pt-3 border-t border-white/20 text-[11px] text-emerald-100 flex items-center justify-between">
            <span>Vs highest nearby retail chemist:</span>
            <span className="font-bold text-white">
              Save ₹{savingsSummary.totalSavingsVsHighest.toFixed(1)} ({savingsSummary.overallSavingsPercentVsHighest}%)
            </span>
          </div>
        )}
      </div>

      {/* 2. Gentle Behaviour Change Nudge (within 3km) */}
      {nudge && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 space-y-2 text-amber-950 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Gentle Healthcare Saving Tip:
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                You could save <strong className="text-amber-950 font-black">₹{nudge.potentialSavings.toFixed(1)}</strong> by choosing {nudge.substituteName} at{" "}
                <strong>{nudge.storeName}</strong>, located <strong>{nudge.distanceKm} km</strong> away.
              </p>
            </div>
          </div>

          {onApplyNudge && (
            <div className="text-right pt-1">
              <button
                type="button"
                onClick={() => onApplyNudge(nudge)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <span>Switch &amp; Save ₹{nudge.potentialSavings.toFixed(1)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Per-Item Savings Breakdown Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Items Breakdown &amp; MRP Baseline
        </h4>

        <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-1">
          {savingsSummary.items.map((item) => (
            <div key={item.medicineId} className="py-2.5 flex items-center justify-between text-xs gap-3">
              <div className="space-y-0.5 max-w-[220px]">
                <p className="font-bold text-slate-800 truncate">{item.medicineName}</p>
                <p className="text-[11px] text-slate-400">
                  Qty: {item.quantity} × ₹{item.actualPrice.toFixed(1)}
                  {item.actualPrice < item.baselinePrice && (
                    <span className="line-through text-slate-400 ml-1.5">
                      (MRP: ₹{item.baselinePrice.toFixed(1)})
                    </span>
                  )}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900 block">₹{item.totalActual.toFixed(1)}</span>
                {item.savingsVsMrp > 0 ? (
                  <span className="text-[11px] font-bold text-emerald-700">
                    Saved ₹{item.savingsVsMrp.toFixed(1)} ({item.savingsPercentVsMrp}%)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Standard MRP</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Total Price Row & Action */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-600">Total MRP Baseline:</span>
          <span className="font-medium text-slate-400 line-through">
            ₹{savingsSummary.totalMrpBaseline.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between text-base">
          <span className="font-extrabold text-slate-800">Net Amount to Pay:</span>
          <span className="text-2xl font-black text-emerald-800">
            ₹{savingsSummary.totalActualPaid.toFixed(1)}
          </span>
        </div>

        {onCheckout && (
          <button
            type="button"
            onClick={onCheckout}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{checkoutButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
