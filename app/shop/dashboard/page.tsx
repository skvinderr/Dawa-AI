"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { Store, BarChart2 } from "lucide-react";

export default function ShopDashboardPage() {
  return (
    <PlaceholderRoute
      titleEn="Pharmacist Inventory Dashboard"
      titleHi="केमिस्ट इन्वेंटरी एवं स्टॉक डैशबोर्ड"
      routePath="/shop/dashboard"
      descriptionEn="Chemist command center for Lucknow and UP pharmacies. Track stock levels, set low-stock thresholds, manage citizen reservations, and update pricing with single-click actions."
      descriptionHi="उत्तर प्रदेश के केमिस्टों के लिए नियंत्रण कक्ष। दवाओं का स्टॉक ट्रैक करें, कम स्टॉक का अलर्ट पाएं, मरीजों के रिजर्वेशन प्रबंधित करें और मूल्य अपडेट करें।"
      badge="Pharmacist Portal"
      icon={<Store className="w-6 h-6 text-health-600" />}
      suggestedActions={[
        { label: "Upload Wholesale Invoice / Bill", href: "/shop/upload-bill" },
        { label: "View Public Store Profile", href: "/store/store-1" },
        { label: "District Shortage Heatmap", href: "/admin/heatmap" },
      ]}
    />
  );
}
