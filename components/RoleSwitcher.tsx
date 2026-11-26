"use client";

import React from "react";
import { useTranslation, UserRole } from "@/lib/i18n";
import { User, Store, ShieldCheck, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const roles: {
  id: UserRole;
  en: string;
  hi: string;
  compact: string;
  icon: LucideIcon;
  route: string;
}[] = [
    { id: "citizen", en: "Citizen", hi: "नागरिक", compact: "Citizen", icon: User, route: "/citizen" },
    { id: "shopkeeper", en: "Chemist", hi: "केमिस्ट", compact: "Chemist", icon: Store, route: "/shop/dashboard" },
    { id: "admin", en: "Health Dept", hi: "स्वास्थ्य", compact: "Health", icon: ShieldCheck, route: "/admin/heatmap" },
  ];

export function RoleSwitcher() {
  const { role, setRole, language } = useTranslation();
  const router = useRouter();
  const hi = language === "hi";

  const changeRole = (newRole: UserRole, route: string) => {
    if (newRole === role) return;
    setRole(newRole);
    router.push(route);
  };

  return (
    <div
      role="group"
      aria-label={hi ? "पोर्टल बदलें" : "Switch workspace"}
      className="inline-flex w-fit max-w-full items-center gap-0.5 rounded-full border border-[#e8e0ed] bg-[#f4f1f7] p-1 shadow-inner shadow-violet-950/[.025]"
    >
      {roles.map(({ id, en, hi: hindi, compact, icon: Icon, route }) => {
        const selected = role === id;
        const label = hi ? hindi : en;
        const description = id === "citizen"
          ? (hi ? "नागरिक पोर्टल पर जाएं" : "Switch to Citizen Discovery")
          : id === "shopkeeper"
            ? (hi ? "फार्मेसी पोर्टल पर जाएं" : "Switch to Chemist Portal")
            : (hi ? "स्वास्थ्य विभाग पोर्टल पर जाएं" : "Switch to Health Department");

        return (
          <button
            key={id}
            type="button"
            onClick={() => changeRole(id, route)}
            aria-pressed={selected}
            aria-label={`${description}${selected ? (hi ? " (वर्तमान)" : " (current)") : ""}`}
            title={description}
            className={`group inline-flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-full px-2.5 text-[10px] font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e52a91] focus-visible:ring-offset-2 sm:px-3 sm:text-[11px] ${selected
                ? "bg-[#25103f] text-white shadow-[0_4px_12px_-5px_rgba(37,16,63,.65)]"
                : "text-slate-500 hover:bg-white hover:text-[#8f2869]"
              }`}
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${selected ? "text-[#ff91ca]" : "text-slate-400 group-hover:text-[#de3294]"}`} aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{hi ? hindi : compact}</span>
          </button>
        );
      })}
    </div>
  );
}

export default RoleSwitcher;