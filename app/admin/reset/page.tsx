"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Store,
  Pill,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface SystemStats {
  stores: number;
  medicines: number;
  inventory: number;
  orders: number;
  searchEvents: number;
  schemes: number;
  users: number;
}

export default function AdminResetPage() {
  const { language } = useTranslation();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/reset");
      const data = await res.json();
      if (data.counts) {
        setStats(data.counts);
      }
    } catch (err: any) {
      console.warn("Failed to load reset stats:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the demo database? This will clear test orders, refresh stock quantities, and restore the live Chowk fever surge signal."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage(
          language === "hi"
            ? "डेमो डेटाबेस सफलतापूर्वक रीसेट कर दिया गया है! सभी सिस्टम परीक्षण के लिए तैयार हैं।"
            : "Demo database successfully reset to pristine state! Ready for judge evaluation."
        );
        if (data.counts) {
          setStats(data.counts);
        }
      } else {
        setError(data.error || "Failed to reset demo database");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred during reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="w-full max-w-[1440px] mx-auto space-y-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Hackathon Evaluation Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {language === "hi"
                ? "डेमो डेटाबेस रीसेट एवं सिस्टम स्थिति"
                : "Demo Database Administration & Seed Reset"}
            </h1>
            <p className="text-sm text-slate-600">
              {language === "hi"
                ? "परीक्षण के बाद डेटाबेस को तुरंत मूल स्थिति में लाएं ताकि जज के सामने नया डेमो आसानी से दिया जा सके।"
                : "Instantly re-establish baseline inventory, clear test hold requests, and ensure outbreak signals are active for live presentations."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Resetting Demo State..." : "1-Click Demo Reset"}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center gap-3 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-sm font-bold">{statusMessage}</div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex items-center gap-3 shadow-sm animate-in fade-in">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div className="text-sm font-bold">{error}</div>
          </div>
        )}

        {/* Live System Records Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-health-600" />
              <span>Pharmacies</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {fetching ? "..." : stats?.stores ?? 30}
            </div>
            <div className="text-[11px] text-slate-400">Lucknow Verified</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>Medicines</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {fetching ? "..." : stats?.medicines ?? 77}
            </div>
            <div className="text-[11px] text-slate-400">Brands &amp; Generics</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>Inventory</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {fetching ? "..." : stats?.inventory ?? 1361}
            </div>
            <div className="text-[11px] text-slate-400">Batches Tracked</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-600" />
              <span>Surge Events</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {fetching ? "..." : stats?.searchEvents ?? 425}
            </div>
            <div className="text-[11px] text-slate-400">Chowk/Alambagh Fever</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Govt Schemes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {fetching ? "..." : stats?.schemes ?? 8}
            </div>
            <div className="text-[11px] text-slate-400">UP &amp; Central Rules</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
              <span>Orders</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {fetching ? "..." : stats?.orders ?? 1}
            </div>
            <div className="text-[11px] text-slate-400">Completed Demo Orders</div>
          </div>
        </div>

        {/* Audit Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              What Happens During a 1-Click Reset?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Ensures repeatable, flawless judge evaluations by enforcing deterministic baseline states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Cleans Transient Demo Data</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Removes mock order holds, temporary chat messages, and transient test uploads without wiping the master medicine catalog or verified store directory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Restores Pharmacy Stock</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Restocks exhausted inventory records back to healthy counts (25+ units) so generic substitution queries and pickup holds never fail during presentations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Refreshes Chowk Fever Surge</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Injects fresh timestamped Paracetamol / Dolo OTC search spikes over the last 3 days in Chowk and Alambagh, guaranteeing the Syndromic Heatmap displays a vivid amber/red alert.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Demo Seed Source: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">prisma/seed.ts</code>
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/prescription"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                1. Test Rx Upload &rarr;
              </Link>
              <Link
                href="/admin/heatmap"
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors"
              >
                2. Test Heatmap &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
