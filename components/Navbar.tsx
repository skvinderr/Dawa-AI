"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { RoleSwitcher } from "./RoleSwitcher";
import { SavingsModal } from "./SavingsModal";
import { SchemeNotificationBell } from "./SchemeNotificationBell";
import { MedicineEmergencyModal } from "./MedicineEmergencyModal";
import {
  Activity,
  Search,
  FileText,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Store,
  MapPin,
  ClipboardList,
  TrendingDown,
  User,
  AlertTriangle,
  SunMoon,
  Type,
} from "lucide-react";

export function Navbar() {
  const {
    t,
    language,
    role,
    isLargeText,
    toggleLargeText,
    isHighContrast,
    toggleHighContrast,
  } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [lifetimeSavings, setLifetimeSavings] = useState<number>(1240);

  useEffect(() => {
    fetch("/api/user/savings")
      .then((res) => res.json())
      .then((data) => {
        if (data.lifetimeSavings) {
          setLifetimeSavings(data.lifetimeSavings);
        }
      })
      .catch((err) => console.warn("Failed to load savings badge:", err));
  }, []);

  const citizenNav = [
    { href: "/citizen", label: language === "hi" ? "नागरिक हब" : "Citizen Hub", icon: User },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/prescription", label: t("nav.prescription"), icon: FileText },
    { href: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { href: "/schemes", label: t("nav.schemes"), icon: ShieldAlert },
    { href: "/impact", label: t("nav.impact"), icon: BarChart3 },
  ];

  const shopkeeperNav = [
    { href: "/shop/dashboard", label: language === "hi" ? "दुकान डैशबोर्ड" : "Chemist Hub", icon: Store },
    { href: "/shop/orders", label: language === "hi" ? "नागरिक होल्ड व ऑर्डर" : "Holds & Orders", icon: ClipboardList },
    { href: "/shop/upload-bill", label: language === "hi" ? "बिल / स्टॉक अपलोड" : "Upload Invoice", icon: FileText },
    { href: "/search", label: language === "hi" ? "दवा मूल्य सूची" : "Price Index", icon: Search },
  ];

  const adminNav = [
    { href: "/admin/heatmap", label: language === "hi" ? "महामारी हीटमैप" : "Outbreak Heatmap", icon: MapPin },
    { href: "/impact", label: language === "hi" ? "राज्य बचत रिपोर्ट" : "Statewide Impact", icon: BarChart3 },
    { href: "/schemes", label: language === "hi" ? "योजना ऑडिट" : "Scheme Audit", icon: ShieldAlert },
    { href: "/admin/reset", label: language === "hi" ? "डेमो रीसेट" : "Demo Reset", icon: Sparkles },
  ];

  const activeNav =
    role === "shopkeeper" ? shopkeeperNav : role === "admin" ? adminNav : citizenNav;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-health-600 via-health-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-health-700/20 group-hover:scale-105 group-hover:shadow-lg transition-all">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-950 group-hover:text-health-700 transition-colors">
                    {language === "hi" ? "दवा सेतु" : "DawaaSetu"}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-health-100 to-emerald-100 text-health-800 border border-health-300">
                    UP
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 hidden xl:block leading-none">
                  {language === "hi"
                    ? "AI दवा खोज, जन औषधि विकल्प व महामारी निगरानी"
                    : "AI Medicine Discovery & Jan Aushadhi Platform"}
                </p>
              </div>
            </Link>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {activeNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-health-600 text-white shadow-xs font-bold"
                        : "text-slate-700 hover:text-health-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-health-600"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions, Accessibility & Quick Emergency Trigger */}
            <div className="hidden md:flex items-center gap-2 xl:gap-3">
              {/* Emergency Trigger Button */}
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 hover:text-red-900 text-xs font-black shadow-xs transition-all active:scale-95"
                title={language === "hi" ? "आपातकालीन दवाएं (इंसुलिन, एंटी-वेनम, रेबीज)" : "Emergency Medicines (Insulin, ASVS, Rabies)"}
                aria-label="Open emergency medicine triage modal"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition-transform" />
                <span>{language === "hi" ? "आपातकाल" : "Emergency"}</span>
              </button>

              {/* Citizen Lifetime Savings Chip */}
              {role === "citizen" && (
                <button
                  type="button"
                  onClick={() => setSavingsModalOpen(true)}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/80 text-emerald-900 text-xs font-bold shadow-xs transition-all active:scale-95"
                  title="View your lifetime medicine savings breakdown"
                  aria-label="View lifetime savings"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>₹{lifetimeSavings.toLocaleString("en-IN")} saved</span>
                </button>
              )}

              {/* Scheme Notification Bell */}
              <SchemeNotificationBell />

              {/* Accessibility Controls: Large Text & High Contrast */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={toggleLargeText}
                  className={`p-1.5 rounded-lg text-xs font-black transition-all ${
                    isLargeText
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                  }`}
                  title={isLargeText ? "Normal text size" : "Large text size (A+)"}
                  aria-label="Toggle large text mode"
                >
                  <Type className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  className={`p-1.5 rounded-lg text-xs font-black transition-all ${
                    isHighContrast
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                  }`}
                  title={isHighContrast ? "Normal contrast" : "High contrast mode"}
                  aria-label="Toggle high contrast mode"
                >
                  <SunMoon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Role Switcher Pill */}
              <RoleSwitcher />

              {/* Language Switcher */}
              <LanguageToggle />
            </div>

            {/* Mobile Action Controls */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs font-black"
                aria-label="Emergency Medicines"
              >
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span>SOS</span>
              </button>

              {role === "citizen" && (
                <button
                  type="button"
                  onClick={() => setSavingsModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold"
                  aria-label="View savings"
                >
                  <TrendingDown className="w-3 h-3 text-emerald-600" />
                  <span>₹{lifetimeSavings}</span>
                </button>
              )}

              <SchemeNotificationBell />
              <LanguageToggle />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Accessibility
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLargeText}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    isLargeText
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                  aria-label="Toggle Large Text"
                >
                  Large Text (A+)
                </button>
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    isHighContrast
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                  aria-label="Toggle High Contrast"
                >
                  High Contrast
                </button>
              </div>
            </div>

            <div className="pt-1 pb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Switch Role / पोर्टल चुनें
              </p>
              <RoleSwitcher />
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Navigation
              </p>
              {activeNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                      isActive
                        ? "bg-health-600 text-white shadow-xs"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-health-600"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEmergencyModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-extrabold text-sm shadow-md"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{language === "hi" ? "आपातकालीन दवाएं देखें" : "Open Emergency Medicine Finder"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Lifetime Savings Modal */}
      <SavingsModal isOpen={savingsModalOpen} onClose={() => setSavingsModalOpen(false)} />

      {/* Emergency Medicine Triage Modal */}
      <MedicineEmergencyModal isOpen={emergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} />
    </>
  );
}
