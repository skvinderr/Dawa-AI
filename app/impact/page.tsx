"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function ImpactPage() {
  return (
    <PlaceholderRoute
      titleEn="Citizen Savings & Generic Impact Analytics"
      titleHi="नागरिक बचत एवं जेनेरिक दवा प्रभाव विश्लेषण"
      routePath="/impact"
      descriptionEn="Interactive Recharts dashboard modeling out-of-pocket healthcare expense reduction across Uttar Pradesh through Jan Aushadhi generic substitution and Ayushman Bharat utilization."
      descriptionHi="उत्तर प्रदेश में जन औषधि जेनेरिक दवाओं के प्रयोग से आम जनता की जेब से होने वाले खर्च में कमी का लाइव डेटा और चार्ट।"
      badge="Recharts Health Analytics"
      icon={<BarChart3 className="w-6 h-6 text-teal-600" />}
      suggestedActions={[
        { label: "District Shortage Heatmap", href: "/admin/heatmap" },
        { label: "Find Cheaper Medicines", href: "/search" },
        { label: "UP Govt Health Schemes", href: "/schemes" },
      ]}
    />
  );
}
