"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { Store } from "lucide-react";
import { useParams } from "next/navigation";

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = (params?.id as string) || "store-1";

  return (
    <PlaceholderRoute
      titleEn={`Pharmacy Profile & Stock (${storeId})`}
      titleHi={`मेडिकल स्टोर विवरण एवं लाइव स्टॉक (${storeId})`}
      routePath={`/store/${storeId}`}
      descriptionEn={`Detailed view for pharmacy ${storeId} in Uttar Pradesh. Displays address, contact numbers, Leaflet map location, working hours, license credentials, and full real-time medicine inventory.`}
      descriptionHi={`उत्तर प्रदेश के मेडिकल स्टोर (${storeId}) का संपूर्ण विवरण। पता, फोन नंबर, लीफलेट मैप लोकेशन, खुलने का समय और दवाओं का लाइव स्टॉक।`}
      badge="Pharmacy Inventory View"
      icon={<Store className="w-6 h-6 text-blue-600" />}
      suggestedActions={[
        { label: "Find Another Pharmacy", href: "/search" },
        { label: "Reserve Medicines", href: "/orders" },
        { label: "Health Shortage Heatmap", href: "/admin/heatmap" },
      ]}
    />
  );
}
