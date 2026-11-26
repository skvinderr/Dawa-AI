"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Activity, PhoneCall, ShieldCheck, Heart, AlertTriangle, ArrowUpRight, MapPin } from "lucide-react";

export function Footer() {
  const { dict, language } = useTranslation();
  const hi = language === "hi";
  const linkClass = "group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-[#ff85c4]";

  return (
    <footer className="relative isolate overflow-hidden bg-[#170d2c] text-slate-300">
      <div className="pointer-events-none absolute -right-32 -top-48 -z-10 h-[460px] w-[460px] rounded-full bg-fuchsia-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-64 left-[20%] -z-10 h-[400px] w-[600px] rounded-full bg-cyan-500/[.08] blur-[120px]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-7 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="mb-12 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-stretch">
          <div className="flex items-start gap-3.5 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/[.07] p-4 sm:items-center sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-300/15 text-amber-300"><AlertTriangle className="h-5 w-5" /></span>
            <p className="text-xs leading-6 text-amber-100/75 sm:text-sm">
              <strong className="mr-1.5 font-extrabold text-amber-200">{hi ? "महत्वपूर्ण चिकित्सा सूचना:" : "Medical disclaimer:"}</strong>
              {dict.disclaimer.medical}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[.045] px-4 py-3 sm:px-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-400/10 text-rose-300"><PhoneCall className="h-5 w-5" /></span>
            <div><span className="block text-[9px] font-black uppercase tracking-[.16em] text-violet-200/50">{hi ? "आपातकालीन सहायता" : "Emergency support"}</span><span className="mt-1 block text-xs font-bold leading-5 text-white sm:text-sm">{dict.footer.emergency}</span></div>
          </div>
        </div>

        <div className="grid gap-10 border-b border-white/10 pb-11 md:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.9fr] lg:gap-16">
          <div className="max-w-md">
            <Link href="/" aria-label="DawaaSetu home" className="group inline-flex items-center gap-3">
              <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#612887] via-[#321451] to-[#21113e] text-white shadow-[0_10px_25px_-12px_rgba(229,39,146,.55)] transition group-hover:-rotate-3">
                <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-[#f02a91]/60 blur-md" /><Activity className="relative h-6 w-6 stroke-[2.3]" />
              </span>
              <span><span className="block text-xl font-black tracking-[-.045em] text-white">{hi ? "दवा सेतु" : "DawaaSetu"}<span className="text-[#f04aab]">.</span></span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.17em] text-violet-200/50">{hi ? "देखभाल, आपके करीब" : "Care, closer to you"}</span></span>
            </Link>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-1.5 text-[10px] font-bold text-emerald-200/80"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />UP Health · Medicine Discovery</div>
            <p className="mt-4 text-sm leading-7 text-violet-100/55">{dict.footer.mission}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-violet-100/45"><MapPin className="h-3.5 w-3.5 text-[#69dce6]" />{hi ? "उत्तर प्रदेश के लिए बनाया गया" : "Built for Uttar Pradesh"}</div>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.17em] text-white"><span className="h-1 w-5 rounded-full bg-[#f04aab]" />{hi ? "नागरिक सेवाएं" : "Citizen services"}</h2>
            <ul className="space-y-3">
              <li><Link href="/search" className={linkClass}>{dict.nav.search}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/prescription" className={linkClass}>{dict.nav.prescription}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/schemes" className={linkClass}>{dict.nav.schemes}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/orders" className={linkClass}>{dict.nav.orders}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/impact" className={linkClass}>{dict.nav.impact}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.17em] text-white"><span className="h-1 w-5 rounded-full bg-[#61d9e8]" />{hi ? "फार्मेसी एवं स्वास्थ्य विभाग" : "Pharmacies & public health"}</h2>
            <ul className="space-y-3">
              <li><Link href="/shop/dashboard" className={linkClass}>{hi ? "केमिस्ट डैशबोर्ड" : "Chemist dashboard"}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/shop/upload-bill" className={linkClass}>{hi ? "बिल / स्टॉक अपलोड" : "Upload bill / stock"}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/admin/heatmap" className={linkClass}>{hi ? "जिला हीटमैप (यूपी)" : "District heatmap (UP)"}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
              <li><Link href="/store/store-1" className={linkClass}>{hi ? "जन औषधि केंद्र स्टोर व्यू" : "Store profile example"}<ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" /></Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[10px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-violet-100/45">{dict.footer.copyright}</p>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f0a8cf]/15 bg-[#f04aab]/[.07] px-3 py-1.5 font-bold text-[#f5b8da]"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f04aab] opacity-50" /><span className="relative h-2 w-2 rounded-full bg-[#f04aab]" /></span>{dict.footer.demo_badge}</div>
          <div className="inline-flex items-center gap-1.5 text-violet-100/45">{hi ? "उत्तर प्रदेश के लिए देखभाल से बनाया" : "Built with care for Uttar Pradesh"}<Heart className="h-3.5 w-3.5 fill-[#f04aab] text-[#f04aab]" /></div>
        </div>
      </div>
    </footer>
  );
}