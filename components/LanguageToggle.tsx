"use client";

import React from "react";
import { useTranslation, Language } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-xl bg-health-50 p-1 border border-health-200">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
          language === "en"
            ? "bg-health-600 text-white shadow-sm"
            : "text-health-800 hover:text-health-950 hover:bg-health-100"
        }`}
        aria-label="Switch to English"
      >
        <Languages className="w-3.5 h-3.5" />
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
          language === "hi"
            ? "bg-health-600 text-white shadow-sm"
            : "text-health-800 hover:text-health-950 hover:bg-health-100"
        }`}
        aria-label="Switch to Hindi"
      >
        हिंदी
      </button>
    </div>
  );
}
