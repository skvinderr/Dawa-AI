"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
const HeatmapMap = dynamic(() => import("@/components/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] md:h-[620px] rounded-2xl bg-slate-100 border border-health-200 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-10 h-10 border-4 border-health-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-medium text-sm">Loading UP Geospatial Health Map & Tiles...</span>
    </div>
  ),
});

interface AreaStat {
  area: string;
  lat: number;
  lng: number;
  totalSearches: number;
  baselineNormal: number;
  surgePercent: number;
  riskLevel: "CRITICAL_SURGE" | "ELEVATED" | "NORMAL";
  isOutbreakArea: boolean;
  storesCount: number;
  janAushadhiCount: number;
  zeroStockStoresCount: number;
  topQueries: { name: string; count: number }[];
  recommendation: string;
}

interface StorePin {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  openHours: string;
  totalSkus: number;
  outOfStockCount: number;
  lowStockCount: number;
}

interface HeatmapApiResponse {
  success: boolean;
  timeframeDays: number;
  selectedCategory: string;
  totalEvents: number;
  citywide: {
    totalSignals: number;
    criticalAreasCount: number;
    totalPharmacies: number;
    janAushadhiCount: number;
    janAushadhiCoveragePercent: number;
  };
  criticalAlerts: {
    area: string;
    surgePercent: number;
    topMedicine: string;
    recommendation: string;
  }[];
  areas: AreaStat[];
  heatmapPoints: [number, number, number][];
  stores: StorePin[];
}

