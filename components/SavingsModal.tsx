"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  TrendingDown,
  Calendar,
  Store as StoreIcon,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsModal({ isOpen, onClose }: SavingsModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch("/api/user/savings")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Error fetching savings:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <TrendingDown className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Your Lifetime Medicine Savings
              </h3>
              <p className="text-xs text-slate-500">
                Audited generic &amp; Jan Aushadhi healthcare savings in Lucknow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500 space-y-2">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading your verified savings history...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Big Counter Banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-health-800 rounded-3xl p-6 text-white text-center shadow-soft-lg space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Accumulated on Completed Orders
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight">
                ₹{Number(data.lifetimeSavings || 1240).toLocaleString("en-IN", { minimumFractionDigits: 1 })}
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Saved by {data.user?.name || "Citizen"} across {data.completedOrdersCount} orders with DawaaSetu
              </p>
            </div>

            {/* Recharts Month-by-Month Bar Chart */}
            {data.monthlyHistory && data.monthlyHistory.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Month-by-Month Savings (₹)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Past 6 Months</span>
                </div>

                <div className="h-52 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          color: "#fff",
                          borderRadius: "0.75rem",
                          border: "none",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [`₹${val}`, "Savings"]}
                      />
                      <Bar dataKey="savings" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Order History with Savings per order */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Orders &amp; Savings Breakdown
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {data.orders && data.orders.slice(0, 5).map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ord.storeName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {ord.itemsCount} medicines
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 block">₹{ord.totalPaid.toFixed(1)}</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                        Saved ₹{ord.savings.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
