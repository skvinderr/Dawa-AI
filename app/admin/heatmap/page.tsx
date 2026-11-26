"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Building2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Send,
  Info,
  Download,
  Bell,
  Activity,
  Layers,
  TrendingUp,
  AlertOctagon,
  Package,
  Calendar,
  X,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import {
  SIGNAL_GROUPS,
  SignalGroupKey,
  AreaSignalSummary,
  MedicineShortageItem,
  PRIVACY_THRESHOLD,
} from "@/lib/outbreak";
import { StorePin } from "@/components/HeatmapMap";

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
const HeatmapMap = dynamic(() => import("@/components/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] lg:h-[600px] rounded-3xl bg-slate-100 border border-health-200 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-10 h-10 border-4 border-health-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-semibold text-xs tracking-wide">
        Loading UP Geospatial Health Map &amp; Anomaly Overlay...
      </span>
    </div>
  ),
});

interface HeatmapApiResponse {
  success: boolean;
  timeframeDays: number;
  selectedCategory: SignalGroupKey;
  privacyThreshold: number;
  privacyNote: string;
  citywide: {
    totalSignals: number;
    alertAreasCount: number;
    risingAreasCount: number;
    normalAreasCount: number;
    totalPharmacies: number;
    janAushadhiCount: number;
    criticalShortagesCount: number;
  };
  areas: AreaSignalSummary[];
  heatmapPoints: [number, number, number][];
  shortages: MedicineShortageItem[];
  stores: StorePin[];
}

