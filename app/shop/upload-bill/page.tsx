"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { Receipt, UploadCloud } from "lucide-react";

export default function ShopUploadBillPage() {
  return (
    <PlaceholderRoute
      titleEn="Chemist Invoice & Bill OCR"
      titleHi="थोक दवा बिल / इनवॉइस OCR अपलोड"
      routePath="/shop/upload-bill"
      descriptionEn="Zero-manual data entry: Upload wholesaler purchase invoices or daily delivery challans. Gemini AI extracts product names, batch numbers, expiry dates, quantities, and auto-syncs local pharmacy inventory."
      descriptionHi="मैन्युअल एंट्री की जरूरत नहीं: थोक डिस्ट्रीब्यूटर के बिल या पर्ची का फोटो अपलोड करें। AI दवा का नाम, बैच, एक्सपायरी और मात्रा पढ़कर स्टॉक खुद अपडेट कर देगा।"
      badge="Invoice AI OCR"
      icon={<Receipt className="w-6 h-6 text-emerald-600" />}
      suggestedActions={[
        { label: "Back to Chemist Dashboard", href: "/shop/dashboard" },
        { label: "Search Store Inventory", href: "/search" },
      ]}
    />
  );
}
