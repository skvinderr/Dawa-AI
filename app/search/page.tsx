"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Pill
} from "lucide-react";
import { SubstitutePanel } from "@/components/SubstitutePanel";
import { CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ContextualSchemeBanner } from "@/components/ContextualSchemeBanner";

interface MedicineSearchResult {
  id: string;
  brandName: string;
  manufacturer: string;
  dosageForm: string;
  packSize: number;
  mrp: number;
  unitPrice: number;
  isJanAushadhi: boolean;
  isGeneric: boolean;
  isScheduledPriceControlled: boolean;
  ceilingPrice?: number | null;
  salts: Array<{
    name: string;
    strength: string;
    category: string;
    isNarrowTherapeuticIndex: boolean;
  }>;
  inStockCount: number;
  lowestPrice: number;
}

function SearchContent() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedArea, setSelectedArea] = useState("Hazratganj");
  const [medicines, setMedicines] = useState<MedicineSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const areas = [
    "Hazratganj",
    "Gomti Nagar",
    "Chowk",
    "Aliganj",
    "Indira Nagar",
    "Alambagh",
    "Rajajipuram",
    "Mahanagar",
  ];

  const fetchResults = (searchQuery: string, area: string) => {
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&area=${encodeURIComponent(area)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.medicines) {
          setMedicines(data.medicines);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults(initialQuery, selectedArea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    fetchResults(query.trim(), selectedArea);
  };

  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    fetchResults(query.trim(), newArea);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-health-800 via-health-700 to-teal-800 text-white py-8 sm:py-12 border-b border-health-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-900/60 border border-health-500/50 text-health-200 text-xs font-semibold mb-3">
              <Pill className="w-3.5 h-3.5 text-health-400" />
              <span>Real-Time Lucknow Pharmacy Stock &amp; Substitutes</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {language === "hi"
                ? "दवा खोजें एवं जन औषधि विकल्प"
                : "Find Medicines & Jan Aushadhi Substitutes"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-health-100/90">
              {language === "hi"
                ? "ब्रांडेड दवाओं की लाइव उपलब्धता जांचें और 85% तक सस्ते सरकारी जन औषधि विकल्पों की तुलना करें।"
                : "Check store inventory, fair price-per-unit comparisons, and DPCO ceiling prices across Lucknow."}
            </p>
          </div>

          {/* Big Search Bar */}
          <div className="mt-6 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brand, salt, or disease (e.g. Paracetamol, Augmentin, Metformin)..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 shadow-lg text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-health-400"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-health-600 hover:bg-health-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Area Filter Chips */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-soft mb-6 flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 pl-2">
            <MapPin className="w-4 h-4 text-health-600" />
            <span>Lucknow Area:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {areas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => handleAreaChange(area)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedArea === area
                  ? "bg-health-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Contextual Health Scheme Banner */}
        {medicines.length > 0 && (
          <div className="mb-6">
            <ContextualSchemeBanner
              medicineName={medicines[0]?.brandName || query}
              salts={medicines.flatMap((m) => m.salts.map((s) => s.name))}
              isChronic={medicines.some((m) =>
                m.salts.some((s) =>
                  s.category.toLowerCase().includes("diabetic") ||
                  s.category.toLowerCase().includes("cardiac") ||
                  s.category.toLowerCase().includes("hypertensive")
                )
              )}
            />
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : medicines.length === 0 ? (
          <EmptyState
            title="No medicines found"
            description={`We couldn't find any medicine matching "${query}". Try searching by salt name like Paracetamol, Metformin, or Amoxicillin.`}
            actionHref="/prescription"
            actionText="Scan Doctor's Rx Instead"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500">
              <span>
                Showing {medicines.length} medicine results in <strong>{selectedArea}</strong>
              </span>
              <span>Sorted by Relevance &amp; Stock</span>
            </div>

            <div className="space-y-5">
              {medicines.map((med) => {
                const saltsText = med.salts
                  .map((s) => `${s.name} ${s.strength}`)
                  .join(" + ");

                return (
                  <div
                    key={med.id}
                    className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
                  >
                    {/* Top Row: Brand, Category, Pack MRP */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            {med.brandName}
                          </h3>
                          {med.isJanAushadhi && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Jan Aushadhi Kendra
                            </span>
                          )}
                          {med.isScheduledPriceControlled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                              DPCO Price Controlled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {med.manufacturer} • Pack of {med.packSize} {med.dosageForm}s
                        </p>
                        <p className="text-xs font-semibold text-health-800 mt-1">
                          Active Salts: {saltsText}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs text-slate-400 block font-semibold">Maximum Retail Price</span>
                        <div className="flex items-baseline sm:justify-end gap-1.5">
                          <span className="text-2xl font-black text-slate-900">
                            ₹{med.lowestPrice.toFixed(1)}
                          </span>
                          {med.lowestPrice < med.mrp && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{med.mrp.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          ₹{med.unitPrice.toFixed(2)} / {med.dosageForm}
                        </span>
                      </div>
                    </div>

                    {/* Store Availability Badge */}
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        In stock at <strong>{med.inStockCount}</strong> pharmacies near {selectedArea}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Pack Size: {med.packSize} units
                      </span>
                    </div>

                    {/* Generic Substitution Engine Panel */}
                    <SubstitutePanel
                      medicineId={med.id}
                      medicineName={med.brandName}
                      defaultExpanded={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
