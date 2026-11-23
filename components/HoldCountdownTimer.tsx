"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface HoldCountdownTimerProps {
  expiresAt: string | null;
  status: string;
}

export function HoldCountdownTimer({ expiresAt, status }: HoldCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTime = () => {
      const targetTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const intervalId = setInterval(calculateTime, 1000);

    return () => clearInterval(intervalId);
  }, [expiresAt]);

  if (!expiresAt) return null;

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
        ✓ Fulfilled &amp; Completed
      </span>
    );
  }

  if (status === "CANCELLED" || timeLeft?.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5" /> Hold Expired / Cancelled
      </span>
    );
  }

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
      <span>
        Hold: {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)} left
      </span>
    </div>
  );
}

export default HoldCountdownTimer;
