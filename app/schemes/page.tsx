"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  ExternalLink,
  Filter,
  UserCheck,
  Building,
  HeartPulse,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Award,
  AlertCircle,
  Clock,
  Info,
  Check,
  X,
  FileText,
  User,
  Heart,
  Baby,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  UserProfile,
  SchemeEvaluationResult,
  evaluateAllSchemes,
} from "@/lib/schemes";

const UP_DISTRICTS = [
  "Lucknow",
  "Varanasi",
  "Kanpur Nagar",
  "Gorakhpur",
  "Prayagraj",
  "Bareilly",
  "Meerut",
  "Agra",
  "Aligarh",
  "Ayodhya",
  "Jhansi",
  "Moradabad",
  "Saharanpur",
  "Ghaziabad",
  "Noida (Gautam Buddha Nagar)",
];

export default function SchemesPage() {
  const { t, language } = useTranslation();
  const [schemes, setSchemes] = useState<SchemeEvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form State (All fields optional)
  const [age, setAge] = useState<string>("65");
  const [district, setDistrict] = useState<string>("Lucknow");
  const [annualIncome, setAnnualIncome] = useState<string>("120000");
  const [category, setCategory] = useState<string>("BPL");
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [hasChronicCondition, setHasChronicCondition] = useState<boolean>(true);
  const [consentToSave, setConsentToSave] = useState<boolean>(true);

  // Auto-derived Senior Citizen flags
  const parsedAge = age ? parseInt(age, 10) : null;
  const isSenior = typeof parsedAge === "number" && parsedAge >= 60;
  const isSuperSenior = typeof parsedAge === "number" && parsedAge >= 70;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load existing profile from localStorage on mount and evaluate
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("dawaasetu_user_profile");
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.age !== undefined && p.age !== null) setAge(String(p.age));
        if (p.district) setDistrict(p.district);
        if (p.annualIncome !== undefined && p.annualIncome !== null)
          setAnnualIncome(String(p.annualIncome));
        if (p.category) setCategory(p.category);
        if (p.isPregnant !== undefined) setIsPregnant(Boolean(p.isPregnant));
        if (p.hasChronicCondition !== undefined)
          setHasChronicCondition(Boolean(p.hasChronicCondition));
      }
    } catch (e) {
      console.warn("Could not load stored profile:", e);
    }
  }, []);

  // Fetch schemes from API
  const fetchAndEvaluateSchemes = async (profileToEvaluate?: UserProfile) => {
    setLoading(true);
    try {
      const profile: UserProfile = profileToEvaluate || {
        age: parsedAge,
        district,
        annualIncome: annualIncome ? parseFloat(annualIncome) : null,
        category,
        isPregnant,
        hasChronicCondition,
      };

      const res = await fetch(
        `/api/schemes?age=${profile.age ?? ""}&district=${encodeURIComponent(
          profile.district ?? "Lucknow"
        )}&annualIncome=${profile.annualIncome ?? ""}&category=${encodeURIComponent(
          profile.category ?? "GENERAL"
        )}&isPregnant=${profile.isPregnant}&hasChronicCondition=${
          profile.hasChronicCondition
        }&lang=${language}`
      );
      const data = await res.json();
      if (data.success && data.schemes) {
        setSchemes(data.schemes);
      }
    } catch (err) {
      console.error("Failed to load schemes:", err);
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchAndEvaluateSchemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Form Submission
  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);

    const profile: UserProfile = {
      age: parsedAge,
      district,
      annualIncome: annualIncome ? parseFloat(annualIncome) : null,
      category,
      isPregnant,
      hasChronicCondition,
    };

    // Save profile to localStorage
    try {
      localStorage.setItem("dawaasetu_user_profile", JSON.stringify(profile));
    } catch (e) {
      console.warn("Local storage save failed:", e);
    }

    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          saveProfile: consentToSave,
          lang: language,
        }),
      });
      const data = await res.json();
      if (data.success && data.schemes) {
        setSchemes(data.schemes);
        showToast(
          consentToSave
            ? language === "hi"
              ? "प्रोफाइल सुरक्षित की गई एवं योजनाओं का मूल्यांकन पूरा हुआ!"
              : "Profile saved & scheme eligibility calculated!"
            : language === "hi"
            ? "योजनाओं की पात्रता का मूल्यांकन संपन्न!"
            : "Scheme eligibility evaluated!"
        );
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      showToast("Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // Filter schemes
  const filteredSchemes = schemes.filter((s) => {
    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        s.name.toLowerCase().includes(q) || s.nameHi.toLowerCase().includes(q);
      const matchDesc =
        s.description.toLowerCase().includes(q) ||
        s.descriptionHi.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Category / Status Filter
    if (activeFilter === "ELIGIBLE") return s.status === "ELIGIBLE";
    if (activeFilter === "SENIOR") return s.categoryBucket === "SENIOR";
    if (activeFilter === "HOSPITAL") return s.categoryBucket === "HOSPITAL";
    if (activeFilter === "CHRONIC") return s.categoryBucket === "CHRONIC";
    if (activeFilter === "MATERNAL") return s.categoryBucket === "MATERNAL";
    if (activeFilter === "UNIVERSAL") return s.categoryBucket === "UNIVERSAL";
    return true;
  });

  const eligibleCount = schemes.filter((s) => s.status === "ELIGIBLE").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-health-50 text-health-800 text-xs font-bold px-3 py-1 rounded-full border border-health-200">
            <ShieldAlert className="w-3.5 h-3.5 text-health-600" />
            {language === "hi"
              ? "आयुष्मान भारत एवं उत्तर प्रदेश सरकारी योजनाएं"
              : "Ayushman Bharat & UP State Entitlements"}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {language === "hi"
              ? "सरकारी स्वास्थ्य योजनाएं एवं दवा सब्सिडी"
              : "Government Health Schemes & Medicine Subsidies"}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            {language === "hi"
              ? "केंद्र एवं उत्तर प्रदेश सरकार की स्वास्थ्य बीमा योजनाओं, मुफ्त अस्पताल दवाओं और जन औषधि छूट के लिए अपनी पात्रता जांचें।"
              : "Check your eligibility for Central & Uttar Pradesh healthcare schemes, free hospital medicines, and Jan Aushadhi discounts."}
          </p>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 px-5 py-3.5 rounded-2xl shadow-xs shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {eligibleCount}
          </div>
          <div>
            <div className="text-xs font-extrabold text-emerald-950">
              {language === "hi"
                ? `${eligibleCount} योजनाओं के पात्र`
                : `${eligibleCount} Schemes Qualified`}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {language === "hi" ? "आपकी प्रोफाइल के आधार पर" : "Based on your profile"}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form (Requirement 1) */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 text-health-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {language === "hi"
                  ? "अपनी योजना पात्रता जांचें"
                  : "Check Your Scheme Eligibility"}
              </h2>
              <p className="text-xs text-health-200">
                {language === "hi"
                  ? "वैकल्पिक विवरण दर्ज करें — हमारा इंजन नियमों का स्वचालित मूल्यांकन कर पात्रता बताएगा।"
                  : "All fields are optional — our deterministic engine evaluates rules to show your exact benefits."}
              </p>
            </div>
          </div>

          {/* Auto-derived Senior Citizen Badges */}
          <div className="flex items-center gap-2">
            {isSuperSenior ? (
              <span className="bg-amber-400 text-amber-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                {language === "hi"
                  ? "70+ वरिष्ठ नागरिक (वय वंदना कवर)"
                  : "Super Senior 70+ (Vay Vandana Cover)"}
              </span>
            ) : isSenior ? (
              <span className="bg-emerald-400 text-emerald-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                {language === "hi"
                  ? "वरिष्ठ नागरिक (60+ आयु)"
                  : "Senior Citizen (60+ Age)"}
              </span>
            ) : null}
          </div>
        </div>

        {/* Profile Inputs Grid */}
        <form onSubmit={handleCheckEligibility} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Age */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-health-100 uppercase tracking-wider">
                {language === "hi" ? "आपकी आयु (Age)" : "Your Age"}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 65"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-health-200/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* 2. District in UP */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-health-100 uppercase tracking-wider">
                {language === "hi" ? "उत्तर प्रदेश का जिला" : "District in UP"}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                {UP_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Annual Family Income */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-health-100 uppercase tracking-wider">
                {language === "hi"
                  ? "वार्षिक पारिवारिक आय (₹)"
                  : "Annual Family Income (₹)"}
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-health-200/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* 4. Social Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-health-100 uppercase tracking-wider">
                {language === "hi" ? "सामाजिक श्रेणी / राशन वर्ग" : "Social Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <option value="BPL" className="bg-slate-900 text-white">
                  BPL (Below Poverty Line)
                </option>
                <option value="ANTYODAYA" className="bg-slate-900 text-white">
                  Antyodaya Anna Yojana (AAY)
                </option>
                <option value="EWS" className="bg-slate-900 text-white">
                  EWS (Economically Weaker Section)
                </option>
                <option value="SC" className="bg-slate-900 text-white">
                  SC (Scheduled Caste)
                </option>
                <option value="ST" className="bg-slate-900 text-white">
                  ST (Scheduled Tribe)
                </option>
                <option value="OBC" className="bg-slate-900 text-white">
                  OBC (Other Backward Class)
                </option>
                <option value="GENERAL" className="bg-slate-900 text-white">
                  General / Other
                </option>
              </select>
            </div>
          </div>

          {/* Row 2: Pregnant & Chronic Condition Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Pregnant Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Baby className="w-4 h-4 text-pink-300" />
                <span className="text-xs font-bold text-white">
                  {language === "hi"
                    ? "क्या कोई गर्भवती है? (PMSMA मातृत्व लाभ)"
                    : "Pregnant Family Member? (PMSMA Benefit)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPregnant(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isPregnant
                      ? "bg-pink-500 text-white shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {language === "hi" ? "हां" : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPregnant(false)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    !isPregnant
                      ? "bg-white text-health-950 shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {language === "hi" ? "नहीं" : "No"}
                </button>
              </div>
            </div>

            {/* Chronic Disease Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-bold text-white">
                  {language === "hi"
                    ? "दीर्घकालिक बीमारी? (डायबिटीज / बीपी / हृदय)"
                    : "Chronic Condition? (Diabetes / BP / Heart)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHasChronicCondition(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    hasChronicCondition
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {language === "hi" ? "हां" : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setHasChronicCondition(false)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    !hasChronicCondition
                      ? "bg-white text-health-950 shadow-xs"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {language === "hi" ? "नहीं" : "No"}
                </button>
              </div>
            </div>
          </div>

          {/* Explicit Consent Checkbox (Requirement 1) */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-health-100 font-medium">
              <input
                type="checkbox"
                checked={consentToSave}
                onChange={(e) => setConsentToSave(e.target.checked)}
                className="w-4 h-4 rounded text-health-600 focus:ring-health-500 border-white/30 bg-white/10"
              />
              <span>
                {language === "hi"
                  ? "योजनाएं खोजने के लिए मेरे विवरण का उपयोग करें (Use my details to find schemes)"
                  : 'Use my details to find schemes (Saves to profile with consent)'}
              </span>
            </label>

            <button
              type="submit"
              disabled={evaluating}
              className="px-6 py-2.5 bg-white text-health-950 hover:bg-health-50 rounded-2xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
            >
              {evaluating ? (
                <div className="w-3.5 h-3.5 border-2 border-health-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-health-700" />
              )}
              <span>
                {evaluating
                  ? language === "hi"
                    ? "मूल्यांकन हो रहा है..."
                    : "Evaluating Schemes..."
                  : language === "hi"
                  ? "मेरी पात्रता जांचें"
                  : "Check My Scheme Eligibility"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: "ALL", labelEn: "All Schemes", labelHi: "सभी योजनाएं" },
              {
                id: "ELIGIBLE",
                labelEn: `Eligible for Me (${eligibleCount})`,
                labelHi: `मेरे लिए पात्र (${eligibleCount})`,
              },
              { id: "SENIOR", labelEn: "Senior 70+", labelHi: "70+ वरिष्ठ" },
              { id: "HOSPITAL", labelEn: "Cashless ₹5L", labelHi: "कैशलेस ₹5 लाख" },
              { id: "CHRONIC", labelEn: "Chronic Free Drugs", labelHi: "मुफ्त क्रॉनिक दवाएं" },
              { id: "MATERNAL", labelEn: "Maternal & Child", labelHi: "मातृत्व व शिशु" },
              { id: "UNIVERSAL", labelEn: "Jan Aushadhi", labelHi: "जन औषधि" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  activeFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {language === "hi" ? tab.labelHi : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "hi"
                  ? "योजना का नाम खोजें..."
                  : "Search schemes by name or keyword..."
              }
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid (Requirement 3) */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-health-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Evaluating scheme eligibility against your profile...
            </p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
            No schemes found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map((scheme) => {
              const isEligible = scheme.status === "ELIGIBLE";
              const isMaybe = scheme.status === "MAYBE";

              const badgeColor = isEligible
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : isMaybe
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-slate-100 text-slate-600 border-slate-200";

              const badgeText = isEligible
                ? language === "hi"
                  ? "✓ आप पात्र हैं (Eligible)"
                  : "✓ You Qualify (Eligible)"
                : isMaybe
                ? language === "hi"
                  ? "संभावित पात्र (Likely)"
                  : "Likely Eligible (Verify)"
                : language === "hi"
                ? "अपात्र (Not Eligible)"
                : "Not Eligible";

              const schemeTitle =
                language === "hi" ? scheme.nameHi : scheme.name;
              const schemeDesc =
                language === "hi" ? scheme.descriptionHi : scheme.description;
              const schemeBenefit =
                language === "hi" ? scheme.benefitTextHi : scheme.benefitText;
              const schemeApply =
                language === "hi" ? scheme.howToApplyHi : scheme.howToApply;
              const docsList =
                language === "hi"
                  ? scheme.documentsNeededHi
                  : scheme.documentsNeeded;
              const reasonsList =
                language === "hi" ? scheme.reasonsHi : scheme.reasons;

              return (
                <div
                  key={scheme.id}
                  className={`rounded-3xl p-6 border shadow-soft transition-all flex flex-col justify-between space-y-4 ${
                    isEligible
                      ? "bg-white border-emerald-200 hover:border-emerald-400"
                      : isMaybe
                      ? "bg-white border-amber-200 hover:border-amber-400"
                      : "bg-slate-50/60 border-slate-200 opacity-80"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Status Badge & Coverage Value */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${badgeColor}`}
                      >
                        {badgeText}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {scheme.indicativeCoverage}
                      </span>
                    </div>

                    {/* Scheme Name & Description */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {schemeTitle}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {schemeDesc}
                      </p>
                    </div>

                    {/* Benefit Highlight Card */}
                    <div className="p-3.5 rounded-2xl bg-health-50/70 border border-health-200 text-xs text-health-950 space-y-1">
                      <div className="font-extrabold text-[11px] text-health-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-health-600" />
                        {language === "hi" ? "योजना का मुख्य लाभ" : "Key Benefit"}
                      </div>
                      <p className="font-semibold">{schemeBenefit}</p>
                    </div>

                    {/* Plain Language Match Reason (Requirement 2) */}
                    <div
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        isEligible
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                          : isMaybe
                          ? "bg-amber-50/60 border-amber-200 text-amber-950"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        {language === "hi"
                          ? "पात्रता का कारण (Reason)"
                          : "Why You Match / Status Reason"}
                      </div>
                      <p className="leading-relaxed">
                        {reasonsList[0] || "Universal public program available."}
                      </p>
                    </div>

                    {/* Documents Needed */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        {language === "hi" ? "आवश्यक दस्तावेज:" : "Documents Needed:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {docsList.map((doc, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* How to Apply */}
                    <div className="text-xs text-slate-600 pt-1 leading-relaxed">
                      <strong className="text-slate-800">
                        {language === "hi" ? "आवेदन कैसे करें: " : "How to Apply: "}
                      </strong>
                      {schemeApply}
                    </div>
                  </div>

                  {/* External Portal Link Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 italic">
                      {language === "hi" ? "सरकारी पोर्टल पर पुष्टि करें" : "Verify on official portal"}
                    </span>
                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <span>
                        {language === "hi"
                          ? "आधिकारिक पोर्टल"
                          : "Official Portal"}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer (Requirement 3) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>
            {language === "hi" ? "अस्वीकरण (Disclaimer): " : "Disclaimer: "}
          </strong>
          {language === "hi"
            ? "दर्शायी गई पात्रता आपकी दर्ज जानकारी के आधार पर एक प्रारंभिक संकेतक है। कृपया किसी भी स्वास्थ्य योजना के तहत लाभ या भर्ती हेतु आधिकारिक सरकारी पोर्टल (जैसे beneficiary.nha.gov.in या uphealth.up.nic.in) अथवा निकटतम सरकारी अस्पताल पर आवश्यक दस्तावेजों की पुष्टि अवश्य करें।"
            : "Eligibility is indicative based on your profile inputs. Please verify rules, required documentation, and hospital empaneled lists on the official government portal (e.g. beneficiary.nha.gov.in or uphealth.up.nic.in) before clinical or hospital application."}
        </p>
      </div>
    </div>
  );
}
