"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

interface SchemeItem {
  id: string;
  name: string;
  description: string;
  benefitText: string;
  howToApply: string;
  officialUrl?: string;
  categoryBucket: string;
  eligibility: {
    ageRange?: string;
    incomeCeiling?: string;
    state?: string;
    categories?: string[];
    conditions?: string[];
  };
}

interface QualifiedScheme {
  id: string;
  name: string;
  benefitText: string;
  matchReason: string;
  howToApply: string;
  officialUrl?: string;
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Eligibility Checker State
  const [age, setAge] = useState<number>(35);
  const [category, setCategory] = useState<string>("BPL");
  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [hasDiabetesOrBP, setHasDiabetesOrBP] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    qualifiedCount: number;
    coverageEstimateText: string;
    qualified: QualifiedScheme[];
  } | null>(null);

  // Fetch schemes on mount
  useEffect(() => {
    async function loadSchemes() {
      setLoading(true);
      try {
        const res = await fetch("/api/schemes");
        const data = await res.json();
        if (data.success) {
          setSchemes(data.schemes);
        }
      } catch (err) {
        console.error("Failed to fetch schemes", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  const handleEvaluateEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);

    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          category,
          annualIncome,
          isPregnant,
          hasDiabetesOrBP,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEligibilityResult({
          qualifiedCount: data.qualifiedCount,
          coverageEstimateText: data.coverageEstimateText,
          qualified: data.qualified,
        });
      }
    } catch (err) {
      console.error("Eligibility eval error", err);
    } finally {
      setEvaluating(false);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory =
      categoryFilter === "ALL" || s.categoryBucket === categoryFilter;

    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.benefitText.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-health-900 via-health-800 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-health-700/60 backdrop-blur-sm border border-health-500/40 px-3 py-1 rounded-full text-xs font-semibold text-teal-200">
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            Government of Uttar Pradesh &amp; National Health Mission
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Public Healthcare Schemes &amp; Subsidies
          </h1>
          <p className="text-teal-100/90 text-sm md:text-base leading-relaxed">
            Discover government healthcare protections available to UP citizens. Check your eligibility
            for Ayushman Bharat (₹5 Lakh cover), Mukhyamantri Jan Arogya, PM Jan Aushadhi 90% generic discounts,
            and free chronic medicines.
          </p>
        </div>
      </div>

      {/* Interactive Eligibility Checker Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-health-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-health-600" />
              Instant Subsidy Evaluator
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Check Your Healthcare Entitlements in 30 Seconds
            </h2>
            <p className="text-xs text-slate-500">
              Enter your details to discover all central and UP state subsidies you and your family qualify for.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-health-50 text-health-800 rounded-full border border-health-200 self-start md:self-auto">
            100% Free &amp; Confidential
          </span>
        </div>

        <form onSubmit={handleEvaluateEligibility} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age of Citizen:
              </label>
              <input
                type="number"
                min={0}
                max={110}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {age >= 70 ? "Qualified for Ayushman Vay Vandana!" : age <= 18 ? "Covered under RBSK child care." : ""}
              </span>
            </div>

            {/* Social Category / Ration Card */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category / Ration Status:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500"
              >
                <option value="BPL">BPL / Poor Family</option>
                <option value="ANTYODAYA">Antyodaya Anna Yojana (AAY)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC / ST</option>
                <option value="GENERAL">General / Middle Class</option>
              </select>
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approx. Annual Household Income:
              </label>
              <select
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-health-500"
              >
                <option value={80000}>Under ₹1,00,000 / year</option>
                <option value={150000}>₹1,00,000 - ₹2,50,000 / year</option>
                <option value={400000}>₹2,50,000 - ₹5,00,000 / year</option>
                <option value={800000}>Above ₹5,00,000 / year</option>
              </select>
            </div>

            {/* Health Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Health Needs:
              </label>
              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiabetesOrBP}
                    onChange={(e) => setHasDiabetesOrBP(e.target.checked)}
                    className="rounded border-slate-300 text-health-600 focus:ring-health-500"
                  />
                  <span>Diabetes or High BP (NP-NCD)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="rounded border-slate-300 text-health-600 focus:ring-health-500"
                  />
                  <span>Pregnant Woman (PMSMA)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={evaluating}
              className="px-6 py-2.5 bg-health-700 hover:bg-health-800 text-white rounded-xl text-xs font-bold shadow transition-colors inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {evaluating ? "Evaluating Eligibility..." : "Check My Healthcare Entitlements"}
            </button>
          </div>
        </form>

        {/* Live Evaluated Results Panel */}
        {eligibilityResult && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Evaluation Complete &bull; Citizen Profile ({age} yrs, {category})
                </span>
                <h3 className="text-lg font-bold text-emerald-950 mt-0.5">
                  You Qualify for {eligibilityResult.qualifiedCount} Government Healthcare Protections!
                </h3>
              </div>
              <div className="text-left md:text-right">
                <span className="inline-block bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {eligibilityResult.coverageEstimateText}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibilityResult.qualified.map((q) => (
                <div
                  key={q.id}
                  className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{q.name}</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                      Eligible
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">
                    💰 {q.benefitText}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <strong>Why you qualify: </strong> {q.matchReason}
                  </p>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <strong>How to apply: </strong> {q.howToApply}
                  </div>
                  {q.officialUrl && (
                    <div className="pt-1">
                      <a
                        href={q.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-health-700 hover:text-health-900"
                      >
                        Official Government Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schemes Directory Catalog */}
      <div className="space-y-4">
        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: "ALL", label: "All Schemes (8)" },
              { id: "HOSPITAL", label: "Hospitalization (₹5 Lakh Cover)" },
              { id: "GENERIC_MEDICINES", label: "Generic Medicines (PMBJP / Free)" },
              { id: "MATERNAL_CHILD", label: "Maternal & Child (PMSMA / RBSK)" },
              { id: "CHRONIC_SPECIAL", label: "Chronic Care (Diabetes/BP/TB)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-health-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme name or benefit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-health-500"
            />
          </div>
        </div>

        {/* Schemes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-health-300 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {scheme.name}
                  </h3>
                  <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Government Backed
                  </span>
                </div>

                <div className="p-3 bg-health-50/60 rounded-xl border border-health-100">
                  <div className="text-[10px] font-bold text-health-800 uppercase tracking-wider">
                    Key Entitlement &amp; Coverage
                  </div>
                  <div className="text-xs font-bold text-health-900 mt-0.5">
                    {scheme.benefitText}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Eligibility checklist */}
                <div className="space-y-1 pt-1 text-xs text-slate-600">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Eligibility Guidelines:
                  </div>
                  {scheme.eligibility.ageRange && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-health-600" />
                      <span>Age: {scheme.eligibility.ageRange}</span>
                    </div>
                  )}
                  {scheme.eligibility.incomeCeiling && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-health-600" />
                      <span>Income / Criteria: {scheme.eligibility.incomeCeiling}</span>
                    </div>
                  )}
                  {scheme.eligibility.categories && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-health-600" />
                      <span>Beneficiaries: {scheme.eligibility.categories.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* How to apply */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-snug">
                  <strong>How to Apply in UP: </strong> {scheme.howToApply}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <Link
                  href="/search"
                  className="text-xs font-bold text-health-700 hover:text-health-900 inline-flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" /> Find In-Stock Medicines
                </Link>

                {scheme.officialUrl && (
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
