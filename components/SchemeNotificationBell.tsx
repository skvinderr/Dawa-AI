"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Sparkles, ArrowRight, ShieldAlert, Award, X, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function SchemeNotificationBell() {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const schemeNotifications = [
    {
      id: "vay-vandana",
      titleEn: "Ayushman Vay Vandana (70+ Seniors)",
      titleHi: "आयुष्मान वय वंदना (70+ वरिष्ठ नागरिक)",
      subtitleEn: "Universal ₹5,00,000 health cover for all seniors aged 70+ without family income limit.",
      subtitleHi: "70 वर्ष से अधिक आयु के सभी बुजुर्गों के लिए बिना आय सीमा ₹5 लाख का समर्पित कवर।",
      badgeEn: "New Universal Cover",
      badgeHi: "नया सार्वभौमिक कवर",
      badgeColor: "bg-amber-100 text-amber-800",
      actionUrl: "/schemes?filter=SENIOR",
    },
    {
      id: "free-drugs-up",
      titleEn: "UP Free Drugs Service Initiative",
      titleHi: "यूपी निःशुल्क औषधि सेवा योजना",
      subtitleEn: "100% free essential medicines for all outpatients at UP Govt hospitals & CHCs.",
      subtitleHi: "उत्तर प्रदेश के सभी सरकारी अस्पतालों (KGMU, बलरामपुर) में 300+ आवश्यक दवाएं 100% मुफ्त।",
      badgeEn: "100% Free at Govt PHC",
      badgeHi: "सरकारी अस्पताल में मुफ्त",
      badgeColor: "bg-emerald-100 text-emerald-800",
      actionUrl: "/schemes",
    },
    {
      id: "np-ncd-chronic",
      titleEn: "NP-NCD Chronic Refill Program",
      titleHi: "एनसीडी मुफ्त क्रॉनिक दवा रिफिल",
      subtitleEn: "Free monthly refills for Diabetes & BP medications at local Ayushman Arogya Mandir.",
      subtitleHi: "डायबिटीज और बीपी की दवाओं का हर महीने मुफ्त कोटा स्थानीय आरोग्य मंदिर से पाएं।",
      badgeEn: "Chronic Refill",
      badgeHi: "मासिक मुफ्त दवा",
      badgeColor: "bg-blue-100 text-blue-800",
      actionUrl: "/schemes?filter=CHRONIC",
    },
  ];

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-2xl bg-slate-50 hover:bg-health-50 text-slate-700 hover:text-health-700 transition-colors border border-slate-200/80 shadow-2xs"
        aria-label="Government Scheme Notifications"
        title={
          language === "hi"
            ? "सरकारी योजना सूचनाएं"
            : "Government Scheme Notifications"
        }
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-health-100 text-health-800 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-health-600" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  {language === "hi"
                    ? "सरकारी स्वास्थ्य योजना अलर्ट"
                    : "Eligible Government Schemes"}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {language === "hi"
                    ? "उत्तर प्रदेश नागरिकों के लिए स्वास्थ्य सब्सिडी"
                    : "Subsidies available for UP residents"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scheme Items List */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-0.5">
            {schemeNotifications.map((item) => (
              <Link
                key={item.id}
                href={item.actionUrl}
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-2xl bg-slate-50 hover:bg-health-50/60 border border-slate-200/80 hover:border-health-300 transition-all space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {language === "hi" ? item.badgeHi : item.badgeEn}
                  </span>
                  <span className="text-[10px] text-health-700 font-bold flex items-center gap-0.5">
                    {language === "hi" ? "देखें" : "View"} &rarr;
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-900 leading-snug">
                  {language === "hi" ? item.titleHi : item.titleEn}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {language === "hi" ? item.subtitleHi : item.subtitleEn}
                </p>
              </Link>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/schemes"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>
                {language === "hi"
                  ? "सभी योजनाएं देखें एवं पात्रता जांचें"
                  : "View All Schemes & Check Eligibility"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
