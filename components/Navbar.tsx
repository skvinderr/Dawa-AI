"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { RoleSwitcher } from "./RoleSwitcher";
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
  ClipboardList
} from "lucide-react";

export function Navbar() {
  const { t, language, role } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const citizenNav = [
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/prescription", label: t("nav.prescription"), icon: FileText },
    { href: "/schemes", label: t("nav.schemes"), icon: ShieldAlert },
    { href: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { href: "/impact", label: t("nav.impact"), icon: BarChart3 },
  ];

  const shopkeeperNav = [
    { href: "/shop/dashboard", label: "Inventory Dashboard", icon: Store },
    { href: "/shop/upload-bill", label: "Upload Stock / Bill", icon: FileText },
    { href: "/search", label: "Check UP Price Index", icon: Search },
  ];

  const adminNav = [
    { href: "/admin/heatmap", label: "Health Shortage Heatmap", icon: MapPin },
    { href: "/impact", label: "Statewide Generic Savings", icon: BarChart3 },
    { href: "/schemes", label: "Govt Scheme Audit", icon: ShieldAlert },
  ];

  const activeNav =
    role === "shopkeeper" ? shopkeeperNav : role === "admin" ? adminNav : citizenNav;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-health-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-health-500 to-health-700 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-health-700 transition-colors">
                  {language === "hi" ? "दवा सेतु" : "DawaaSetu"}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-health-100 text-health-800 border border-health-200">
                  UP
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block leading-none">
                {language === "hi"
                  ? "AI दवा खोज एवं जन औषधि विकल्प"
                  : "AI Medicine Discovery & Jan Aushadhi"}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-health-50 text-health-700 font-semibold"
                      : "text-slate-600 hover:text-health-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions: Role Switcher & Language Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <RoleSwitcher />
            <LanguageToggle />
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-health-50 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-health-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="pt-1 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Role
            </p>
            <RoleSwitcher />
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? "bg-health-50 text-health-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-health-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
