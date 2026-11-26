"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { RoleSwitcher } from "./RoleSwitcher";
import { SavingsModal } from "./SavingsModal";
import { SchemeNotificationBell } from "./SchemeNotificationBell";
import { MedicineEmergencyModal } from "./MedicineEmergencyModal";
import {
  Search, FileText, ShieldAlert, Menu, X, Sparkles, BarChart3,
  Store, MapPin, ClipboardList, TrendingDown, User, AlertTriangle, SunMoon,
  Type, ArrowUpRight, HeartPulse,
} from "lucide-react";

export function Navbar() {
  const {
    t, language, role, isLargeText, toggleLargeText, isHighContrast, toggleHighContrast,
  } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [lifetimeSavings, setLifetimeSavings] = useState(1240);
  const hi = language === "hi";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/savings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.lifetimeSavings === "number") {
          setLifetimeSavings(data.lifetimeSavings);
        }
      })
      .catch((err) => console.warn("Failed to load savings badge:", err));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const citizenNav = [
    { href: "/citizen", label: hi ? "नागरिक हब" : "Citizen Hub", icon: User },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/prescription", label: t("nav.prescription"), icon: FileText },
    { href: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { href: "/schemes", label: t("nav.schemes"), icon: ShieldAlert },
    { href: "/impact", label: t("nav.impact"), icon: BarChart3 },
  ];
  const shopkeeperNav = [
    { href: "/shop/dashboard", label: hi ? "दुकान डैशबोर्ड" : "Chemist Hub", icon: Store },
    { href: "/shop/orders", label: hi ? "नागरिक होल्ड व ऑर्डर" : "Holds & Orders", icon: ClipboardList },
    { href: "/shop/upload-bill", label: hi ? "बिल / स्टॉक अपलोड" : "Upload Invoice", icon: FileText },
    { href: "/search", label: hi ? "दवा मूल्य सूची" : "Price Index", icon: Search },
  ];
  const adminNav = [
    { href: "/admin/heatmap", label: hi ? "महामारी हीटमैप" : "Outbreak Heatmap", icon: MapPin },
    { href: "/impact", label: hi ? "राज्य बचत रिपोर्ट" : "Statewide Impact", icon: BarChart3 },
    { href: "/schemes", label: hi ? "योजना ऑडिट" : "Scheme Audit", icon: ShieldAlert },
    { href: "/admin/reset", label: hi ? "डेमो रीसेट" : "Demo Reset", icon: Sparkles },
  ];
  const activeNav = role === "shopkeeper" ? shopkeeperNav : role === "admin" ? adminNav : citizenNav;
  const isCurrent = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e9e5ed] bg-[#fbfafc]/90 shadow-[0_8px_28px_-24px_rgba(32,12,55,.4)] backdrop-blur-2xl">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-5 lg:px-8">
          <div className="flex h-[64px] min-w-0 items-center justify-between gap-2 sm:h-[68px] sm:gap-3 2xl:h-[78px]">
            <Link href="/" className="group flex min-w-0 shrink items-center gap-2 sm:gap-3 2xl:shrink-0" aria-label="DawaaSetu home">
              <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[15px] bg-gradient-to-br from-[#321253] via-[#25103f] to-[#17132f] text-white shadow-[0_8px_20px_-9px_rgba(38,12,66,.65)] transition duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-11 sm:w-11">
                <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-[#f02a91]/70 blur-md" />
                <HeartPulse className="relative h-5 w-5 stroke-[2.3] sm:h-[22px] sm:w-[22px]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="flex items-center gap-1 text-[15px] font-black tracking-[-.045em] text-[#1b1230] transition group-hover:text-[#b21b73] sm:gap-1.5 sm:text-[19px]">
                  {hi ? "दवा सेतु" : "DawaaSetu"}<span className="text-[#e72b91]">.</span>
                  <span className="rounded-md border border-[#e7d9f2] bg-[#f1eaf7] px-1.5 py-0.5 text-[8px] font-black tracking-[.12em] text-[#583176]">UP</span>
                </span>
                <span className="mt-1 hidden text-[9px] font-semibold tracking-[.015em] text-slate-500 xl:block">
                  {hi ? "स्मार्ट दवा खोज · जन औषधि · स्थानीय देखभाल" : "Medicine discovery · Jan Aushadhi · local care"}
                </span>
              </span>
            </Link>

            <nav aria-label="Main navigation" className="hidden items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/75 p-1 shadow-[0_4px_18px_-15px_rgba(30,12,55,.35)] 2xl:flex">
              {activeNav.map((item) => {
                const Icon = item.icon;
                const selected = isCurrent(item.href);
                return <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined}
                  className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition-all duration-200 2xl:px-3.5 2xl:text-xs ${selected ? "bg-[#24103f] text-white shadow-md shadow-violet-950/15" : "text-slate-600 hover:bg-[#f5eff9] hover:text-[#922565]"}`}>
                  <Icon className={`h-3.5 w-3.5 transition-colors ${selected ? "text-[#ff82c5]" : "text-slate-400 group-hover:text-[#db288b]"}`} />{item.label}
                </Link>;
              })}
            </nav>

            <div className="hidden items-center gap-2 2xl:flex">
              <button type="button" onClick={() => setEmergencyModalOpen(true)} title={hi ? "आपातकालीन दवाएं" : "Emergency medicine finder"} aria-label="Open emergency medicine finder"
                className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 text-[10px] font-extrabold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 active:scale-[.97]">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-50" /><span className="relative h-2 w-2 rounded-full bg-rose-600" /></span>
                <AlertTriangle className="h-3.5 w-3.5 transition group-hover:rotate-[-8deg]" /><span>{hi ? "आपातकाल" : "Emergency"}</span>
              </button>

              {role === "citizen" && <button type="button" onClick={() => setSavingsModalOpen(true)} title="View lifetime medicine savings" aria-label="View lifetime savings"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 text-[10px] font-extrabold text-emerald-800 transition hover:bg-emerald-100 active:scale-[.97]">
                <span className="grid h-[21px] w-[21px] place-items-center rounded-full bg-emerald-600 text-white"><TrendingDown className="h-3.5 w-3.5" /></span>₹{lifetimeSavings.toLocaleString("en-IN")} {hi ? "बचत" : "saved"}
              </button>}

              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1" aria-label="Accessibility controls">
                <button type="button" onClick={toggleLargeText} aria-label="Toggle large text mode" title={isLargeText ? "Normal text size" : "Large text size"}
                  className={`grid h-7 w-7 place-items-center rounded-full transition ${isLargeText ? "bg-[#24103f] text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}><Type className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={toggleHighContrast} aria-label="Toggle high contrast mode" title={isHighContrast ? "Normal contrast" : "High contrast"}
                  className={`grid h-7 w-7 place-items-center rounded-full transition ${isHighContrast ? "bg-[#24103f] text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}><SunMoon className="h-3.5 w-3.5" /></button>
              </div>
              <RoleSwitcher />
              <LanguageToggle />
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 2xl:hidden">
              <button type="button" onClick={() => setEmergencyModalOpen(true)} aria-label="Emergency medicines" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 text-[10px] font-black text-rose-700 transition hover:bg-rose-100 sm:px-3"><AlertTriangle className="h-3.5 w-3.5" /><span className="hidden sm:inline">{hi ? "आपातकाल" : "SOS"}</span></button>
              {role === "citizen" && <button type="button" onClick={() => setSavingsModalOpen(true)} aria-label="View savings" className="hidden h-9 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-extrabold text-emerald-800 sm:inline-flex"><TrendingDown className="h-3.5 w-3.5" /><span>₹{lifetimeSavings.toLocaleString("en-IN")}</span></button>}
              <SchemeNotificationBell />
              <LanguageToggle />
              <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen}
                className={`grid h-9 w-9 place-items-center rounded-full border transition ${mobileMenuOpen ? "border-[#321253] bg-[#24103f] text-white" : "border-slate-200 bg-white text-[#28153e] hover:bg-[#f5eff9]"}`}>
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex 2xl:hidden">
            {activeNav.map((item) => {
              const Icon = item.icon; const selected = isCurrent(item.href);
              return <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${selected ? "bg-[#24103f] text-white" : "text-slate-600 hover:bg-[#f5eff9] hover:text-[#922565]"}`}><Icon className={`h-3.5 w-3.5 ${selected ? "text-[#ff82c5]" : "text-slate-400"}`} />{item.label}</Link>;
            })}
          </nav>
        </div>

        {mobileMenuOpen && <div className="absolute left-0 right-0 top-full border-t border-slate-200/80 bg-[#fbfafc]/[.98] px-4 pb-5 pt-4 shadow-[0_28px_45px_-32px_rgba(24,11,42,.6)] backdrop-blur-2xl lg:hidden sm:px-6">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3"><span className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">{hi ? "सुलभता" : "Accessibility"}</span><div className="flex gap-2"><button type="button" onClick={toggleLargeText} className={`rounded-full border px-3 py-2 text-[10px] font-bold transition ${isLargeText ? "border-[#24103f] bg-[#24103f] text-white" : "border-slate-200 bg-white text-slate-700"}`}><Type className="mr-1 inline h-3 w-3" />A+</button><button type="button" onClick={toggleHighContrast} className={`rounded-full border px-3 py-2 text-[10px] font-bold transition ${isHighContrast ? "border-[#24103f] bg-[#24103f] text-white" : "border-slate-200 bg-white text-slate-700"}`}><SunMoon className="mr-1 inline h-3 w-3" />{hi ? "कॉन्ट्रास्ट" : "Contrast"}</button></div></div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3"><p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{hi ? "पोर्टल चुनें" : "Your workspace"}</p><RoleSwitcher /></div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{activeNav.map((item) => { const Icon = item.icon; const selected = isCurrent(item.href); return <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} aria-current={selected ? "page" : undefined} className={`flex min-h-[62px] items-center gap-2.5 rounded-2xl border px-3 py-3 text-xs font-bold transition ${selected ? "border-[#321253] bg-[#24103f] text-white shadow-md shadow-violet-950/10" : "border-slate-200 bg-white text-slate-700 hover:border-[#e4cde0] hover:bg-[#fff8fc]"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${selected ? "bg-white/10 text-[#ff82c5]" : "bg-[#f3edf8] text-[#70438d]"}`}><Icon className="h-4 w-4" /></span><span className="leading-snug">{item.label}</span></Link>; })}</div>

            <button type="button" onClick={() => { setMobileMenuOpen(false); setEmergencyModalOpen(true); }} className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-rose-600 to-[#d92779] px-4 py-3.5 text-left text-sm font-extrabold text-white shadow-lg shadow-rose-900/15"><span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{hi ? "आपातकालीन दवाएं खोजें" : "Open emergency medicine finder"}</span><ArrowUpRight className="h-4 w-4" /></button>
            {role === "citizen" && <button type="button" onClick={() => { setMobileMenuOpen(false); setSavingsModalOpen(true); }} className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800"><span className="inline-flex items-center gap-2"><TrendingDown className="h-4 w-4" />{hi ? "आपकी कुल बचत" : "Your lifetime savings"}</span><span>₹{lifetimeSavings.toLocaleString("en-IN")}</span></button>}
          </div>
        </div>}
      </header>

      <SavingsModal isOpen={savingsModalOpen} onClose={() => setSavingsModalOpen(false)} />
      <MedicineEmergencyModal isOpen={emergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} />
    </>
  );
}