export default function AdminHeatmapPage() {
  const [data, setData] = useState<HeatmapApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [days, setDays] = useState(7);
  const [filterMode, setFilterMode] = useState<"ALL" | "HEATMAP" | "STORES">("ALL");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/heatmap?category=${selectedCategory}&days=${days}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load heatmap data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, days]);

  const handleSimulateDispatch = (areaName: string, medName: string) => {
    setDispatchToast(
      `Dispatched alert to UP Medical Supplies Corporation (UPMSCL): 500 buffer packs of ${medName} routed to ${areaName} Jan Aushadhi Kendras.`
    );
    setTimeout(() => {
      setDispatchToast(null);
    }, 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-health-700/60 backdrop-blur-sm border border-health-500/40 px-3 py-1 rounded-full text-xs font-semibold text-teal-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Uttar Pradesh Department of Health & Family Welfare &bull; Live Telemetry
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Medicine Shortage & Outbreak Heatmap
          </h1>
          <p className="text-teal-100/90 text-sm md:text-base leading-relaxed">
            Real-time geospatial epidemiology and pharmaceutical supply surveillance across Lucknow and UP districts.
            Detects fever spikes, antibiotic surges, and zero-stock pharmacy hotspots to route emergency generic buffer stock.
          </p>
        </div>
      </div>

      {/* Simulated Dispatch Notification Banner */}
      {dispatchToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{dispatchToast}</span>
          </div>
          <button
            onClick={() => setDispatchToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Surveillance Signals</span>
            <Search className="w-4 h-4 text-health-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? "..." : data?.citywide.totalSignals || 0}
          </div>
          <div className="text-xs text-slate-500">Citizen search events in last {days} days</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-200 bg-red-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-red-600 text-xs font-medium uppercase tracking-wider">
            <span>Critical Outbreak Zones</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {loading ? "..." : data?.citywide.criticalAreasCount || 0}
          </div>
          <div className="text-xs text-red-600 font-medium">Chowk &amp; Alambagh (&gt;+80% surge)</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Jan Aushadhi Ratio</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? "..." : `${data?.citywide.janAushadhiCoveragePercent || 0}%`}
          </div>
          <div className="text-xs text-slate-500">
            {data?.citywide.janAushadhiCount || 0} PMBJP Kendras in active grid
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
            <span>Pharmacies Monitored</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? "..." : data?.citywide.totalPharmacies || 0}
          </div>
          <div className="text-xs text-slate-500">Real-time inventory synced</div>
        </div>
      </div>

      {/* Outbreak Alert Banner */}
      {data && data.criticalAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-amber-900">
                Epidemic Signal Detected: {data.criticalAlerts.map((a) => a.area).join(" & ")}
              </h3>
              <p className="text-sm text-amber-800 mt-0.5">
                Significant spike in citizen searches for Paracetamol, ORS, and Azithromycin (+120% vs normal baseline).
                Indicates localized viral fever / seasonal gastroenteritis cluster in Old Lucknow.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              handleSimulateDispatch(data.criticalAlerts[0]?.area || "Chowk", "Paracetamol & ORS")
            }
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Trigger Jan Aushadhi Buffer Dispatch
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {[
            { id: "all", label: "All Medicines" },
            { id: "fever", label: "Fever & Pain (Paracetamol)" },
            { id: "antibiotic", label: "Antibiotics (Azithro/Amoxi)" },
            { id: "ors", label: "Dehydration & ORS" },
            { id: "cardiac", label: "Cardiac & BP" },
            { id: "diabetes", label: "Diabetes (Metformin)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-health-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Time Window and Layer Mode Controls */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Timeframe */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-health-500"
          >
            <option value={1}>Last 24 Hours</option>
            <option value={3}>Last 3 Days</option>
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>

          {/* Layer View Mode */}
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100">
            {(["ALL", "HEATMAP", "STORES"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  filterMode === mode
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {mode === "ALL" ? "All" : mode === "HEATMAP" ? "Heatmap" : "Pharmacies"}
              </button>
            ))}
          </div>

          <button
            onClick={fetchHeatmapData}
            title="Refresh Telemetry"
            className="p-1.5 text-slate-500 hover:text-health-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-health-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Interactive Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-medium">
            OpenStreetMap live tiles with Leaflet.heat overlay. Click any cluster or store pin to inspect real-time inventory.
          </span>
          <span className="font-semibold text-health-700">Coordinates: 26.8467° N, 80.9462° E (Lucknow, UP)</span>
        </div>
        <HeatmapMap
          areas={data?.areas || []}
          stores={data?.stores || []}
          heatmapPoints={data?.heatmapPoints || []}
          selectedArea={selectedArea}
          onSelectArea={(area) => setSelectedArea(area)}
          filterMode={filterMode}
        />
      </div>

      {/* Area Breakdown & Action Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              District Surveillance Hotspots by Area
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by search volume anomaly and disease cluster indicators
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
            {data?.areas.length || 0} Areas Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Area / Locality</th>
                <th className="py-3 px-4">Surveillance Volume</th>
                <th className="py-3 px-4">Surge Anomaly</th>
                <th className="py-3 px-4">Top Requested Salts / Meds</th>
                <th className="py-3 px-4">Jan Aushadhi Coverage</th>
                <th className="py-3 px-4">Health Officer Action</th>
                <th className="py-3 px-4 text-right">Map</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.areas.map((a) => {
                const isCritical = a.riskLevel === "CRITICAL_SURGE";
                const isElevated = a.riskLevel === "ELEVATED";

                return (
                  <tr
                    key={a.area}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      selectedArea === a.area ? "bg-health-50/50" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{a.area}</span>
                        {isCritical && (
                          <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            OUTBREAK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{a.totalSearches}</span> searches
                      <span className="block text-[10px] text-slate-400">Baseline: {a.baselineNormal}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold ${
                          isCritical
                            ? "bg-red-100 text-red-800"
                            : isElevated
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {a.surgePercent > 0 ? "+" : ""}
                        {a.surgePercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {a.topQueries.map((q) => (
                          <span
                            key={q.name}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]"
                          >
                            {q.name} ({q.count})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">
                        {a.janAushadhiCount} / {a.storesCount} stores
                      </span>
                      {a.zeroStockStoresCount > 0 && (
                        <span className="block text-[10px] text-red-600 font-semibold">
                          {a.zeroStockStoresCount} stores with stockout
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-700 leading-snug">{a.recommendation}</p>
                      {isCritical && (
                        <button
                          onClick={() =>
                            handleSimulateDispatch(a.area, a.topQueries[0]?.name || "Paracetamol")
                          }
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-teal-700 font-bold hover:underline"
                        >
                          <Send className="w-3 h-3" /> Dispatch Stock
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedArea(a.area)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-health-100 hover:text-health-700 rounded text-slate-700 text-xs font-semibold transition-colors"
                      >
                        View Pin
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Navigation Footer */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Info className="w-4 h-4 text-slate-400" />
          <span>
            Epidemiological signals are computed from anonymous, area-level citizen medicine discovery telemetry (zero PII stored).
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/impact"
            className="text-health-700 hover:text-health-800 font-bold inline-flex items-center gap-1"
          >
            Community Generic Impact &rarr;
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/schemes"
            className="text-health-700 hover:text-health-800 font-bold inline-flex items-center gap-1"
          >
            UP Healthcare Schemes &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
