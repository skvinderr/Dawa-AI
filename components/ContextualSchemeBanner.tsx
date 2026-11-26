"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, ShieldAlert, Award } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getContextualSchemesForMedicine } from "@/lib/schemes";

interface ContextualSchemeBannerProps {
  medicineName?: string;
  salts?: string[];
  isChronic?: boolean;
  userAge?: number | null;
  className?: string;
}

export function ContextualSchemeBanner({
  medicineName,
  salts = [],
  isChronic = false,
  userAge,
  className = "",
}: ContextualSchemeBannerProps) {
  const { language } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  const banners = getContextualSchemesForMedicine({
    medicineName,
    salts,
    isChronic,
    userAge,
  });

  if (isDismissed || banners.length === 0) return null;

  const topBanner = banners[0];

  return (
    <div
      className={`rounded-2xl p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-health-50 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-emerald-200/80 text-emerald-950">
              {language === "hi" ? topBanner.badgeHi : topBanner.badge}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {language === "hi" ? topBanner.schemeNameHi : topBanner.schemeName}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {language === "hi" ? topBanner.subtitleHi : topBanner.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Link
          href={topBanner.actionUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <span>{language === "hi" ? "योजना विवरण देखें" : "View Scheme"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
