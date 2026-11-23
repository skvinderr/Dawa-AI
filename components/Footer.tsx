"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Activity, PhoneCall, ShieldCheck, Heart, AlertTriangle } from "lucide-react";

export function Footer() {
  const { dict, language } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Medical Advice Mandatory Disclaimer Alert */}
        <div className="mb-10 bg-amber-950/40 border border-amber-600/50 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3.5 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            <strong className="text-amber-300 mr-1.5">
              {language === "hi" ? "महत्वपूर्ण चिकित्सा सूचना:" : "Medical Disclaimer:"}
            </strong>
            {dict.disclaimer.medical}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-health-500 flex items-center justify-center text-white shadow-soft">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                {language === "hi" ? "दवा सेतु" : "DawaaSetu"}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                UP Health
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {dict.footer.mission}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dict.footer.emergency}</span>
            </div>
          </div>

          {/* Col 2: Citizen Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              {language === "hi" ? "नागरिक सेवाएं" : "Citizen Services"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/search" className="hover:text-health-400 transition-colors">
                  {dict.nav.search}
                </Link>
              </li>
              <li>
                <Link href="/prescription" className="hover:text-health-400 transition-colors">
                  {dict.nav.prescription}
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="hover:text-health-400 transition-colors">
                  {dict.nav.schemes}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-health-400 transition-colors">
                  {dict.nav.orders}
                </Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-health-400 transition-colors">
                  {dict.nav.impact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Chemist & Health Dept */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              {language === "hi" ? "केमिस्ट एवं प्रशासन" : "Pharmacies & Health Dept"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/shop/dashboard" className="hover:text-health-400 transition-colors">
                  {language === "hi" ? "केमिस्ट डैशबोर्ड" : "Chemist Dashboard"}
                </Link>
              </li>
              <li>
                <Link href="/shop/upload-bill" className="hover:text-health-400 transition-colors">
                  {language === "hi" ? "बिल अपलोड (स्टॉक)" : "Upload Bill / Stock"}
                </Link>
              </li>
              <li>
                <Link href="/admin/heatmap" className="hover:text-health-400 transition-colors">
                  {language === "hi" ? "शॉर्टेज हीटमैप (UP)" : "District Heatmap (UP)"}
                </Link>
              </li>
              <li>
                <Link href="/store/store-1" className="hover:text-health-400 transition-colors">
                  {language === "hi" ? "जन औषधि केंद्र स्टोर व्यू" : "Store Profile Example"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with mandatory Demo Data Badge */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{dict.footer.copyright}</p>

          {/* Mandatory Demo Data Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-health-950/80 border border-health-700/60 text-health-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-health-400 animate-pulse"></span>
            <span>{dict.footer.demo_badge}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with care for Uttar Pradesh</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
