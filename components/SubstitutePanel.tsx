"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Building2,
  CheckCircle2,
  MapPin,
  HelpCircle,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Percent,
  Check,
  TrendingDown
} from "lucide-react";
import {
  SubstitutionEngineResponse,
  SubstituteResult,
  MANDATORY_DISCLAIMER,
  NTI_SAFETY_WARNING,
} from "@/lib/substitution";

interface SubstitutePanelProps {
  medicineId: string;
  medicineName?: string;
  initialData?: SubstitutionEngineResponse | null;
  onAddToOrder?: (substitute: SubstituteResult) => void;
  defaultExpanded?: boolean;
  userLat?: number;
  userLng?: number;
}

export function SubstitutePanel({
  medicineId,
  medicineName,
  initialData,
  onAddToOrder,
  defaultExpanded = false,
  userLat = 26.8528,
  userLng = 80.9463,
}: SubstitutePanelProps) {
  const [data, setData] = useState<SubstitutionEngineResponse | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [openWhyMatchId, setOpenWhyMatchId] = useState<string | null>(null);
  const [addedSubId, setAddedSubId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }

    if (!medicineId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/substitutes?medicineId=${encodeURIComponent(medicineId)}&lat=${userLat}&lng=${userLng}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load substitutes");
        return res.json();
      })
      .then((result) => {
        if (isMounted) {
          setData(result);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [medicineId, initialData, userLat, userLng]);

  if (loading) {
    return (
      <div className="p-3 bg-health-50/50 rounded-2xl border border-health-100 flex items-center gap-2 text-xs text-health-800 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-health-600 animate-spin" />
        <span>Checking Jan Aushadhi &amp; generic bioequivalent substitutes...</span>
      </div>
    );
  }

  if (error || !data || data.substitutes.length === 0) {
    return null; // Do not clutter view if no substitutes available
  }

  const {
    originalMedicine,
    substitutes,
    maxSavingsAmount,
    maxSavingsPercent,
    isNarrowTherapeuticIndex,
    safetyNotice,
    disclaimer,
  } = data;

  // Max unit price for visual horizontal bar scaling
  const maxUnitPrice = Math.max(
    originalMedicine.unitPrice,
    ...substitutes.map((s) => s.effectiveUnitPrice)
  );

  const handleOrderClick = (sub: SubstituteResult) => {
    setAddedSubId(sub.id);
    setTimeout(() => setAddedSubId(null), 2500);
    if (onAddToOrder) {
      onAddToOrder(sub);
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-emerald-200/90 bg-white shadow-soft transition-all">
      {/* 1. Header Banner: Cheaper Alternatives Available */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-3 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white hover:from-emerald-100/70 hover:to-teal-50 transition-colors flex items-center justify-between gap-3 border-b border-emerald-100"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-900 tracking-tight">
                {isNarrowTherapeuticIndex
                  ? "Careful dosing required (Narrow Therapeutic Index)"
                  : `Cheaper alternatives available: Save up to ₹${maxSavingsAmount.toFixed(1)} (${maxSavingsPercent.toFixed(0)}%)`}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                {substitutes.length} {substitutes.length === 1 ? "Option" : "Options"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Exact salt bioequivalent matches for {medicineName || originalMedicine.brandName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-emerald-700 hidden md:inline">
            {isExpanded ? "Hide Substitutes" : "View Substitutes"}
          </span>
          <div className="p-1 rounded-lg bg-emerald-100/60 text-emerald-800">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* 2. Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 animate-in fade-in duration-200">
          {/* SAFETY NOTICE for Narrow Therapeutic Index (NTI) */}
          {isNarrowTherapeuticIndex && safetyNotice && (
            <div className="bg-amber-50 border-2 border-amber-400/90 rounded-2xl p-4 flex items-start gap-3 text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-amber-900">
                  Careful Dosing Medicine Notice:
                </p>
                <p className="text-xs leading-relaxed text-amber-800">
                  {safetyNotice}
                </p>
              </div>
            </div>
          )}

          {/* VISUAL PRICE PER UNIT COMPARISON BAR */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Fair Unit-Price Comparison (Price per {originalMedicine.dosageForm})</span>
              <span className="text-[11px] text-slate-500 font-normal">Accounts for different pack sizes</span>
            </div>

            {/* Original Medicine Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="truncate max-w-[200px]">
                  {originalMedicine.brandName} (Prescribed)
                </span>
                <span className="font-bold text-slate-900">₹{originalMedicine.unitPrice.toFixed(2)}/unit</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-slate-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (originalMedicine.unitPrice / maxUnitPrice) * 100)}%` }}
                />
              </div>
            </div>

            {/* Top Substitute Bar */}
            {substitutes.slice(0, 3).map((sub) => {
              const barColor =
                sub.tier === "Jan Aushadhi"
                  ? "bg-emerald-600"
                  : sub.tier === "Generic"
                  ? "bg-teal-600"
                  : "bg-blue-600";

              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-800 truncate max-w-[200px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      {sub.brandName} ({sub.tier})
                    </span>
                    <span className="font-bold text-emerald-800">
                      ₹{sub.effectiveUnitPrice.toFixed(2)}/unit
                      {sub.savingsPercent > 0 && (
                        <span className="text-[10px] text-emerald-600 ml-1">
                          (-{sub.savingsPercent.toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                      className={`${barColor} h-full rounded-full transition-all`}
                      style={{
                        width: `${Math.max(8, Math.min(100, (sub.effectiveUnitPrice / maxUnitPrice) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. List of Substitute Cards */}
          <div className="space-y-3">
            {substitutes.map((sub, index) => {
              const isWhyOpen = openWhyMatchId === sub.id;

              const badgeColor =
                sub.tier === "Jan Aushadhi"
                  ? "bg-emerald-600 text-white"
                  : sub.tier === "Generic"
                  ? "bg-teal-600 text-white"
                  : "bg-blue-600 text-white";

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badgeColor}`}>
                          {sub.tier}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{sub.brandName}</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        {sub.manufacturer} • Pack of {sub.packSize} {sub.dosageForm}s
                      </p>

                      {/* In Stock & Store Location */}
                      {sub.nearestStore && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            In stock at <strong>{sub.nearestStore.storeName}</strong> ({sub.nearestStore.distanceKm} km away)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Price & Savings */}
                    <div className="text-left sm:text-right sm:border-l sm:border-slate-100 sm:pl-4 shrink-0">
                      <div className="flex items-baseline sm:justify-end gap-1.5">
                        <span className="text-xs text-slate-400 line-through">
                          ₹{originalMedicine.mrp.toFixed(1)}
                        </span>
                        <span className="text-xl font-black text-emerald-800">
                          ₹{sub.effectivePackPrice.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        ₹{sub.effectiveUnitPrice.toFixed(2)} / {sub.dosageForm}
                      </span>
                      {sub.savingsPercent > 0 && (
                        <span className="inline-block mt-0.5 text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Save ₹{sub.savingsPerPackOfOriginal.toFixed(1)} ({sub.savingsPercent.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: "Why is this a match?" toggle & "Add to order" */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setOpenWhyMatchId(isWhyOpen ? null : sub.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-health-700 hover:text-health-900 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isWhyOpen ? "Hide equivalence breakdown" : "Why is this a match?"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrderClick(sub)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      {addedSubId === sub.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to order</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* "Why is this a match?" Comparison Table */}
                  {isWhyOpen && (
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2 animate-in fade-in duration-150">
                      <p className="font-semibold text-slate-700">
                        {sub.matchExplanation.whyMatchSummary}
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                              <th className="py-1 px-2">Attribute</th>
                              <th className="py-1 px-2">Original Prescribed</th>
                              <th className="py-1 px-2">Substitute Match</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60">
                            {sub.matchExplanation.comparisonTable.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-100/50">
                                <td className="py-1.5 px-2 font-medium text-slate-600">{row.attribute}</td>
                                <td className="py-1.5 px-2 text-slate-800">{row.originalValue}</td>
                                <td className="py-1.5 px-2 text-emerald-800 font-semibold">
                                  {row.substituteValue} {row.isExactMatch && "✓"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{disclaimer || MANDATORY_DISCLAIMER}</span>
          </div>
        </div>
      )}
    </div>
  );
}
