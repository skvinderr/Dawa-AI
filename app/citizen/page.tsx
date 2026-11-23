"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  Search,
  UploadCloud,
  ShoppingBag,
  ShieldAlert,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  User,
  HeartPulse,
  Phone,
  Store,
  ChevronRight,
  AlertCircle,
  Award,
} from "lucide-react";

interface CitizenUser {
  id: string;
  name: string;
  age: number;
  category: string;
  phone: string;
  condition: string;
  scheme: string;
  savedTotal: number;
}

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { language } = useTranslation();

  const [user, setUser] = useState<CitizenUser>({
    id: "user-ram",
    name: "Ram Swaroop Shukla",
    age: 72,
    category: "Senior Citizen (70+)",
    phone: "+91 98390 12001",
    condition: "Type-2 Diabetes & Hypertension",
    scheme: "Ayushman Bharat PM-JAY Vay Vandana",
    savedTotal: 3450,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeHoldCount, setActiveHoldCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dawaasetu_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }

      // Check active orders
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            const pending = data.orders.filter(
              (o: any) => o.status === "HOLD_REQUESTED" || o.status === "CONFIRMED" || o.status === "READY"
            );
            setActiveHoldCount(pending.length);
          }
        })
        .catch((e) => console.warn(e));
    } catch (e) {
      console.warn("User load error:", e);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const quickPopularMedicines = [
    { name: "Augmentin 625", generic: "Jan Aushadhi Amoxyclav", save: "75%" },
    { name: "Dolo 650", generic: "Jan Aushadhi Paracetamol", save: "65%" },
    { name: "Glycomet 500", generic: "Jan Aushadhi Metformin", save: "83%" },
    { name: "Telma 40", generic: "Jan Aushadhi Telmisartan", save: "84%" },
    { name: "Pan 40", generic: "Jan Aushadhi Pantoprazole", save: "81%" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Personalized Welcome Header */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-health-700/60 backdrop-blur-sm border border-health-500/40 px-3 py-1 rounded-full text-xs font-semibold text-teal-200">
            <User className="w-3.5 h-3.5 text-emerald-300" />
            <span>Citizen Health &amp; Medicine Hub &bull; Lucknow, UP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-teal-100">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
              {user.age} Years &bull; {user.category}
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
              Condition: {user.condition}
            </span>
          </div>
        </div>

        {/* Lifetime Savings Card */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shrink-0 text-left md:text-right space-y-1">
          <div className="text-xs font-bold text-teal-200 uppercase tracking-wider">
            Your Lifetime Medicine Savings
          </div>
          <div className="text-3xl font-black text-emerald-300">
            ₹{user.savedTotal.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-teal-100">Saved by choosing Jan Aushadhi &amp; Generics</p>
        </div>
      </div>

      {/* Quick Search & Popular Chips */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prescribed medicine (e.g. Augmentin, Dolo, Telma, Metformin)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-health-500"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 bg-health-700 hover:bg-health-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            Find Stock
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Savings:
          </span>
          {quickPopularMedicines.map((med) => (
            <Link
              key={med.name}
              href={`/search?q=${encodeURIComponent(med.name)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-health-50 text-slate-700 hover:text-health-800 font-semibold text-xs border border-slate-200 transition-colors"
            >
              <span>{med.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                {med.save} off
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 5 Core Citizen Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Action 1: Search Medicines */}
        <Link
          href="/search"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-health-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Discover In-Stock Medicines
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find which nearby pharmacy currently has your prescribed medicine, check prices, and view certified Jan Aushadhi generic substitutes.
            </p>
          </div>
          <div className="text-xs font-bold text-health-700 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Search Nearby Stock</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 2: Prescription AI Scanner */}
        <Link
          href="/prescription"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Scan Doctor&apos;s Prescription (AI)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload or snap a photo of doctor handwriting. Gemini extracts medicine names, dosages, and calculates single-store optimized basket savings.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-700 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Scan Prescription</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 3: My 2-Hour Holds & Orders */}
        <Link
          href="/orders"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform relative">
              <ShoppingBag className="w-6 h-6" />
              {activeHoldCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {activeHoldCount}
                </span>
              )}
            </div>
            <h3 className="font-bold text-base text-slate-900">
              My 2-Hour Holds &amp; Cart
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track live countdown timers for your medicine reservations, view stepper status updates, and chat directly with your dispensing chemist.
            </p>
          </div>
          <div className="text-xs font-bold text-teal-700 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>
              {activeHoldCount > 0 ? `${activeHoldCount} Active Hold(s)` : "View My Orders"}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 4: Healthcare Schemes & Subsidies */}
        <Link
          href="/schemes"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-health-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Government Schemes Evaluator
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Check your eligibility in 30 seconds for Ayushman Bharat (₹5 Lakh cover), UP Mukhyamantri Jan Arogya, PMSMA maternal subsidies, and free chronic medicines.
            </p>
          </div>
          <div className="text-xs font-bold text-amber-700 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Check My Subsidies</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 5: Community Impact */}
        <Link
          href="/impact"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-health-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Statewide Generic Impact
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View live community savings analytics across Uttar Pradesh, district adoption charts, and generate your personal downloadable savings achievement card.
            </p>
          </div>
          <div className="text-xs font-bold text-blue-700 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>View UP Impact</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Switch Persona Card */}
        <Link
          href="/login?role=citizen"
          className="bg-slate-100/70 p-6 rounded-3xl border border-dashed border-slate-300 hover:border-slate-400 transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              Persona
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              Switch Citizen Profile
            </h3>
            <p className="text-xs text-slate-500 leading-snug">
              Currently signed in as <strong>{user.name}</strong> ({user.category}). Test with Sunita (Maternal) or Aslam (BPL).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            Change Citizen Account &rarr;
          </span>
        </Link>
      </div>

      {/* Personalized Entitlement Recommendation Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Personalized Entitlement Alert
            </span>
            <h3 className="font-bold text-base text-emerald-950 mt-0.5">
              {user.scheme}
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Based on your age ({user.age} yrs) and category ({user.category}), you qualify for 100% free secondary &amp; tertiary hospital care and monthly essential medicines.
            </p>
          </div>
        </div>

        <Link
          href="/schemes"
          className="shrink-0 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          View Scheme Guidelines &rarr;
        </Link>
      </div>
    </div>
  );
}
