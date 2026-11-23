"use client";

import React from "react";
import { useTranslation, UserRole } from "@/lib/i18n";
import { User, Store, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RoleSwitcher() {
  const { role, setRole, dict } = useTranslation();
  const router = useRouter();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "citizen") {
      router.push("/");
    } else if (newRole === "shopkeeper") {
      router.push("/shop/dashboard");
    } else if (newRole === "admin") {
      router.push("/admin/heatmap");
    }
  };

  return (
    <div className="relative inline-flex items-center rounded-2xl bg-health-50/80 p-1 border border-health-200 shadow-sm">
      <button
        type="button"
        onClick={() => handleRoleChange("citizen")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
          role === "citizen"
            ? "bg-health-600 text-white shadow-md font-semibold"
            : "text-slate-600 hover:text-health-800 hover:bg-health-100/60"
        }`}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">{dict.roles.citizen}</span>
        <span className="sm:hidden">Citizen</span>
      </button>

      <button
        type="button"
        onClick={() => handleRoleChange("shopkeeper")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
          role === "shopkeeper"
            ? "bg-health-600 text-white shadow-md font-semibold"
            : "text-slate-600 hover:text-health-800 hover:bg-health-100/60"
        }`}
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline">{dict.roles.shopkeeper}</span>
        <span className="sm:hidden">Shop</span>
      </button>

      <button
        type="button"
        onClick={() => handleRoleChange("admin")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
          role === "admin"
            ? "bg-health-600 text-white shadow-md font-semibold"
            : "text-slate-600 hover:text-health-800 hover:bg-health-100/60"
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="hidden sm:inline">{dict.roles.admin}</span>
        <span className="sm:hidden">Admin</span>
      </button>
    </div>
  );
}
