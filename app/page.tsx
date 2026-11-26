"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { MedicineEmergencyModal } from "@/components/MedicineEmergencyModal";
import {
  ArrowDown, ArrowRight, Activity, Check, CheckCircle2, HeartPulse, MapPin,
  Menu, Pill, Search, ShieldCheck, Sparkles, Store, UploadCloud, User,
  X, Zap, AlertTriangle, TrendingDown,
} from "lucide-react";

const prices = [
  { name: "Telmisartan 40mg", brand: "Telma 40", branded: 145, generic: 18, saving: 88, use: "Blood pressure" },
  { name: "Pantoprazole 40mg", brand: "Pan 40", branded: 120, generic: 22, saving: 82, use: "Acidity & GERD" },
  { name: "Metformin 500mg SR", brand: "Glycomet 500", branded: 65, generic: 14, saving: 78, use: "Type 2 diabetes" },
  { name: "Paracetamol 650mg", brand: "Dolo 650", branded: 34, generic: 11, saving: 68, use: "Fever & pain" },
];

const reveal = "reveal-up";

export default function LandingPage() {
  const { language, setRole } = useTranslation();
  const hi = language === "hi";
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const processRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal-up");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = processRef.current;
    if (!root) return;
    const cards = root.querySelectorAll<HTMLElement>("[data-step]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveStep(Number((entry.target as HTMLElement).dataset.step));
      });
    }, { threshold: 0.55 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const search = (query: string) => router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  const chooseRole = (role: "citizen" | "shopkeeper" | "admin", path: string) => { setRole(role); router.push(path); };

  return (
    <div className="dawaa-page min-h-screen overflow-clip bg-[#f7f5f2] text-[#171326]">
      <style>{`
        .dawaa-page{--ink:#171326;--navy:#170d32;--violet:#35105c;--pink:#f22592;--cyan:#45d9e9;--lime:#a8f36b;font-family:var(--font-sans,Inter,Arial,sans-serif)}
        .dawaa-page *{scroll-margin-top:90px}
        .dawaa-page a,.dawaa-page button{ -webkit-tap-highlight-color:transparent }
        .dawaa-page .reveal-up{opacity:0;transform:translateY(28px);transition:opacity .75s cubic-bezier(.2,.75,.25,1),transform .75s cubic-bezier(.2,.75,.25,1)}
        .dawaa-page .reveal-up.is-visible{opacity:1;transform:translateY(0)}
        .dawaa-page .delay-1{transition-delay:.1s}.dawaa-page .delay-2{transition-delay:.2s}.dawaa-page .delay-3{transition-delay:.3s}
        .dawaa-page .hero-orbit{animation:orbit 24s linear infinite}.dawaa-page .hero-float{animation:float 6s ease-in-out infinite}
        .dawaa-page .hero-glow{animation:pulseGlow 6s ease-in-out infinite alternate}
        @keyframes orbit{to{transform:rotate(360deg)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulseGlow{to{opacity:.8;transform:scale(1.08)}}
        @media(prefers-reduced-motion:reduce){.dawaa-page *, .dawaa-page *:before,.dawaa-page *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}.dawaa-page .reveal-up{opacity:1;transform:none}}
      `}</style>

      <header className="relative z-50 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="DawaaSetu home" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#241045] text-white shadow-lg shadow-violet-950/15"><HeartPulse size={22} /></span>
          <span className="leading-tight"><span className="block text-lg font-black tracking-tight">DawaaSetu<span className="text-[#ee258f]">.</span></span><span className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Care, closer to you</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a className="transition hover:text-[#d51e83]" href="#how-it-works">{hi ? "कैसे काम करता है" : "How it works"}</a>
          <a className="transition hover:text-[#d51e83]" href="#savings">{hi ? "बचत देखें" : "Real savings"}</a>
          <a className="transition hover:text-[#d51e83]" href="#portals">{hi ? "पोर्टल" : "For everyone"}</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="px-3 py-2 text-sm font-bold text-slate-700 transition hover:text-[#d51e83]">{hi ? "लॉग इन" : "Log in"}</Link>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-[#21103f] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/15 transition hover:-translate-y-0.5 hover:bg-[#32115b]">{hi ? "दवा खोजें" : "Find medicine"}<ArrowRight size={15} /></Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white md:hidden">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        {menuOpen && <nav className="absolute left-4 right-4 top-[76px] grid gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl md:hidden"><a className="rounded-xl p-3 text-sm font-bold" href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a className="rounded-xl p-3 text-sm font-bold" href="#savings" onClick={() => setMenuOpen(false)}>Real savings</a><a className="rounded-xl p-3 text-sm font-bold" href="#portals" onClick={() => setMenuOpen(false)}>For everyone</a><Link className="rounded-xl bg-[#21103f] p-3 text-center text-sm font-bold text-white" href="/search">Find medicine</Link></nav>}
      </header>

      <main>
        <section className="relative isolate px-4 pb-20 pt-5 sm:px-8 sm:pb-28 lg:px-12 lg:pt-8">
          <div className="relative mx-auto min-h-[610px] max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#180d31] text-white shadow-[0_32px_100px_-35px_rgba(37,11,69,.55)] sm:rounded-[2.6rem] lg:min-h-[650px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_42%,rgba(225,24,132,.28),transparent_28%),radial-gradient(ellipse_at_66%_75%,rgba(27,157,225,.2),transparent_32%),linear-gradient(115deg,#190c32_10%,#26104a_58%,#111936)]" />
            <div className="hero-glow absolute -right-16 top-10 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-[100px]" />
            <div className="absolute inset-0 opacity-[.1]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.22) 1px,transparent 1px)", backgroundSize: "72px 72px", maskImage: "linear-gradient(to right,transparent,black)" }} />
            <div className="relative grid min-h-[610px] items-center gap-8 px-6 py-12 sm:px-10 lg:min-h-[650px] lg:grid-cols-[1.05fr_.95fr] lg:px-[7%] lg:py-16">
              <div className="relative z-10 max-w-[680px]">
                <div className="mb-7 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.08] px-3.5 py-2 text-[11px] font-bold tracking-wide text-violet-100 backdrop-blur"><Sparkles size={13} className="text-[#f14baf]" /> {hi ? "उत्तर प्रदेश स्वास्थ्य मिशन" : "UP HEALTHCARE, REIMAGINED"}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3.5 py-2 text-[11px] font-bold text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Lucknow live</span>
                </div>
                <h1 className="max-w-[700px] text-[clamp(2.7rem,6vw,5.6rem)] font-semibold leading-[.99] tracking-[-.055em]">{hi ? <>सही दवा,<br />सही कीमत,<br /><span className="bg-gradient-to-r from-[#ff61b6] via-[#e648c4] to-[#68dff1] bg-clip-text text-transparent">आपके करीब।</span></> : <>Better care<br />begins with a<br /><span className="bg-gradient-to-r from-[#ff61b6] via-[#e648c4] to-[#68dff1] bg-clip-text text-transparent">better find.</span></>}</h1>
                <p className="mt-6 max-w-[510px] text-sm leading-7 text-violet-100/75 sm:text-base">{hi ? "नजदीकी मेडिकल स्टोर पर दवा खोजें, सॉल्ट-मिलान वाले जन औषधि विकल्प देखें और परिवार की दवा पर 85% तक बचाएं।" : "Find medicine in nearby pharmacies, compare exact salt-matched Jan Aushadhi alternatives, and save up to 85% on your family's care."}</p>
                <div className="mt-8 max-w-[690px] rounded-[1.35rem] border border-white/20 bg-white p-2 shadow-[0_20px_55px_-22px_rgba(0,0,0,.7)] sm:p-2.5">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="min-w-0 flex-1"><SearchAutocomplete value={searchQuery} onChange={setSearchQuery} onSearch={search} placeholder={hi ? "दवा का नाम या सॉल्ट खोजें…" : "Search a medicine or active ingredient…"} size="large" /></div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] text-violet-100/60"><span className="mr-1 font-bold uppercase tracking-wider text-violet-100/45">{hi ? "अभी ट्रेंडिंग" : "Trending"}</span>{["Dolo 650", "Telma 40", "Pan 40", "Metformin"].map((name) => <button key={name} onClick={() => { setSearchQuery(name); search(name) }} className="rounded-full border border-white/15 px-3 py-1.5 transition hover:border-[#f24aa8]/60 hover:bg-white/10 hover:text-white">{name}</button>)}<button onClick={() => setEmergencyModalOpen(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 font-bold text-red-200 transition hover:bg-red-500/25"><AlertTriangle size={13} />{hi ? "आपातकाल" : "Emergency"}</button></div>
              </div>

              <div className="relative hidden min-h-[480px] items-center justify-center lg:flex">
                <div className="hero-orbit absolute h-[440px] w-[440px] rounded-full border border-white/15"><span className="absolute left-[12%] top-[19%] h-3 w-3 rounded-full bg-[#f1289e] shadow-[0_0_20px_5px_rgba(241,40,158,.6)]" /><span className="absolute bottom-[12%] right-[18%] h-2.5 w-2.5 rounded-full bg-[#42d7eb] shadow-[0_0_20px_5px_rgba(66,215,235,.55)]" /></div>
                <div className="absolute h-[350px] w-[350px] rounded-full border border-white/10" />
                <div className="absolute h-[275px] w-[275px] rounded-full bg-fuchsia-500/15 blur-[75px]" />
                <div className="hero-float relative flex h-[330px] w-[210px] items-center justify-center rounded-[105px] border border-white/30 bg-gradient-to-b from-white/15 via-white/[.05] to-cyan-300/10 shadow-[inset_0_0_40px_rgba(255,255,255,.12),0_35px_90px_rgba(0,0,0,.35)] backdrop-blur-md before:absolute before:inset-[7px] before:rounded-[100px] before:border before:border-white/10">
                  <div className="absolute left-5 top-12 h-20 w-8 rotate-[-20deg] rounded-full bg-white/10 blur-md" />
                  <div className="relative flex h-[190px] w-[90px] rotate-[-18deg] overflow-hidden rounded-full border border-white/40 bg-gradient-to-b from-[#ff79c5] via-[#e52f9a] to-[#9123b5] shadow-[0_18px_50px_rgba(231,28,143,.4)]"><div className="absolute inset-x-0 top-1/2 h-px bg-white/50" /><div className="absolute inset-y-0 left-0 w-1/2 bg-white/10" /><Pill size={27} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80" /></div>
                  <span className="absolute bottom-[-20px] h-2 w-24 rounded-full bg-cyan-300/70 blur-[10px]" />
                </div>
                <div className="absolute left-[3%] top-[26%] rounded-2xl border border-white/15 bg-[#261546]/75 p-3.5 shadow-xl backdrop-blur"><span className="block text-[9px] font-bold uppercase tracking-[.18em] text-violet-200/60">Generic match</span><span className="mt-1 block text-sm font-extrabold">Same salt. 85% less.</span></div>
                <div className="absolute bottom-[18%] right-[1%] flex items-center gap-3 rounded-2xl border border-white/15 bg-[#261546]/80 p-3.5 shadow-xl backdrop-blur"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/15 text-cyan-200"><MapPin size={18} /></span><span><span className="block text-[9px] font-bold uppercase tracking-[.16em] text-violet-200/60">Nearby stock</span><span className="mt-1 block text-sm font-extrabold">30+ pharmacies</span></span></div>
                <span className="absolute right-[15%] top-[14%] h-4 w-4 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-700 shadow-[0_0_25px_5px_rgba(241,40,158,.45)]" /><span className="absolute bottom-[13%] left-[16%] h-3 w-3 rounded-full bg-gradient-to-br from-cyan-200 to-blue-600 shadow-[0_0_22px_5px_rgba(66,215,235,.5)]" />
              </div>
              <div className="pointer-events-none absolute bottom-5 right-7 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/35 lg:flex"><span className="grid h-7 w-7 place-items-center rounded-full border border-white/20"><ArrowDown size={12} /></span>Scroll to discover</div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-7 max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/80 shadow-[0_20px_50px_-35px_rgba(20,12,38,.3)] md:grid-cols-4">
            {[{ n: "₹18.45L+", l: hi ? "यूपी परिवारों की बचत" : "Saved by UP families" }, { n: "30+", l: hi ? "लखनऊ में लाइव केमिस्ट" : "Live Lucknow chemists" }, { n: "1,800+", l: hi ? "जन औषधि विकल्प" : "Jan Aushadhi options" }, { n: "75", l: hi ? "जिले निगरानी में" : "UP districts covered" }].map((m, i) => <div key={m.n} className="bg-white px-4 py-5 text-center sm:px-6 sm:py-7"><strong className={`block text-2xl font-black tracking-tight sm:text-3xl ${i === 0 ? "text-[#e42691]" : "text-[#251042]"}`}>{m.n}</strong><span className="mt-1 block text-[10px] font-semibold text-slate-500 sm:text-xs">{m.l}</span></div>)}
          </div>
        </section>



        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
            <div className="reveal-up max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#edd8e8] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em] text-[#a82b77]"><HeartPulse size={14} /> {hi ? "इलाज के रास्ते में" : "A clearer path to care"}</span>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-[-.05em] sm:text-5xl">{hi ? <>आपकी दवा की खोज,<br /><span className="text-[#dd258c]">एक नज़र में।</span></> : <>Your medicine journey,<br /><span className="text-[#dd258c]">all in one view.</span></>}</h2>
              <p className="mt-5 max-w-[470px] text-sm leading-7 text-slate-600">{hi ? "सॉल्ट-मिलान, उपलब्धता और कीमत की जानकारी एक ही जगह देखें—फिर भरोसे से अगला कदम चुनें।" : "See the exact match, nearby availability, and price together, then choose your next step with confidence."}</p>
              <div className="mt-7 space-y-3">{[hi ? "सत्यापित सक्रिय घटक का मिलान" : "Verified active ingredient matches", hi ? "नजदीकी फार्मेसी में उपलब्धता" : "Availability at nearby pharmacies", hi ? "जन औषधि विकल्पों पर साफ बचत" : "Clear savings on Jan Aushadhi options"].map((item, index) => <div key={item} className={`reveal-up delay-${index + 1} flex items-center gap-3 text-xs font-bold text-slate-700`}><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check size={14} /></span>{item}</div>)}</div>
              <Link href="/search?q=Paracetamol" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25103f] px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-violet-950/10 transition hover:-translate-y-0.5 hover:bg-[#38145e]">{hi ? "दवा खोजें" : "Explore medicine matches"}<ArrowRight size={15} /></Link>
            </div>

            <div className="reveal-up delay-1 relative mx-auto w-full max-w-[700px]">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-[#f9d7ea] via-[#eee7fa] to-[#d6f5f4] opacity-70 blur-2xl" />
              <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#fffafd] via-[#f4eef9] to-[#e9f9f8] p-5 shadow-[0_30px_75px_-45px_rgba(47,20,66,.38)] sm:min-h-[460px] sm:p-8">
                <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#edc5df]/40 blur-3xl" /><div className="absolute -bottom-20 left-0 h-60 w-60 rounded-full bg-cyan-200/30 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4"><div><span className="text-[9px] font-black uppercase tracking-[.17em] text-slate-400">DAWAASETU · CARE SNAPSHOT</span><h3 className="mt-1 text-lg font-black tracking-tight text-[#26143b]">{hi ? "आपकी दवा की जानकारी" : "Your medicine snapshot"}</h3></div><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1.5 text-[9px] font-extrabold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{hi ? "मिलान मिला" : "MATCH FOUND"}</span></div>
                <div className="relative mt-5 grid gap-3 sm:mt-6 sm:grid-cols-[.92fr_1.08fr] sm:items-center">
                  <div className="relative mx-auto flex h-[220px] w-full max-w-[260px] items-center justify-center sm:h-[285px]">
                    <div className="absolute h-[200px] w-[200px] rounded-full border border-dashed border-[#d7c1de] sm:h-[255px] sm:w-[255px]" /><div className="absolute h-[160px] w-[160px] rounded-full bg-gradient-to-br from-pink-200/70 to-cyan-100/70 blur-2xl sm:h-[200px] sm:w-[200px]" />
                    <div className="relative flex h-[176px] w-[130px] -rotate-3 flex-col items-center rounded-[1.4rem] border border-white bg-gradient-to-b from-white to-[#f3e9f6] p-3 shadow-[0_24px_45px_-20px_rgba(57,20,73,.35)] sm:h-[220px] sm:w-[158px] sm:p-4">
                      <div className="flex w-full items-center justify-between"><span className="h-2 w-8 rounded-full bg-[#e72e92]" /><span className="text-[7px] font-black tracking-widest text-[#724889]">DS / 01</span></div>
                      <div className="mt-4 grid h-[95px] w-full place-items-center rounded-xl bg-gradient-to-br from-[#fce4f2] via-white to-[#dff8f8] sm:mt-5 sm:h-[130px]"><div className="relative h-[70px] w-[34px] -rotate-[32deg] overflow-hidden rounded-full border border-white/80 bg-gradient-to-b from-[#fe8bc5] via-[#dd369e] to-[#8e42bb] shadow-lg shadow-fuchsia-300/40 sm:h-[92px] sm:w-[43px]"><span className="absolute inset-x-0 top-1/2 h-px bg-white/80" /><span className="absolute inset-y-0 left-0 w-1/2 bg-white/15" /></div></div>
                      <div className="mt-3 w-full"><span className="block text-[8px] font-black uppercase tracking-[.12em] text-[#6b4c79] sm:text-[9px]">Paracetamol</span><span className="mt-1 block text-[7px] font-semibold text-slate-400 sm:text-[8px]">650 mg · salt matched</span></div>
                      <div className="mt-auto flex w-full items-center justify-between border-t border-[#e8ddea] pt-2"><span className="text-[7px] font-bold text-slate-400">GENERIC OPTION</span><span className="text-[9px] font-black text-emerald-700">SAVE 68%</span></div>
                    </div>
                    <span className="absolute right-[4%] top-[15%] grid h-9 w-9 place-items-center rounded-xl border border-white bg-white text-[#d92b91] shadow-lg"><Pill size={17} /></span><span className="absolute bottom-[13%] left-[4%] grid h-9 w-9 place-items-center rounded-xl border border-white bg-white text-[#32a9a3] shadow-lg"><MapPin size={16} /></span>
                  </div>
                  <div className="relative space-y-3">
                    <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-[0_12px_30px_-22px_rgba(33,16,63,.4)] backdrop-blur"><div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[.13em] text-slate-400">{hi ? "नजदीकी स्टॉक" : "NEARBY STOCK"}</span><MapPin size={15} className="text-[#dd258c]" /></div><div className="mt-3 flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1eaf8] text-[#55366e]"><Store size={17} /></span><span className="min-w-0"><b className="block truncate text-xs font-extrabold text-[#29183c]">{hi ? "शर्मा मेडिकल स्टोर" : "Sharma Medical Store"}</b><span className="mt-1 block text-[9px] text-slate-400">{hi ? "0.8 किमी · खुला है" : "0.8 km · Open now"}</span></span><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-700">IN STOCK</span></div></div>
                    <div className="rounded-2xl border border-[#f3d5e8] bg-gradient-to-br from-white to-[#fff3fa] p-4 shadow-[0_12px_30px_-22px_rgba(33,16,63,.35)]"><div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[.13em] text-[#a82b77]">{hi ? "जन औषधि विकल्प" : "JAN AUSHADHI MATCH"}</span><Sparkles size={15} className="text-[#e72e92]" /></div><div className="mt-3 flex items-end justify-between"><div><b className="block text-xs font-extrabold text-[#29183c]">{hi ? "समान सॉल्ट · 650mg" : "Same salt · 650mg"}</b><span className="mt-1 block text-[9px] text-slate-400">{hi ? "फार्मासिस्ट से पुष्टि करें" : "Confirm with your pharmacist"}</span></div><span className="text-xl font-black tracking-tight text-[#be287f]">₹11</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f2dce9]"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#e42691] to-[#7dcfd1]" /></div></div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/65 px-3 py-2 text-[9px] font-semibold text-slate-500"><ShieldCheck size={14} className="shrink-0 text-emerald-600" />{hi ? "सॉल्ट और स्ट्रेंथ मिलान दिखाया गया" : "Salt and strength match shown"}</div>
                  </div>
                </div>
                <span className="pointer-events-none absolute bottom-3 right-5 text-[8px] font-bold tracking-[.12em] text-[#a89ab0]">{hi ? "चित्र केवल उदाहरण के लिए" : "ILLUSTRATION · FOR DEMO"}</span>
              </div>
            </div>
          </div>
        </section>


        <section id="savings" className="relative overflow-hidden bg-[#1a0f32] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
          <div className="absolute -right-24 top-0 h-[480px] w-[480px] rounded-full bg-fuchsia-600/15 blur-[120px]" /><div className="absolute -bottom-52 left-1/3 h-[400px] w-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
          <div className="relative mx-auto max-w-[1320px]">
            <div className="reveal-up mb-11 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-emerald-200">Verified UP price index</span><h2 className="mt-5 max-w-[680px] text-4xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-5xl">{hi ? <>एक जैसा असर।<br /><span className="text-[#70dce8]">कीमत में बड़ा फर्क।</span></> : <>Same active medicine.<br /><span className="text-[#70dce8]">A lighter bill.</span></>}</h2><p className="mt-4 max-w-[560px] text-sm leading-7 text-violet-100/65">{hi ? "समान सॉल्ट और स्ट्रेंथ वाले विकल्पों की कीमत की पारदर्शी तुलना करें।" : "Compare transparent prices for exact salt and strength matches, and keep more in your family's care budget."}</p></div><Link href="/impact" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:border-white/40 hover:bg-white/10">{hi ? "पूरा प्रभाव देखें" : "Explore statewide impact"}<ArrowRight size={15} /></Link></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{prices.map((p, i) => <article key={p.name} className={`reveal-up ${i ? `delay-${Math.min(i, 3)}` : ""} group relative rounded-[1.5rem] border border-white/10 bg-white/[.055] p-5 backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[.09]`}><div className="flex items-center justify-between"><span className="rounded-md bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-100/70">{hi ? "दवा तुलना" : p.use}</span><span className="rounded-full bg-[#aaf378] px-2.5 py-1 text-[10px] font-black text-[#1a3213]">{p.saving}% less</span></div><h3 className="mt-5 text-base font-extrabold">{p.name}</h3><p className="mt-1 text-xs text-violet-100/50">Branded: {p.brand}</p><div className="my-5 h-px bg-white/10" /><div className="flex items-end justify-between"><div><span className="block text-[10px] text-violet-100/50">Branded pack</span><span className="mt-1 block text-sm font-bold text-white/55 line-through">₹{p.branded}</span></div><div className="text-right"><span className="block text-[10px] text-cyan-100/65">Jan Aushadhi</span><span className="mt-0.5 block text-3xl font-black tracking-tight text-[#8ce8eb]">₹{p.generic}</span></div></div><div className="mt-5 rounded-xl bg-white/[.07] px-3 py-2 text-center text-[11px] font-bold text-emerald-200">Save ₹{p.branded - p.generic} per pack</div></article>)}</div>
            <p className="reveal-up mt-5 text-[10px] leading-5 text-violet-100/40">Illustrative price examples for product discovery. Confirm current price, pack size and suitability with your pharmacist.</p>
          </div>
        </section>

        <section id="portals" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="reveal-up mx-auto mb-12 max-w-2xl text-center"><span className="inline-flex items-center gap-2 rounded-full bg-[#ede8f8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#57318b]"><Activity size={13} /> Care works better together</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{hi ? "एक सेतु, हर देखभालकर्ता के लिए" : "One bridge. Every care team."}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">{hi ? "नागरिकों, फार्मासिस्टों और स्वास्थ्य विभाग के लिए बनाए गए खास टूल्स।" : "Purpose-built tools for citizens, pharmacists, and public health teams."}</p></div>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              { role: "citizen" as const, path: "/citizen", icon: <User size={21} />, label: "FOR PATIENTS & FAMILIES", title: hi ? "नागरिक खोज" : "Citizen discovery", body: "Find nearby stock, compare verified generics, and reserve medicine for pickup.", points: ["Exact salt and strength matching", "Two-hour, no-prepayment hold", "UP scheme eligibility"], tone: "bg-[#fce7f3] text-[#c31e79]", button: "Enter citizen portal" },
              { role: "shopkeeper" as const, path: "/shop/dashboard", icon: <Store size={21} />, label: "FOR LOCAL PHARMACIES", title: hi ? "फार्मेसी टूल्स" : "Pharmacy workspace", body: "Manage availability, fulfill holds, and spot demand from your neighborhood.", points: ["Prescription and invoice tools", "Confirm holds and ready alerts", "Nearby demand trends"], tone: "bg-[#e6f7ed] text-[#23824e]", button: "Open pharmacy portal" },
              { role: "admin" as const, path: "/admin/heatmap", icon: <ShieldCheck size={21} />, label: "FOR PUBLIC HEALTH", title: hi ? "स्वास्थ्य विभाग" : "Public health view", body: "Monitor early medicine demand signals and critical district-level shortages.", points: ["Syndromic signals by district", "Privacy-preserving insights", "Send local health advisories"], tone: "bg-[#e9f5fb] text-[#287aa1]", button: "Open health dashboard" },
            ].map((card, i) => <article key={card.role} className={`reveal-up ${i ? `delay-${i}` : ""} flex flex-col rounded-[1.7rem] border border-slate-200/80 bg-white p-6 shadow-[0_10px_40px_-35px_rgba(20,12,38,.3)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_55px_-35px_rgba(20,12,38,.35)] sm:p-7`}><div className="flex items-center justify-between"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${card.tone}`}>{card.icon}</span><span className="text-[9px] font-black tracking-[.13em] text-slate-400">0{i + 1} / 03</span></div><p className="mt-6 text-[9px] font-black tracking-[.15em] text-slate-400">{card.label}</p><h3 className="mt-2 text-2xl font-extrabold tracking-tight">{card.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p><ul className="mt-5 flex-1 space-y-3 border-t border-slate-100 pt-5">{card.points.map(point => <li key={point} className="flex items-start gap-2.5 text-xs font-semibold text-slate-600"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />{point}</li>)}</ul><button onClick={() => chooseRole(card.role, card.path)} className="mt-7 flex w-full items-center justify-between rounded-xl bg-[#21103f] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#37135e]"><span>{card.button}</span><ArrowRight size={16} /></button></article>)}
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12"><div className="reveal-up relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#341157] via-[#211039] to-[#121b37] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16"><div className="absolute -right-16 -top-32 h-80 w-80 rounded-full bg-[#ee278e]/20 blur-[85px]" /><div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#24113b]"><ShieldCheck size={13} /> Ayushman Bharat · UP schemes</span><h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">{hi ? "जानें, आपके परिवार के लिए कौन-सी स्वास्थ्य सहायता उपलब्ध है।" : "Know which healthcare support your family may be eligible for."}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-violet-100/70">Check PM-JAY, Ayushman Vay Vandana 70+, Mukhyamantri Jan Arogya and hospital essential medicine support.</p></div><Link href="/schemes" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-sm font-black text-[#24113b] transition hover:-translate-y-0.5 hover:bg-amber-200">Check scheme eligibility<ArrowRight size={16} /></Link></div></div></section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 sm:flex-row sm:items-center"><Link href="/" className="flex items-center gap-2.5 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#241045] text-white"><HeartPulse size={18} /></span>DawaaSetu<span className="text-[#e42691]">.</span></Link><p className="max-w-xl text-[10px] leading-5 text-slate-500">DawaaSetu supports medicine discovery and price comparison. Always follow your clinician's advice; confirm substitutions with a qualified pharmacist.</p><div className="flex gap-5 text-xs font-bold text-slate-500"><Link href="/impact" className="hover:text-[#d51e83]">Impact</Link><Link href="/login" className="hover:text-[#d51e83]">Sign in</Link><Link href="/admin/heatmap" className="hover:text-[#d51e83]">Health dashboard</Link></div></div></footer>
      <MedicineEmergencyModal isOpen={emergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} />
    </div>
  );
}