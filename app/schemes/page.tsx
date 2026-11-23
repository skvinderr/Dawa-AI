"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { ShieldAlert } from "lucide-react";

export default function SchemesPage() {
  return (
    <PlaceholderRoute
      titleEn="UP & National Healthcare Schemes"
      titleHi="उत्तर प्रदेश एवं राष्ट्रीय स्वास्थ्य योजनाएं"
      routePath="/schemes"
      descriptionEn="Comprehensive directory of public healthcare subsidies including Ayushman Bharat PM-JAY (₹5 Lakh cover), UP Mukhyamantri Jan Arogya Yojana, PM Jan Aushadhi, and Nikshay TB Nutrition support."
      descriptionHi="उत्तर प्रदेश के नागरिकों के लिए सरकारी स्वास्थ्य योजनाओं की जानकारी: आयुष्मान भारत (₹5 लाख तक कैशलेस इलाज), यूपी मुख्यमंत्री जन आरोग्य योजना, जन औषधि केंद्र, एवं निक्षय योजना।"
      badge="Government Subsidy Explorer"
      icon={<ShieldAlert className="w-6 h-6 text-teal-600" />}
      suggestedActions={[
        { label: "Search Subsidised Medicines", href: "/search" },
        { label: "State Savings Analytics", href: "/impact" },
      ]}
    />
  );
}
