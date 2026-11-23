"use client";

import React from "react";
import { useTranslation, UserRole } from "@/lib/i18n";
import { User, Store, ShieldCheck, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RoleSwitcher() {
  const { role, setRole, dict } = useTranslation();
  const router = useRouter();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "citizen") {
      router.push("/citizen");
    } else if (newRole === "shopkeeper") {
      router.push("/shop/dashboard");
    } else if (newRole === "admin") {
      router.push("/admin/heatmap");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center rounded-2xl bg-health-50/80 p-1 border border-health-200 shadow-sm">
        <button
          type="button"
          onClick={() => handleRoleChange("citizen")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            role === "citizen"
              ? "bg-health-700 text-white shadow-sm font-semibold"
              : "text-slate-600 hover:text-health-800 hover:bg-health-100/60"
          }`}
          title="Switch to Citizen Discovery Portal"
        >
          <User className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Citizen</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("shopkeeper")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            role === "shopkeeper"
              ? "bg-emerald-700 text-white shadow-sm font-semibold"
              : "text-slate-600 hover:text-health-800 hover:bg-health-100/60"
          }`}
          title="Switch to Chemist & Pharmacist Portal"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chemist</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("admin")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            role === "admin"
              ? "bg-teal-800 text-white shadow-sm font-semibold"
              : "text-slate-600 hover:text-health-800 hover:bg-health-100/60"
          }`}
          title="Switch to UP Health Department Surveillance"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Health Dept</span>
        </button>
      </div>

      <Link
        href="/login"
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-health-800 hover:bg-health-50 border border-slate-200 hover:border-health-300 transition-colors"
        title="Choose specific citizen persona or pharmacy"
      >
        <LogIn className="w-3.5 h-3.5 text-health-600" />
        <span>Login</span>
      </Link>
    </div>
  );
}

export default RoleSwitcher;
