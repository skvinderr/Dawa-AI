"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { ClipboardList } from "lucide-react";

export default function OrdersPage() {
  return (
    <PlaceholderRoute
      titleEn="Citizen Medicine Reserves & Orders"
      titleHi="नागरिक दवा बुकिंग एवं रिजर्वेशन"
      routePath="/orders"
      descriptionEn="Citizens can place a 2-hour hold or reserve essential medicines at verified nearby pharmacies to prevent stock-outs before they travel to the counter."
      descriptionHi="नागरिक अपनी जरूरत की दवा नजदीकी मेडिकल स्टोर पर 2 घंटे के लिए सुरक्षित (रिजर्व) रखवा सकते हैं ताकि दुकान पहुंचने से पहले दवा खत्म न हो।"
      badge="Citizen Cart & Reserve"
      icon={<ClipboardList className="w-6 h-6 text-amber-600" />}
      suggestedActions={[
        { label: "Find Medicines to Reserve", href: "/search" },
        { label: "Scan New Prescription", href: "/prescription" },
      ]}
    />
  );
}
