"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation, UserRole } from "@/lib/i18n";
import {
  User,
  Store,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  FileBadge,
  Building,
  Activity,
  HeartPulse,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole, role: currentRole, language } = useTranslation();

  const initialRoleParam = searchParams.get("role") as UserRole | null;
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRoleParam && ["citizen", "shopkeeper", "admin"].includes(initialRoleParam)
      ? initialRoleParam
      : currentRole || "citizen"
  );

  // Demo Citizen Personas
  const citizenPersonas = [
    {
      id: "user-ram",
      name: "Ram Swaroop Shukla",
      age: 72,
      category: "Senior Citizen (70+)",
      phone: "+91 98390 12001",
      condition: "Type-2 Diabetes & Hypertension",
      scheme: "Ayushman Bharat PM-JAY Vay Vandana",
      savedTotal: 3450,
    },
    {
      id: "user-sunita",
      name: "Sunita Verma",
      age: 26,
      category: "OBC / Pregnant Mother",
      phone: "+91 98390 12002",
      condition: "2nd Trimester Antenatal Care",
      scheme: "Pradhan Mantri Surakshit Matritva (PMSMA)",
      savedTotal: 1280,
    },
    {
      id: "user-aslam",
      name: "Mohd. Aslam Ansari",
      age: 44,
      category: "BPL / Antyodaya",
      phone: "+91 98390 12003",
      condition: "Chronic Gastric & Asthma",
      scheme: "Mukhyamantri Jan Arogya & Jan Aushadhi",
      savedTotal: 4890,
    },
  ];

  // Demo Pharmacy Stores
  const shopPersonas = [
    {
      id: "store-1",
      name: "PM Jan Aushadhi Kendra - Hazratganj",
      type: "JAN_AUSHADHI",
      license: "UP/LKO/JAK/2022/014",
      area: "Hazratganj, Lucknow",
      phone: "+91 98390 44001",
    },
    {
      id: "store-2",
      name: "Apollo Pharmacy - Hazratganj",
      type: "PRIVATE",
      license: "UP/LKO/RET/2019/882",
      area: "Hazratganj, Lucknow",
      phone: "+91 98390 44002",
    },
    {
      id: "store-3",
      name: "Sanjeevani Medicos - Alambagh",
      type: "PRIVATE",
      license: "UP/LKO/RET/2021/309",
      area: "Alambagh, Lucknow",
      phone: "+91 98390 44005",
    },
  ];

  // Demo Health Officers
  const adminPersonas = [
    {
      id: "officer-cmo",
      name: "Dr. Manoj Kumar Srivastava",
      designation: "Chief Medical Officer (CMO), Lucknow",
      department: "Directorate of Medical & Health Services, Uttar Pradesh",
      jurisdiction: "Lucknow District (All 8 Tehsils)",
    },
    {
      id: "officer-epi",
      name: "Dr. Ananya Tripathi",
      designation: "State Surveillance Officer & Epidemiologist",
      department: "UP Integrated Disease Surveillance Programme (IDSP)",
      jurisdiction: "All 75 Districts of Uttar Pradesh",
    },
  ];

  const [selectedCitizenId, setSelectedCitizenId] = useState(citizenPersonas[0].id);
  const [selectedShopId, setSelectedShopId] = useState(shopPersonas[0].id);
  const [selectedAdminId, setSelectedAdminId] = useState(adminPersonas[0].id);
  const [loginToast, setLoginToast] = useState<string | null>(null);

  const handleLogin = () => {
    setRole(selectedRole);

    if (selectedRole === "citizen") {
      const persona = citizenPersonas.find((p) => p.id === selectedCitizenId);
      localStorage.setItem("dawaasetu_user", JSON.stringify(persona));
      setLoginToast(`Logged in as ${persona?.name} (Citizen). Redirecting...`);
      setTimeout(() => router.push("/citizen"), 800);
    } else if (selectedRole === "shopkeeper") {
      const store = shopPersonas.find((s) => s.id === selectedShopId);
      localStorage.setItem("dawaasetu_store", JSON.stringify(store));
      setLoginToast(`Logged in as ${store?.name} (Pharmacist). Redirecting...`);
      setTimeout(() => router.push("/shop/dashboard"), 800);
    } else if (selectedRole === "admin") {
      const admin = adminPersonas.find((a) => a.id === selectedAdminId);
      localStorage.setItem("dawaasetu_admin", JSON.stringify(admin));
      setLoginToast(`Authenticated as ${admin?.designation}. Accessing Surveillance...`);
      setTimeout(() => router.push("/admin/heatmap"), 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      {/* Toast Notification */}
      {loginToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{loginToast}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-bold border border-health-200">
            <Activity className="w-4 h-4 text-health-600" />
            <span>DawaaSetu Unified Access Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Select Your Role to Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose whether you are a citizen seeking affordable medicines, a licensed pharmacist managing orders, or a UP health officer.
          </p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole("citizen")}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
              selectedRole === "citizen"
                ? "bg-health-700 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Citizen (नागरिक)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("shopkeeper")}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
              selectedRole === "shopkeeper"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>2. Chemist (दुकानदार)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
              selectedRole === "admin"
                ? "bg-teal-800 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Health Dept (प्रशासन)</span>
          </button>
        </div>

        {/* Selected Role Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          {/* TAB 1: CITIZEN */}
          {selectedRole === "citizen" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-health-600" />
                  Select Citizen Profile (Demo)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-seeded Lucknow citizen personas with different health profiles and subsidy eligibility.
                </p>
              </div>

              <div className="space-y-3">
                {citizenPersonas.map((persona) => {
                  const isSelected = selectedCitizenId === persona.id;
                  return (
                    <label
                      key={persona.id}
                      onClick={() => setSelectedCitizenId(persona.id)}
                      className={`p-4 rounded-2xl border-2 flex items-start justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-health-50/60 border-health-600 ring-2 ring-health-500/20"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {persona.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Age: {persona.age}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {persona.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          Health profile: {persona.condition}
                        </p>
                        <p className="text-[11px] text-health-800 font-semibold">
                          Entitled: {persona.scheme}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-700 block">
                          ₹{persona.savedTotal} Saved
                        </span>
                        <input
                          type="radio"
                          name="citizenPersona"
                          checked={isSelected}
                          onChange={() => setSelectedCitizenId(persona.id)}
                          className="mt-2 text-health-600 focus:ring-health-500"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full py-4 rounded-2xl bg-health-700 hover:bg-health-800 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Sign In as Citizen &rarr; Enter Citizen Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SHOPKEEPER */}
          {selectedRole === "shopkeeper" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  Select Licensed Chemist Pharmacy (Demo)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage stock, accept 2-hour holds, and scan invoices for this pharmacy.
                </p>
              </div>

              <div className="space-y-3">
                {shopPersonas.map((store) => {
                  const isSelected = selectedShopId === store.id;
                  const isJanAushadhi = store.type === "JAN_AUSHADHI";

                  return (
                    <label
                      key={store.id}
                      onClick={() => setSelectedShopId(store.id)}
                      className={`p-4 rounded-2xl border-2 flex items-start justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-500/20"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {store.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isJanAushadhi
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isJanAushadhi ? "PM Jan Aushadhi" : "Licensed Chemist"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">📍 {store.area}</p>
                        <p className="text-[11px] font-mono text-slate-400">
                          License: {store.license} &bull; {store.phone}
                        </p>
                      </div>

                      <div className="shrink-0 pt-1">
                        <input
                          type="radio"
                          name="shopPersona"
                          checked={isSelected}
                          onChange={() => setSelectedShopId(store.id)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Sign In as Chemist &rarr; Open Store Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN */}
          {selectedRole === "admin" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  UP Health Department Officer Login
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Access district shortage heatmaps, epidemic outbreak signals, and UPMSCL dispatch.
                </p>
              </div>

              <div className="space-y-3">
                {adminPersonas.map((admin) => {
                  const isSelected = selectedAdminId === admin.id;

                  return (
                    <label
                      key={admin.id}
                      onClick={() => setSelectedAdminId(admin.id)}
                      className={`p-4 rounded-2xl border-2 flex items-start justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-teal-50/60 border-teal-700 ring-2 ring-teal-500/20"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {admin.name}
                        </span>
                        <p className="text-xs font-bold text-teal-800">
                          {admin.designation}
                        </p>
                        <p className="text-[11px] text-slate-500">{admin.department}</p>
                        <p className="text-[10px] text-slate-400">
                          Jurisdiction: {admin.jurisdiction}
                        </p>
                      </div>

                      <div className="shrink-0 pt-1">
                        <input
                          type="radio"
                          name="adminPersona"
                          checked={isSelected}
                          onChange={() => setSelectedAdminId(admin.id)}
                          className="text-teal-700 focus:ring-teal-500"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Authorize Access &rarr; Open Surveillance Heatmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            &larr; Back to Public Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
          Loading authentication portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
