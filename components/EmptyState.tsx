import React from "react";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionText?: string;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search terms, check the spelling, or upload a prescription for AI discovery.",
  icon,
  actionHref,
  actionText,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-100 shadow-soft max-w-lg mx-auto">
      <div className="w-14 h-14 bg-health-50 rounded-2xl flex items-center justify-center text-health-600 mx-auto mb-4 border border-health-100 shadow-inner">
        {icon || <HelpCircle className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{description}</p>
      {actionHref && actionText && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-health-600 hover:bg-health-700 text-white font-medium text-sm transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
