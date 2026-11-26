"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { MedicineEmergencyModal } from "@/components/MedicineEmergencyModal";
import {
  Search,
  UploadCloud,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Percent,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Building2,
  CheckCircle2,
  AlertCircle,
  User,
  Store,
  Activity,
  Layers,
  HeartHandshake,
  Clock,
  Award,
  AlertTriangle,
  Zap,
  PhoneCall,
  Check,
  ChevronRight,
  HeartPulse,
} from "lucide-react";

export default function LandingPage() {
  const { t, language, setRole } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const handleSearchSubmit = (query: string) => {
    const q = query.trim() || searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/search");
    }
  };

  const handleSelectRole = (
    role: "citizen" | "shopkeeper" | "admin",
    redirectPath: string
  ) => {
    setRole(role);
    router.push(redirectPath);
  };

  const popularMedicines = [
    { name: "Paracetamol 650mg", brand: "Dolo 650", query: "Paracetamol" },
    { name: "Telmisartan 40mg", brand: "Telma 40", query: "Telmisartan" },
    { name: "Pantoprazole 40mg", brand: "Pan 40", query: "Pantoprazole" },
    { name: "Metformin 500mg", brand: "Glycomet", query: "Metformin" },
    { name: "Azithromycin 500mg", brand: "Azithral", query: "Azithromycin" },
  ];

  const priceComparisons = [
    {
      medicine: "Telmisartan 40mg (10 tabs)",
      use: language === "hi" ? "रक्तचाप (BP)" : "Blood Pressure",
      brandedName: "Telma 40",
      brandedPrice: 145,
      janAushadhiPrice: 18,
      savingsPercent: 88,
    },
    {
      medicine: "Pantoprazole 40mg (10 tabs)",
      use: language === "hi" ? "गैस व एसिडिटी" : "Acidity & GERD",
      brandedName: "Pan 40",
      brandedPrice: 120,
      janAushadhiPrice: 22,
      savingsPercent: 82,
    },
    {
      medicine: "Metformin 500mg SR (10 tabs)",
      use: language === "hi" ? "शुगर (डायबिटीज)" : "Type 2 Diabetes",
      brandedName: "Glycomet 500",
      brandedPrice: 65,
      janAushadhiPrice: 14,
      savingsPercent: 78,
    },
    {
      medicine: "Paracetamol 650mg (15 tabs)",
      use: language === "hi" ? "बुखार एवं दर्द" : "Fever & Pain",
      brandedName: "Dolo 650",
      brandedPrice: 34,
      janAushadhiPrice: 11,
      savingsPercent: 68,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      {/* =========================================================================
          1. HERO SECTION (Full-Width, Edge-to-Edge with Deep Rich Contrast)
         ========================================================================= */}
      <section className="relative w-full bg-gradient-to-b from-slate-950 via-health-950 to-slate-900 text-white pt-12 pb-24 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 xl:px-12 border-b border-health-900/60 overflow-hidden">
        {/* Subtle Tech Grid and Radial Glows */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[350px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto space-y-8 text-center">
          
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>AI Kaushal 24h &bull; Uttar Pradesh Healthcare Mission</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>24x7 Emergency Radar Active</span>
            </div>
          </div>

          {/* Main Headline & Value Proposition */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.15]">
              {language === "hi" ? (
                <>
                  नजदीकी दवाएं एवं <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">70%+ सस्ते जन औषधि विकल्प</span> खोजें
                </>
              ) : (
                <>
                  Find In-Stock Medicines &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">70%+ Cheaper Jan Aushadhi</span> Generics
                </>
              )}
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
              {language === "hi"
                ? "उत्तर प्रदेश के नागरिकों के लिए सटीक सॉल्ट-मैच्ड जन औषधि विकल्प, केमिस्टों के लिए 2 घंटे का नो-प्रीपेमेंट होल्ड, और स्वास्थ्य विभाग के लिए जिलावार महामारी निगरानी।"
                : "Exact salt-matched generic substitutions, real-time nearby stock in Lucknow, zero-prepayment 2-hour pharmacy holds, and AI syndromic outbreak monitoring for Uttar Pradesh."}
            </p>
          </div>

          {/* Integrated Search Box & Emergency Button */}
          <div className="max-w-3xl mx-auto pt-2 space-y-4 text-left">
            <div className="relative bg-white/95 backdrop-blur-xl p-2.5 sm:p-3 rounded-3xl shadow-2xl border-2 border-emerald-500/40">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1">
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={handleSearchSubmit}
                    placeholder={
                      language === "hi"
                        ? "दवा का नाम या सॉल्ट खोजें (जैसे Paracetamol, Telma, Pan 40)..."
                        : "Search medicine brand or salt (e.g. Dolo 650, Telma 40, Pan 40)..."
                    }
                    size="large"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit(searchQuery)}
                    className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-health-700 hover:bg-health-600 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{language === "hi" ? "खोजें" : "Search"}</span>
                  </button>
                  <Link
                    href="/prescription"
                    className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-1.5 border border-slate-300"
                    title="Upload Prescription Photo / PDF"
                  >
                    <UploadCloud className="w-4 h-4 text-health-700" />
                    <span className="hidden sm:inline">{language === "hi" ? "पर्चा स्कैन" : "Scan Rx"}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Medicine Chips & Emergency Shortcut */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
                <span className="font-semibold text-slate-400">
                  {language === "hi" ? "लोकप्रिय:" : "Trending in UP:"}
                </span>
                {popularMedicines.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      setSearchQuery(m.query);
                      handleSearchSubmit(m.query);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white transition-colors border border-white/10"
                  >
                    {m.brand}
                  </button>
                ))}
              </div>

              {/* SOS Emergency Button */}
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-black text-xs shadow-md border border-red-400/50 transition-all active:scale-95 ml-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {language === "hi"
                    ? "🚨 आपातकालीन दवाएं (इंसुलिन / एंटी-वेनम / रेबीज)"
                    : "🚨 Emergency Medicines Radar"}
                </span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. LIVE STATEWIDE METRICS RIBBON (Wide, Expansive)
         ========================================================================= */}
      <section className="relative w-full bg-white border-b border-slate-200 shadow-sm py-6 px-4 sm:px-6 lg:px-8 xl:px-12 -mt-6 sm:-mt-8 z-20">
        <div className="w-full max-w-[1440px] mx-auto bg-gradient-to-r from-emerald-50/60 via-slate-50 to-teal-50/60 rounded-3xl p-4 sm:p-6 border border-emerald-200/60 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            <div className="p-2 sm:p-3 text-center">
              <div className="text-2xl sm:text-4xl font-black text-emerald-600 flex items-center justify-center gap-1">
                <span>₹18.45 Lakh+</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
                {language === "hi" ? "नागरिकों की कुल बचत" : "Citizen Savings Across UP"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified on Completed Orders</p>
            </div>

            <div className="p-2 sm:p-3 text-center">
              <div className="text-2xl sm:text-4xl font-black text-health-700">30+</div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
                {language === "hi" ? "सत्यापित फार्मेसी (लखनऊ)" : "Live Lucknow Chemists"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Jan Aushadhi &amp; Private</p>
            </div>

            <div className="p-2 sm:p-3 text-center">
              <div className="text-2xl sm:text-4xl font-black text-teal-700">1,800+</div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
                {language === "hi" ? "जन औषधि जेनेरिक विकल्प" : "Jan Aushadhi Generics"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Exact Salt &amp; Strength Match</p>
            </div>

            <div className="p-2 sm:p-3 text-center">
              <div className="text-2xl sm:text-4xl font-black text-slate-900">75</div>
              <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
                {language === "hi" ? "यूपी जिले महामारी रडार" : "UP Districts Heatmap"}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Syndromic Early Signals</p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. DEDICATED 3 ROLE PORTALS (Full Width 3-Column Grid)
         ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-[1440px] mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-health-100 text-health-800 border border-health-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Dedicated User Gateways</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {language === "hi" ? "अपनी भूमिका के अनुसार पोर्टल चुनें" : "Select Your Role to Enter"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {language === "hi"
              ? "दवा सेतु नागरिकों, केमिस्टों और स्वास्थ्य विभाग के लिए अलग-अलग विशिष्ट टूल्स प्रदान करता है।"
              : "DawaaSetu separates workflows cleanly for patients, local chemists, and public health officials."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Role 1: Citizen */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-health-600 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-health-50 border border-health-200 flex items-center justify-center text-health-700 group-hover:bg-health-700 group-hover:text-white transition-all shadow-sm">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  {language === "hi" ? "नागरिक पोर्टल" : "Citizen Discovery"}
                </h3>
                <p className="text-xs font-bold text-health-700 uppercase tracking-wider">
                  Patients &bull; Families &bull; Caregivers
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === "hi"
                  ? "नजदीकी मेडिकल स्टोर पर दवा की उपलब्धता देखें, 70-85% सस्ते जन औषधि विकल्प चुनें और 2 घंटे के लिए नो-प्रीपेमेंट होल्ड लगाएं।"
                  : "Search medicine availability across Lucknow, discover verified PM Jan Aushadhi generic substitutes, and hold stock for 2 hours."}
              </p>
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deterministic salt-matching engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2-Hour Zero-Prepayment Hold</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>UP Govt schemes eligibility checker</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole("citizen", "/citizen")}
                className="w-full py-3.5 px-4 rounded-2xl bg-health-700 hover:bg-health-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/login?role=citizen"
                className="text-xs text-center text-slate-500 hover:text-health-700 font-bold py-1"
              >
                Or choose demo citizen persona &rarr;
              </Link>
            </div>
          </div>

          {/* Role 2: Chemist / Shopkeeper */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-sm">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  {language === "hi" ? "केमिस्ट पोर्टल" : "Chemist & Pharmacist"}
                </h3>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  PM Jan Aushadhi &bull; Retail Chemist
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === "hi"
                  ? "होलसेल पर्चे का फोटो खींचकर AI द्वारा 30 सेकंड में स्टॉक अपडेट करें, ग्राहकों के 2 घंटे के होल्ड स्वीकार करें, और लोकल डिमांड देखें।"
                  : "Upload invoice photos for instant OCR stock updates, manage citizen 2-hour holds with live chat, and see unmet local demand."}
              </p>
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Invoice OCR with Gemini fallback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Confirm holds, ready alerts &amp; chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Nearby demand trends within 3 km</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole("shopkeeper", "/shop/dashboard")}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>Enter Chemist Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/login?role=shopkeeper"
                className="text-xs text-center text-slate-500 hover:text-emerald-700 font-bold py-1"
              >
                Or login as demo chemist (Gupta / Chowk) &rarr;
              </Link>
            </div>
          </div>

          {/* Role 3: Health Dept Admin */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-teal-600 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-all shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  {language === "hi" ? "स्वास्थ्य विभाग" : "Health Dept & Admin"}
                </h3>
                <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Epidemiologists &bull; CMO &bull; State Officers
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === "hi"
                  ? "दवाओं की असामान्य मांग (बुखार, गैस्ट्रो, खांसी) के आधार पर शुरुआती प्रकोप का पता लगाएं और 20% से कम स्टॉक वाली दवाओं की निगरानी करें।"
                  : "Monitor syndromic early signals from OTC medicine surges across UP districts, track critical shortages (&lt;20% coverage), and dispatch advisories."}
              </p>
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Real-time syndromic outbreak heatmap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Privacy-preserved 5-event suppression</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Send early advisory to nearby chemists</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole("admin", "/admin/heatmap")}
                className="w-full py-3.5 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>Enter Health Dept Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/login?role=admin"
                className="text-xs text-center text-slate-500 hover:text-teal-800 font-bold py-1"
              >
                Login as UP Health Director &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS (3 Simple Steps with Visual Stepper)
         ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-100 via-white to-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full max-w-[1440px] mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Zap className="w-3.5 h-3.5" />
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              {language === "hi" ? "दवा सेतु कैसे काम करता है?" : "How DawaaSetu Works"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {language === "hi"
                ? "पर्चे से लेकर केमिस्ट से दवा लेने तक की पूरी प्रक्रिया पारदर्शी और आसान है।"
                : "Transparent medicine discovery from prescription to counter in three easy steps."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-health-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {language === "hi" ? "दवा खोजें या पर्चा स्कैन करें" : "Search or Scan Rx"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === "hi"
                  ? "दवा का नाम टाइप करें या डॉक्टर के पर्चे की फोटो अपलोड करें। हमारा सिस्टम तुरंत सॉल्ट और स्ट्रेंथ की पहचान कर लेता है।"
                  : "Type the prescribed brand name or upload a doctor's prescription. Our AI instantly extracts the generic salts and strengths."}
              </p>
              <div className="pt-2">
                <Link
                  href="/prescription"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-health-700 hover:text-health-900"
                >
                  <span>Try Prescription Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {language === "hi" ? "सस्ते जन औषधि विकल्प देखें" : "Compare Jan Aushadhi"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === "hi"
                  ? "डिटर्मिनिस्टिक इंजन हूबहू वही सॉल्ट, स्ट्रेंथ और रूप वाले सरकारी जन औषधि विकल्प दिखाता है, जिससे 70-85% तक बचत होती है।"
                  : "Our deterministic engine verifies exact salt and strength equivalence, ranking verified Jan Aushadhi generics with up to 85% savings."}
              </p>
              <div className="pt-2">
                <Link
                  href="/search?q=Telmisartan"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <span>See Substitution Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white font-black text-xl flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {language === "hi" ? "2 घंटे का होल्ड लगाएं या डिलीवरी पाएं" : "2-Hour Hold & Pickup"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {language === "hi"
                  ? "बिना किसी अग्रिम भुगतान के नजदीकी केमिस्ट पर दवा 2 घंटे के लिए लॉक करें। दुकान पहुंचने पर सीधे काउंटर से लें।"
                  : "Lock your required medicine at the nearest pharmacy for 2 hours with zero prepayment, or request simulated doorstep delivery."}
              </p>
              <div className="pt-2">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                >
                  <span>View Order &amp; Hold Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          5. REAL PRICE COMPARISON SHOWCASE (Why Jan Aushadhi Matters)
         ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-[1440px] mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Verified UP Price Index
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              {language === "hi" ? "ब्रांडेड बनाम जन औषधि: वास्तविक बचत" : "Branded vs. Jan Aushadhi Savings"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              {language === "hi"
                ? "समान सॉल्ट, समान प्रभाव—केवल कीमत में भारी अंतर। देखें कि उत्तर प्रदेश के परिवार हर महीने कैसे हजारों रुपए बचा रहे हैं।"
                : "Same active chemical entity and clinical potency at a fraction of the cost. See why switching transforms household healthcare budgets."}
            </p>
          </div>

          <Link
            href="/impact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-sm transition-all shrink-0 self-start md:self-auto"
          >
            <span>Statewide Impact Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {priceComparisons.map((item) => (
            <div
              key={item.medicine}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.use}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {item.savingsPercent}% OFF
                  </span>
                </div>

                <h4 className="font-black text-base text-slate-900 leading-snug">
                  {item.medicine}
                </h4>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Branded ({item.brandedName}):</span>
                    <span className="line-through font-semibold">₹{item.brandedPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-800 font-black text-base">
                    <span>PM Jan Aushadhi:</span>
                    <span className="text-emerald-600 text-xl font-black">₹{item.janAushadhiPrice}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl text-center">
                  Save ₹{item.brandedPrice - item.janAushadhiPrice} per pack
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. UP GOVT SCHEMES PROMO BANNER (Full-Bleed Gradient Accent)
         ========================================================================= */}
      <section className="w-full bg-gradient-to-r from-health-900 via-health-800 to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8 xl:px-12 border-y border-health-700">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
              <span>Ayushman Bharat &bull; Vay Vandana 70+ &bull; Free Drugs EDL</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === "hi"
                ? "क्या आप मुफ्त दवा या 5 लाख के इलाज के हकदार हैं?"
                : "Check Your UP Government Healthcare Scheme Entitlements"}
            </h3>
            <p className="text-teal-100/90 text-sm leading-relaxed">
              {language === "hi"
                ? "आयुष्मान वय वंदना (70 वर्ष से अधिक के बुजुर्गों के लिए असीमित ₹5 लाख कवरेज), राष्ट्रीय स्वास्थ्य मिशन एवं आवश्यक दवा सूची की पात्रता तुरंत जांचें।"
                : "Instantly evaluate eligibility for Ayushman Vay Vandana (70+ senior universal cover), PM-JAY, Mukhyamantri Jan Arogya, and hospital Essential Drug Lists."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/schemes"
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all"
            >
              Check My Scheme Eligibility &rarr;
            </Link>
            <Link
              href="/login"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
            >
              Sign In to Save Profile
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HACKATHON DEMO TOUR PROMO (Bottom Bar)
         ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-[1440px] mx-auto text-center space-y-4">
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-health-600" />
              <h4 className="text-lg font-black text-slate-900">
                Hackathon Judge or Evaluator?
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Use our interactive floating <strong>Demo Guide</strong> (bottom right) to walk through the 6-step core demo, or reset seeded test data anytime.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/reset"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs transition-colors"
            >
              Reset Seed Data
            </Link>
            <Link
              href="/admin/heatmap"
              className="px-4 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Open Outbreak Heatmap
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Medicine Modal */}
      <MedicineEmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
}
