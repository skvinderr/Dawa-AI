"use client";

import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";

export default function LandingPage() {
  const { t, dict, language } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
    { name: "Glycomet-GP 2", generic: "Metformin + Glimepiride", save: "83%" },
    { name: "Telma 40", generic: "Jan Aushadhi Telmisartan", save: "84%" },
    { name: "Pan-D", generic: "Pantoprazole + Domperidone", save: "81%" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-health-50/70 via-white to-slate-50 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-health-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-health-100/80 border border-health-300 text-health-900 text-xs sm:text-sm font-semibold shadow-soft">
              <Sparkles className="w-4 h-4 text-health-600 animate-pulse" />
              <span>{dict.hero.badge}</span>
            </div>
          </div>

          {/* Heading & Subheading */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {language === "hi" ? (
                <>
                  नजदीकी मेडिकल स्टोर में <span className="text-health-700 underline decoration-health-400 decoration-wavy">दवा खोजें</span> व 85% तक बचाएं
                </>
              ) : (
                <>
                  Find Medicines & Cheaper <span className="text-health-700 underline decoration-health-400 decoration-wavy">Generics</span> Near You
                </>
              )}
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              {dict.hero.subheading}
            </p>
          </div>

          {/* Big Search Bar & Action Box */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-soft-lg border border-health-200/80 transition-shadow hover:shadow-xl">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-6 h-6 text-health-600 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={dict.hero.search_placeholder}
                    className="w-full pl-13 pr-4 py-3.5 sm:py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-health-500 focus:bg-white text-base sm:text-lg font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full h-13 sm:h-14 px-6 rounded-2xl bg-health-600 hover:bg-health-700 active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Search className="w-5 h-5 stroke-[2.5]" />
                    <span>{dict.hero.search_button}</span>
                  </button>

                  <Link
                    href="/prescription"
                    className="w-full h-13 sm:h-14 px-6 rounded-2xl bg-ayush-50 hover:bg-ayush-100 text-ayush-700 border-2 border-dashed border-ayush-500 hover:border-ayush-600 active:scale-[0.98] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm group"
                  >
                    <UploadCloud className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>{dict.hero.upload_prescription}</span>
                  </Link>
                </div>
              </form>

              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-health-600" />
                  <span>{dict.hero.upload_hint}</span>
                </p>
              </div>
            </div>

            {/* Popular Generic Substitutes Chips */}
            <div className="mt-6 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                {language === "hi" ? "लोकप्रिय दवाएं एवं बचत विकल्प" : "Popular Medicines & Jan Aushadhi Savings"}
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPopularMedicines.map((item) => (
                  <Link
                    key={item.name}
                    href={`/search?q=${encodeURIComponent(item.name)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-health-400 hover:bg-health-50 text-xs font-medium text-slate-700 transition-colors shadow-sm"
                  >
                    <span>{item.name}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {item.save} off
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Metrics Bar for UP */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-health-700">500+</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">{dict.quick_stats.pharmacies}</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">1,800+</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">{dict.quick_stats.generics}</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">85%</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">{dict.quick_stats.savings}</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">75</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">{dict.quick_stats.districts}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / User Personas Card Grid */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {language === "hi"
                ? "प्रत्येक नागरिक, केमिस्ट और प्रशासन के लिए सशक्त समाधान"
                : "Engineered for Citizens, Pharmacists & Health Administrators"}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              {language === "hi"
                ? "दवा सेतु उत्तर प्रदेश के स्वास्थ्य तंत्र को पारदर्शी और सुलभ बनाता है।"
                : "Transparent real-time availability, affordable generics, and district-level health intelligence."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Citizen */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-health-100 text-health-700 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {language === "hi" ? "नागरिक (Citizen Discovery)" : "1. Citizen Discovery"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {language === "hi"
                    ? "डॉक्टर का पर्चा अपलोड करें या दवा खोजें। नजदीकी दुकान पर लाइव स्टॉक और 80% तक सस्ती जन औषधि दवाएं तुरंत देखें।"
                    : "Upload prescription or search medicines. Instantly find which nearby store has stock and compare with certified Jan Aushadhi alternatives."}
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link
                  href="/search"
                  className="flex items-center justify-between text-sm font-semibold text-health-700 hover:text-health-800"
                >
                  <span>{language === "hi" ? "दवा खोज शुरू करें" : "Search Medicines"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/prescription"
                  className="flex items-center justify-between text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>{language === "hi" ? "पर्चा स्कैन करें" : "Scan Doctor's Rx"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Shopkeeper */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {language === "hi" ? "केमिस्ट (Pharmacist Portal)" : "2. Pharmacist Portal"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {language === "hi"
                    ? "होलसेल पर्ची या बिल की फोटो खींचकर 30 सेकंड में स्टॉक अपडेट करें। नजदीकी मरीजों से सीधी बुकिंग पाएं।"
                    : "Zero-effort stock management: snap a photo of wholesale invoices to sync inventory in 30 seconds. Accept citizen reserve requests."}
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link
                  href="/shop/dashboard"
                  className="flex items-center justify-between text-sm font-semibold text-health-700 hover:text-health-800"
                >
                  <span>{language === "hi" ? "केमिस्ट डैशबोर्ड" : "Chemist Dashboard"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/shop/upload-bill"
                  className="flex items-center justify-between text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>{language === "hi" ? "बिल अपलोड करें" : "Upload Invoices"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Admin / Health Department */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {language === "hi" ? "स्वास्थ्य विभाग (Admin Heatmap)" : "3. Health Dept View"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {language === "hi"
                    ? "यूपी के सभी 75 जिलों में जीवनरक्षक दवाओं की कमी (Shortage) और जेनेरिक बचत का लाइव हीटमैप विश्लेषण देखें।"
                    : "Live geospatial shortage heatmap across UP districts. Identify supply bottlenecks, stock-outs of life-saving medicines, and generic adoption."}
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Link
                  href="/admin/heatmap"
                  className="flex items-center justify-between text-sm font-semibold text-health-700 hover:text-health-800"
                >
                  <span>{language === "hi" ? "शॉर्टेज हीटमैप देखें" : "View Shortage Heatmap"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/impact"
                  className="flex items-center justify-between text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>{language === "hi" ? "बचत प्रभाव रिपोर्ट" : "UP Savings Analytics"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
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
              ? "दवा बदलने से पहले अपने डॉक्टर या फार्मासिस्ट से अवश्य सलाह लें।"
              : "Confirm with your doctor or pharmacist before switching."}
          </span>
        </div>
      </section>
    </div>
  );
}
