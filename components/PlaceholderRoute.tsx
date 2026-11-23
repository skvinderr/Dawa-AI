"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Construction, Clock, Sparkles, Layers, CheckCircle2 } from "lucide-react";
import { CardSkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

interface PlaceholderRouteProps {
  titleEn: string;
  titleHi: string;
  routePath: string;
  descriptionEn: string;
  descriptionHi: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  suggestedActions?: Array<{ label: string; href: string }>;
}

export function PlaceholderRoute({
  titleEn,
  titleHi,
  routePath,
  descriptionEn,
  descriptionHi,
  badge = "Phase 2 Feature Target",
  icon,
  suggestedActions = [],
}: PlaceholderRouteProps) {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"overview" | "skeleton" | "empty">("overview");

  const title = language === "hi" ? titleHi : titleEn;
  const description = language === "hi" ? descriptionHi : descriptionEn;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-health-700 hover:text-health-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "hi" ? "मुख्य पृष्ठ पर लौटें" : "Back to Home"}</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-health-50 text-health-600 flex items-center justify-center border border-health-100">
              {icon || <Construction className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-health-100 text-health-800 border border-health-200">
                  {routePath}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">{routePath}</p>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{badge}</span>
          </div>
        </div>

        {/* Tab Controls for Previewing Route Skeletons & Empty States */}
        <div className="flex items-center gap-2 pt-6 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-health-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Route Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skeleton")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "skeleton"
                ? "bg-health-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Preview Loading Skeleton
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("empty")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "empty"
                ? "bg-health-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Preview Empty State
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-health-600" />
                {language === "hi" ? "कार्यक्षेत्र एवं उद्देश्य" : "Module Purpose & Architecture"}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{description}</p>
            </div>

            {suggestedActions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {language === "hi" ? "संबंधित मॉड्यूल" : "Connected Flows"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-health-400 text-xs font-semibold text-slate-700 hover:text-health-700 transition-colors shadow-sm"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "skeleton" && (
          <div className="pt-2 space-y-4">
            <div className="text-xs text-slate-500 mb-2">
              Showing responsive loading skeleton ready for this async view:
            </div>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {activeTab === "empty" && (
          <div className="pt-2">
            <EmptyState
              title={`${titleEn} is Empty`}
              description={`No records are currently loaded for ${routePath}. This empty state ensures a friendly citizen experience.`}
              actionHref="/"
              actionText="Return to Discovery"
            />
          </div>
        )}
      </div>
    </div>
  );
}
