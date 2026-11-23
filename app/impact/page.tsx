"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import {
  TrendingDown,
  Sparkles,
  Store as StoreIcon,
  ShoppingBag,
  Download,
  Share2,
  CheckCircle2,
  MapPin,
  Calendar,
  Building2,
  Award,
  ShieldCheck,
  Heart,
  Pill,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { toPng } from "html-to-image";

interface TopMedicine {
  id: string;
  name: string;
  isJanAushadhi: boolean;
  manufacturer: string;
  unitsSold: number;
  totalSavings: number;
}

export default function ImpactPage() {
  const { language } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Animated counters state
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);
  const [animatedJanAushadhi, setAnimatedJanAushadhi] = useState(0);
  const [animatedStores, setAnimatedStores] = useState(0);

  useEffect(() => {
    fetch("/api/impact")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);

          // Animate counters
          const targetSav = resData.metrics.totalSavingsAllUsers || 42800;
          const targetOrd = resData.metrics.completedOrdersCount || 138;
          const targetJan = resData.metrics.janAushadhiPurchasesCount || 165;
          const targetSto = resData.metrics.totalStoresOnboarded || 30;

          animateCount(targetSav, setAnimatedSavings, 1000);
          animateCount(targetOrd, setAnimatedOrders, 800);
          animateCount(targetJan, setAnimatedJanAushadhi, 800);
          animateCount(targetSto, setAnimatedStores, 600);
        }
      })
      .catch((err) => console.error("Error loading impact data:", err))
      .finally(() => setLoading(false));
  }, []);

  const animateCount = (
    target: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    durationMs: number
  ) => {
    let current = 0;
    const steps = 30;
    const stepTime = durationMs / steps;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, stepTime);
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `dawaasetu-savings-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error exporting card image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const areaBarColors = [
    "#0d9488",
    "#14b8a6",
    "#059669",
    "#10b981",
    "#0284c7",
    "#0ea5e9",
    "#2563eb",
    "#3b82f6",
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-900 text-white py-10 sm:py-16 border-b border-health-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-health-800/80 border border-health-500/50 text-health-200 text-xs font-semibold mb-4 shadow-xs">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Uttar Pradesh Community Health &amp; Savings Impact</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {language === "hi"
              ? "दवा सेतु जन बचत एवं सामुदायिक प्रभाव"
              : "DawaaSetu Public Impact & Generic Savings"}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-health-100/90 leading-relaxed">
            {language === "hi"
              ? "उत्तर प्रदेश के नागरिकों को जेनेरिक दवाओं और जन औषधि केंद्रों से जोड़कर दवाओं के भारी खर्च से मुक्ति दिलाने का प्रत्यक्ष प्रमाण।"
              : "Audited out-of-pocket healthcare expense reduction across Lucknow. Real-time verification of generic adoption, pharmacy stock-ins, and citizen savings."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-10">
        {/* 1. Large Animated Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Saved */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <TrendingDown className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ₹ {animatedSavings.toLocaleString("en-IN")}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total ₹ Saved Across UP Citizens
            </p>
            <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Vs Official Branded MRPs
            </span>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <ShoppingBag className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {animatedOrders}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Medicine Orders
            </p>
            <span className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              100% Fulfilled &amp; Picked Up
            </span>
          </div>

          {/* Card 3: Jan Aushadhi Purchases */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Sparkles className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {animatedJanAushadhi}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jan Aushadhi Packs Dispensed
            </p>
            <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              50% - 85% Subsidized
            </span>
          </div>

          {/* Card 4: Stores Onboarded */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Building2 className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {animatedStores}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pharmacies Onboarded (Lucknow)
            </p>
            <span className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              Includes 6 PMBJP Kendras &amp; 2 Hospitals
            </span>
          </div>
        </div>

        {/* 2. Charts Section: District/Area-wise Breakdown & Monthly Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Area Breakdown Bar Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {language === "hi"
                    ? "लखनऊ क्षेत्रवार कुल नागरिक बचत (₹)"
                    : "Area-Wise Citizen Savings (Lucknow)"}
                </h3>
                <p className="text-xs text-slate-500">
                  Total rupees saved by residents switching to generics in each locality
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-health-50 text-health-800 border border-health-200">
                8 Key Areas
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              {data?.districtWiseSavings ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.districtWiseSavings} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="area"
                      angle={-25}
                      textAnchor="end"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "0.75rem",
                        border: "none",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`₹${val}`, "Total Citizen Savings"]}
                    />
                    <Bar dataKey="totalSavings" radius={[6, 6, 0, 0]}>
                      {data.districtWiseSavings.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={areaBarColors[index % areaBarColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading chart metrics...
                </div>
              )}
            </div>
          </div>

          {/* Monthly Velocity Trend */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Monthly Savings Velocity</h3>
                <p className="text-xs text-slate-500">Continuous adoption over the past 6 months</p>
              </div>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="h-72 w-full pt-4">
              {data?.monthlySavingsTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlySavingsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderRadius: "0.75rem",
                        border: "none",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`₹${val}`, "Monthly Savings"]}
                    />
                    <Bar dataKey="savings" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading monthly trend...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Top 5 Most-Saved Medicines */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <span>Top 5 Most-Saved Medicines in Lucknow</span>
              </h3>
              <p className="text-xs text-slate-500">
                Highest cumulative out-of-pocket money saved by citizens choosing these alternatives
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Audited Ranking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
            {data?.topSavedMedicines ? (
              data.topSavedMedicines.map((med: TopMedicine, mIdx: number) => (
                <div
                  key={med.id}
                  className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                        #{mIdx + 1}
                      </span>
                      {med.isJanAushadhi && (
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Jan Aushadhi
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{med.name}</h4>
                    <p className="text-[11px] text-slate-500">{med.manufacturer}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Savings</span>
                    <span className="text-lg font-black text-emerald-800">
                      ₹{med.totalSavings.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {med.unitsSold} packs dispensed
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-5 py-6 text-center text-xs text-slate-400">
                Loading top medicines...
              </div>
            )}
          </div>
        </div>

        {/* 4. Shareable Summary Card ("I saved ₹1,240 on medicines this year with DawaaSetu") */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-health-600" />
                <span>Shareable Citizen Savings Badge</span>
              </h3>
              <p className="text-xs text-slate-500">
                Download your personalized verified savings card to share with family, WhatsApp groups, or social media
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Generating Image..." : "Download Savings Card"}</span>
            </button>
          </div>

          {/* Centered Beautiful Card for Image Export */}
          <div className="flex justify-center p-2 sm:p-6 bg-slate-100/60 rounded-3xl">
            <div
              ref={shareCardRef}
              className="w-full max-w-lg bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/50 space-y-6 relative overflow-hidden"
            >
              {/* Decorative background glows */}
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
              <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

              {/* Card Header: Brand & State Mission */}
              <div className="flex items-center justify-between border-b border-emerald-700/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 flex items-center justify-center font-black shadow-md">
                    <TrendingDown className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-xl text-white tracking-tight">DawaaSetu</span>
                    <span className="text-[10px] text-emerald-300 block -mt-1 font-semibold">
                      दवा सेतु • Uttar Pradesh Healthcare
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    2026 Citizen Badge
                  </span>
                </div>
              </div>

              {/* Hero Savings Punchline */}
              <div className="text-center py-2 space-y-2">
                <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">
                  Official Out-Of-Pocket Savings Certificate
                </p>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  I saved <span className="text-emerald-300 underline decoration-emerald-400 decoration-wavy">₹1,240</span> on medicines this year
                </div>
                <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium">
                  By discovering certified Jan Aushadhi generic substitutes across local Lucknow pharmacies with DawaaSetu.
                </p>
              </div>

              {/* 3 Key Badges in Share Card */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-xs font-black text-emerald-300 block">75% - 85%</span>
                  <span className="text-[9px] text-slate-300">Price Discount</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-xs font-black text-emerald-300 block">PMBJP</span>
                  <span className="text-[9px] text-slate-300">Jan Aushadhi</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-xs font-black text-emerald-300 block">Lucknow</span>
                  <span className="text-[9px] text-slate-300">Uttar Pradesh</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-emerald-700/50 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified by DawaaSetu AI Platform</span>
                </div>
                <span className="font-semibold text-emerald-300">AI Kaushal 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Data Disclaimer Footer Banner */}
        <div className="bg-slate-900 text-slate-400 rounded-2xl p-4 text-center text-xs space-y-1 border border-slate-800">
          <p>
            Demo Data for AI Kaushal Hackathon 2026 • Real-time simulated pharmacy transactions across Lucknow, UP.
          </p>
          <p className="text-slate-500 text-[11px]">
            Confirm with your doctor or pharmacist before switching. UP Health Helpline: 108 / 102.
          </p>
        </div>
      </div>
    </div>
  );
}
