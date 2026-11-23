"use client";

import React from "react";
import { Clock, CheckCircle2, Package, Award, AlertCircle } from "lucide-react";

interface OrderStatusStepperProps {
  status: string;
  mode?: string;
}

export function OrderStatusStepper({ status, mode = "PICKUP" }: OrderStatusStepperProps) {
  const isCancelled = status === "CANCELLED";

  const steps = [
    {
      key: "HOLD_REQUESTED",
      title: "Hold Requested",
      subtitle: "2-hour counter reservation",
      icon: Clock,
    },
    {
      key: "CONFIRMED",
      title: "Chemist Confirmed",
      subtitle: "Stock locked & verified",
      icon: CheckCircle2,
    },
    {
      key: "READY",
      title: mode === "DELIVERY" ? "Out for Delivery" : "Ready for Pickup",
      subtitle: mode === "DELIVERY" ? "Local express dispatch" : "Packed at counter",
      icon: Package,
    },
    {
      key: "COMPLETED",
      title: "Completed",
      subtitle: "Savings accumulated",
      icon: Award,
    },
  ];

  // Determine current active step index
  const getStepIndex = (st: string) => {
    switch (st) {
      case "HOLD_REQUESTED":
        return 0;
      case "CONFIRMED":
        return 1;
      case "READY":
        return 2;
      case "COMPLETED":
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">Hold Cancelled / Rejected</span>
          <span className="block text-[11px] text-rose-600">
            Reserved stock has been restored to pharmacy inventory.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-4 gap-1 relative">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isCurrent
                    ? "bg-health-700 text-white ring-4 ring-health-100 shadow-sm animate-pulse"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>

              <div className="mt-1.5 px-0.5">
                <p
                  className={`text-[11px] font-bold leading-tight ${
                    isDone || isCurrent ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderStatusStepper;
