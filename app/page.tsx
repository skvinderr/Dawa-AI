"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  Search,
  UploadCloud,
  FileText,
  ShieldCheck,
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
} from "lucide-react";

export default function LandingPage() {
  const { t, dict, language, setRole } = useTranslation();
  const router = useRouter();

  const handleSelectRole = (role: "citizen" | "shopkeeper" | "admin", redirectPath: string) => {
    setRole(role);
    router.push(redirectPath);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-health-900 via-health-800 to-teal-900 text-white pt-14 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-health-700/60 backdrop-blur-md border border-health-500/40 text-teal-200 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>AI Kaushal 24h Build &bull; Uttar Pradesh Healthcare Platform</span>
          </div>

          {/* Heading */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {language === "hi" ? (
                <>
                  उत्तर प्रदेश का अपना <span className="text-emerald-400">दवा खोज</span> एवं जन औषधि विकल्प सेतु
                </>
              ) : (
                <>
                  AI-Powered Medicine Discovery &amp; <span className="text-emerald-400">Jan Aushadhi</span> Platform for UP
                </>
              )}
            </h1>

            <p className="text-teal-100/90 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              {language === "hi"
                ? "नागरिकों के लिए सस्ती दवाएं, केमिस्टों के लिए आसान स्टॉक प्रबंधन, और स्वास्थ्य विभाग के लिए जिलावार महामारी निगरानी।"
                : "Bridging the gap between prescribed medicines, nearby chemist stock, affordable Jan Aushadhi generic substitutes, and state health surveillance."}
            </p>
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2.5"
            >
              <span>Choose Your Portal / Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/search"
              className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-sm transition-all inline-flex items-center gap-2"
            >
              <Search className="w-5 h-5 text-teal-300" />
              <span>Direct Medicine Search</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Key UP Metrics Bar */}
      <section className="bg-white border-b border-slate-200 py-6 relative -mt-8 mx-4 sm:mx-8 max-w-7xl lg:mx-auto rounded-3xl shadow-soft">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-slate-100">
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-health-700">30+</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Lucknow Pharmacies Live
            </div>
          </div>
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">1,800+</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Certified Jan Aushadhi Generics
            </div>
          </div>
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-teal-600">85%</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Max Prescription Savings
            </div>
          </div>
          <div className="p-2 sm:p-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-800">75</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              UP Districts Surveillance
            </div>
          </div>
        </div>
      </section>

      {/* 3 Dedicated Role Portals Gateway (Clear Separation) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-health-700 uppercase tracking-widest bg-health-50 px-3 py-1 rounded-full border border-health-200">
            Dedicated Role Portals
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Role to Enter
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            DawaaSetu separates tools and data specifically for citizens, chemists, and health officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Citizen Portal */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-health-500 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-health-700 uppercase tracking-wider">
                  Role 1 &bull; Citizen
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {language === "hi" ? "नागरिक पोर्टल" : "Citizen Discovery"}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Search nearby in-stock medicines, compare cheaper Jan Aushadhi alternatives, scan handwritten doctor prescriptions with Gemini AI, and reserve a 2-hour hold.
              </p>

              <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time pharmacy stock &amp; pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Substitutes saving up to 85%</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>2-Hour free medicine hold guarantee</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => handleSelectRole("citizen", "/citizen")}
                className="w-full py-3.5 px-4 rounded-xl bg-health-700 hover:bg-health-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login?role=citizen"
                className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 block transition-colors"
              >
                Switch Citizen Profile (Ram Swaroop, Sunita, Aslam) &rarr;
              </Link>
            </div>
          </div>

          {/* Card 2: Pharmacist / Shopkeeper Portal */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-emerald-500 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Store className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Role 2 &bull; Pharmacist
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {language === "hi" ? "केमिस्ट डैशबोर्ड" : "Chemist Portal"}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Manage pharmacy inventory with single-click steppers, accept citizen 2-hour holds, chat with patients, and sync wholesale challans in 30 seconds with Gemini OCR.
              </p>

              <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Incoming citizen holds board</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Wholesaler delivery challan OCR</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Chat directly with local patients</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => handleSelectRole("shopkeeper", "/shop/dashboard")}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Enter Chemist Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login?role=shopkeeper"
                className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 block transition-colors"
              >
                Switch Pharmacy (Jan Aushadhi, Apollo, Sanjeevani) &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Health Department / Admin */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-teal-500 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Role 3 &bull; Health Department
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {language === "hi" ? "स्वास्थ्य निगरानी" : "Health Surveillance"}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Geospatial epidemic surveillance powered by Leaflet. Detects fever spikes and antibiotic surges across 75 districts, and triggers emergency buffer generic dispatches.
              </p>

              <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Shortage &amp; outbreak heatmap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Outbreak surge detection (Chowk/Alambagh)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>UPMSCL buffer dispatch trigger</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => handleSelectRole("admin", "/admin/heatmap")}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Enter Health Surveillance</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login?role=admin"
                className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 block transition-colors"
              >
                Health Officer Login (CMO, Epidemiologist) &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of DawaaSetu */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Core Technological Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Designed for zero setup, reliable offline fallback, and transparent auditable savings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-health-100 text-health-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Deterministic Substitution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Exact salt composition, strength, and dosage form matching. Ranks purely on unit price (`price / packSize`) with NTI safety alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Multimodal Vision OCR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini Vision extracts doctor handwriting and wholesaler bills. Zero demo blockage with sample offline fallback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Guaranteed 2-Hour Hold</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct stock locking prevents negative quantities and guarantees medicine availability while travelling to counter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Outbreak Heatmap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time Leaflet surveillance captures anonymous citizen discovery spikes to detect disease surges in Old Lucknow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Medical Disclaimer Banner */}
      <section className="bg-amber-50 border-t border-b border-amber-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-amber-900 text-xs sm:text-sm font-medium text-center">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {language === "hi"
              ? "दवा बदलने से पहले अपने डॉक्टर या फार्मासिस्ट से अवश्य सलाह लें। सभी मूल्य एवं स्टॉक केवल डेमो डेटा हैं।"
              : "Confirm with your doctor or pharmacist before switching. All prices, stock, and pharmacies are demo data."}
          </span>
        </div>
      </section>
    </div>
  );
}
