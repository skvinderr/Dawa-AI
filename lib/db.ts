import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

export const prisma = db;

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

// Strongly-typed constants matching SQLite strings
export const StoreType = {
  PRIVATE: "PRIVATE",
  JAN_AUSHADHI: "JAN_AUSHADHI",
  HOSPITAL: "HOSPITAL",
} as const;
export type StoreType = (typeof StoreType)[keyof typeof StoreType];

export const OrderStatus = {
  HOLD_REQUESTED: "HOLD_REQUESTED",
  CONFIRMED: "CONFIRMED",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderMode = {
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
} as const;
export type OrderMode = (typeof OrderMode)[keyof typeof OrderMode];

/**
 * Helper to compute isOpenNow from store openHours string (e.g. "08:00 AM - 10:00 PM" or "24 Hours Open")
 */
export function isStoreOpenNow(openHours: string, date: Date = new Date()): boolean {
  if (!openHours) return true;
  const lower = openHours.toLowerCase();
  if (lower.includes("24 hour") || lower.includes("24x7") || lower.includes("24 hours")) {
    return true;
  }

  // Expecting format like "08:00 AM - 10:00 PM"
  const parts = openHours.split("-").map((s) => s.trim());
  if (parts.length !== 2) return true;

  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3].toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const startMinutes = parseTime(parts[0]);
  const endMinutes = parseTime(parts[1]);
  if (startMinutes === null || endMinutes === null) return true;

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  if (endMinutes >= startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight hours (e.g. 8 PM to 2 AM)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