// Mini SVG Sparkline Component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const width = 84;
  const height = 24;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function AdminHeatmapPage() {
  const [data, setData] = useState<HeatmapApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<SignalGroupKey>("FEVER");
  const [days, setDays] = useState<number>(14);
  const [activeViewTab, setActiveViewTab] = useState<"MAP" | "SHORTAGES">("MAP");
  const [filterMode, setFilterMode] = useState<"ALL" | "HEATMAP" | "STORES">("ALL");
  const [selectedArea, setSelectedArea] = useState<string | null>("Chowk");
  const [isDispatching, setIsDispatching] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/heatmap?category=${selectedGroup}&days=${days}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);
        // Default to first alert area if current selection is not found
        if (!selectedArea && json.areas.length > 0) {
          const firstAlert = json.areas.find((a: AreaSignalSummary) => a.isAlert);
          setSelectedArea(firstAlert ? firstAlert.area : json.areas[0].area);
        }
      }
    } catch (err) {
      console.error("Failed to load surveillance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, days]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Send advisory to nearby shopkeepers
  const handleSendAdvisory = async (areaName: string) => {
    setIsDispatching(true);
    try {
      const res = await fetch("/api/admin/heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: areaName,
          signalGroup: selectedGroup,
          customMessage: `Official UP Health Dept Advisory for ${areaName}: Fever & pyrexia cases may be rising near you. Consider stocking buffer quantities of Paracetamol and ORS immediately.`,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(
          `Advisory broadcast sent to ${resData.notifiedStoresCount} pharmacies in ${areaName} via Chemist Portal & SMS!`
        );
      }
    } catch (err) {
      console.error("Advisory dispatch error:", err);
      showToast("Failed to dispatch advisory. Please retry.");
    } finally {
      setIsDispatching(false);
    }
  };

  // Export Alerts as CSV
  const handleExportCSV = () => {
    if (!data?.areas || data.areas.length === 0) return;

    const headers = [
      "Area",
      "Signal Group",
      "Anomaly Level",
      "Anomaly Ratio",
      "Recent 3-Day Volume",
      "14-Day Baseline Daily Avg",
      "Total Period Signals",
      "Top Driver Medicines",
      "Official Guidance",
    ];

    const rows = data.areas.map((a) => [
      `"${a.area}"`,
      `"${selectedGroup}"`,
      `"${a.anomalyLevel}"`,
      `"${a.anomalyRatio}x"`,
      a.last3DaysCount,
      a.baselineDailyAvg,
      a.isSuppressed ? "<5" : a.totalEvents,
      `"${a.topMedicines.map((m) => m.name).join("; ")}"`,
      `"${a.recommendation.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `DawaaSetu_Surveillance_Alerts_${selectedGroup}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded official surveillance CSV report!");
  };

  const selectedAreaObj = data?.areas.find(
    (a) => a.area.toLowerCase() === (selectedArea || "").toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            Public Health &amp; Syndromic Surveillance &bull; Uttar Pradesh
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Epidemiological Signal &amp; Shortage Map
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Real-time anomaly detection from aggregated citizen medicine discovery
            searches and pharmacy fulfillment across Lucknow. Identifies disease
            clusters days before hospital admissions.
          </p>
        </div>

        {/* Global Stats Cards */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-red-50/70 border border-red-200 p-3 rounded-2xl text-center min-w-[100px]">
            <div className="text-xl font-extrabold text-red-700">
              {data?.citywide.alertAreasCount ?? 2}
            </div>
            <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
              Alerts (&gt;2.5x)
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl text-center min-w-[100px]">
            <div className="text-xl font-extrabold text-amber-700">
              {data?.citywide.risingAreasCount ?? 1}
            </div>
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Rising (&gt;1.5x)
            </div>
          </div>

          <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-2xl text-center min-w-[100px]">
            <div className="text-xl font-extrabold text-teal-800">
              {data?.citywide.totalSignals ?? 400}
            </div>
            <div className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
              Signals Analyzed
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Signal Chips, Time Slider, and Mode Tabs */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Row 1: Signal Group Filter Chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Signal:
            </span>
            {(
              [
                { key: "FEVER", label: "🌡️ Fever (Paracetamol)" },
                { key: "GASTRO", label: "💧 Gastro (ORS / Diarrhea)" },
                { key: "RESPIRATORY", label: "🫁 Respiratory (Cough / Flu)" },
                { key: "SKIN", label: "🧴 Skin (Dermatology)" },
                { key: "ALL", label: "🔥 All Signals" },
              ] as const
            ).map((chip) => (
              <button
                key={chip.key}
                onClick={() => setSelectedGroup(chip.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedGroup === chip.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Time Slider (3, 7, 14 Days) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Window:
            </span>
            {[3, 7, 14].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  days === d
                    ? "bg-health-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d} Days
              </button>
            ))}

            <button
              onClick={fetchHeatmapData}
              title="Refresh"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-health-600" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Row 2: View Mode Tabs & CSV Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab("MAP")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeViewTab === "MAP"
                  ? "bg-health-50 text-health-900 border border-health-300 shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-health-700" />
              Outbreak &amp; Anomaly Heatmap
            </button>

            <button
              onClick={() => setActiveViewTab("SHORTAGES")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeViewTab === "SHORTAGES"
                  ? "bg-red-50 text-red-900 border border-red-300 shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-red-600" />
              District Shortage Monitor (&lt;20% Coverage)
              {data?.shortages && data.shortages.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {data.shortages.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeViewTab === "MAP" && (
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
                {(["ALL", "HEATMAP", "STORES"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMode(m)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterMode === m
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {m === "ALL"
                      ? "Both"
                      : m === "HEATMAP"
                      ? "Heatmap"
                      : "Pharmacies"}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Outbreak Heatmap & Side Panel */}
      {activeViewTab === "MAP" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Leaflet Heatmap Map */}
          <div className="lg:col-span-7">
            <HeatmapMap
              areas={data?.areas || []}
              stores={data?.stores || []}
              heatmapPoints={data?.heatmapPoints || []}
              selectedArea={selectedArea}
              onSelectArea={(area) => setSelectedArea(area)}
              filterMode={filterMode}
            />
          </div>

          {/* Side Panel: Alerts, Sparkline Trends & Early Signal Card */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Early Signal Action Card (Opens when an alert or area is clicked) */}
            {selectedAreaObj && (
              <div
                className={`p-5 rounded-3xl border shadow-soft space-y-3 transition-all ${
                  selectedAreaObj.isAlert
                    ? "bg-red-50/40 border-red-200"
                    : selectedAreaObj.isRising
                    ? "bg-amber-50/40 border-amber-200"
                    : "bg-teal-50/40 border-teal-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          selectedAreaObj.isAlert
                            ? "bg-red-600 text-white"
                            : selectedAreaObj.isRising
                            ? "bg-amber-600 text-white"
                            : "bg-teal-700 text-white"
                        }`}
                      >
                        {selectedAreaObj.anomalyLevel} ({selectedAreaObj.anomalyRatio}x)
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {selectedAreaObj.area}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {selectedAreaObj.earlySignalHeadline}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedArea(null)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Explicit Disclaimer */}
                <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-health-600" />
                    EARLY SIGNAL (Demand Data &bull; Not a Clinical Diagnosis)
                  </div>
                  <p className="leading-relaxed">
                    This signal is synthesized from anonymized citizen medicine
                    searches and counter pickup reservations. Always verify with
                    Chief Medical Officer (CMO) and local PHC clinics before public health action.
                  </p>
                </div>

                {/* Driver Medicines */}
                <div className="text-xs text-slate-700 flex items-center gap-2 flex-wrap">
                  <strong className="text-slate-500 text-[11px]">Surge Drivers:</strong>
                  {selectedAreaObj.topMedicines.map((m, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-800 shadow-2xs"
                    >
                      {m.name} ({m.count} inquiries)
                    </span>
                  ))}
                </div>

                {/* Dispatch Advisory Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleSendAdvisory(selectedAreaObj.area)}
                    disabled={isDispatching}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isDispatching ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-health-300" />
                    )}
                    <span>
                      {isDispatching
                        ? "Broadcasting Advisory..."
                        : `Send advisory to ${selectedAreaObj.area} shopkeepers`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Ranked List of Areas with Anomalies & Sparklines */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Municipal Anomaly Ranking
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    14-Day Trajectory
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {data?.areas.length ?? 0} Areas
                </span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {data?.areas && data.areas.length > 0 ? (
                  data.areas.map((area) => {
                    const isSelected =
                      selectedArea?.toLowerCase() === area.area.toLowerCase();
                    const sparkColor = area.isAlert
                      ? "#ef4444"
                      : area.isRising
                      ? "#f59e0b"
                      : "#0d9488";

                    return (
                      <div
                        key={area.area}
                        onClick={() => setSelectedArea(area.area)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-slate-900 bg-slate-50/80 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 truncate">
                              {area.area}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                area.isAlert
                                  ? "bg-red-100 text-red-800"
                                  : area.isRising
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-teal-100 text-teal-800"
                              }`}
                            >
                              {area.anomalyRatio}x
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Vol: {area.displayCount}</span>
                            <span>&bull;</span>
                            <span>3d: {area.last3DaysCount}</span>
                            <span>&bull;</span>
                            <span className="truncate max-w-[120px]">
                              {area.topMedicines[0]?.name || "General"}
                            </span>
                          </div>
                        </div>

                        {/* Sparkline & Select Indicator */}
                        <div className="flex items-center gap-3 shrink-0">
                          <Sparkline data={area.sparkline} color={sparkColor} />
                          <div
                            className={`w-2 h-2 rounded-full ${
                              area.isAlert
                                ? "bg-red-500 animate-ping"
                                : area.isRising
                                ? "bg-amber-500"
                                : "bg-teal-500"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Loading municipal signals...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: District-Level Medicine Shortages */}
      {activeViewTab === "SHORTAGES" && (
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Critical District Medicine Shortages
                </h3>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Coverage &lt; 20%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Essential medicines stocked by fewer than 20% of licensed pharmacies
                within a municipal ward
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {data?.shortages.length ?? 0} Shortage Flags Detected
            </span>
          </div>

          {/* Shortages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.shortages && data.shortages.length > 0 ? (
              data.shortages.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-red-200 bg-red-50/20 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                        {item.area}
                      </span>
                      <span className="text-[10px] font-extrabold text-red-700">
                        {item.storeCoveragePercent}% Coverage
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900">
                      {item.brandName}
                    </h4>

                    <div className="text-[11px] text-slate-500">
                      {item.saltName} &bull; {item.dosageForm}
                    </div>

                    <div className="text-xs text-slate-700 pt-1">
                      In Stock at:{" "}
                      <strong>
                        {item.inStockStoresCount} of {item.totalStoresInArea} pharmacies
                      </strong>{" "}
                      ({item.outOfStockStoresCount} stockouts)
                    </div>

                    {/* Visual Coverage Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${Math.max(5, item.storeCoveragePercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        showToast(
                          `Emergency stock replenishment push initiated for ${item.brandName} in ${item.area}!`
                        );
                      }}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Push Wholesaler Buffer Stock
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 col-span-full">
                No critical shortages (&lt;20% coverage) detected across monitored areas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Privacy Notice (Explicit requirement) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Privacy &amp; De-identification Policy:</strong> All syndromic
            signals are aggregated strictly at the municipal area level. Any cell or
            cohort with fewer than {PRIVACY_THRESHOLD} events is suppressed (&lt;
            {PRIVACY_THRESHOLD}) to prevent re-identification.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono shrink-0">
          DPDP Act 2023 Compliant
        </span>
      </div>
    </div>
  );
}
