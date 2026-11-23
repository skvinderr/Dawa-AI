"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <PlaceholderRoute
      titleEn="Medicine Discovery & Stock"
      titleHi="दवा खोज एवं लाइव स्टॉक"
      routePath="/search"
      descriptionEn="Search across 500+ Uttar Pradesh pharmacies by medicine brand or generic active salt. View store distance, live stock quantity, unit prices, and certified Jan Aushadhi substitute comparisons."
      descriptionHi="उत्तर प्रदेश के 500+ मेडिकल स्टोर्स में दवा के ब्रांड या जेनेरिक साल्ट नाम से खोजें। नजदीकी दुकान की दूरी, लाइव स्टॉक, कीमत और जन औषधि विकल्प देखें।"
      badge="Citizen Discovery Module"
      icon={<Search className="w-6 h-6 text-health-600" />}
      suggestedActions={[
        { label: "Scan Prescription", href: "/prescription" },
        { label: "View Jan Aushadhi Kendra Hazratganj", href: "/store/store-1" },
        { label: "UP Health Schemes", href: "/schemes" },
      ]}
    />
  );
}
