"use client";

import { PlaceholderRoute } from "@/components/PlaceholderRoute";
import { MapPin } from "lucide-react";

export default function AdminHeatmapPage() {
  return (
    <PlaceholderRoute
      titleEn="UP District Medicine Shortage Heatmap"
      titleHi="उत्तर प्रदेश जिलावार दवा कमी हीटमैप"
      routePath="/admin/heatmap"
      descriptionEn="Geospatial surveillance powered by Leaflet and leaflet.heat across all 75 districts of Uttar Pradesh. Visualizes critical medicine stock-outs, anti-venom/rabies/antibiotic demand surges, and Jan Aushadhi accessibility index."
      descriptionHi="लीफलेट हीटमैप द्वारा उत्तर प्रदेश के सभी 75 जिलों में दवाओं की कमी का भौगोलिक नक्शा। आपातकालीन दवाओं के स्टॉक और जन औषधि केंद्रों की पहुंच का विश्लेषण।"
      badge="UP Health Department Module"
      icon={<MapPin className="w-6 h-6 text-rose-600" />}
      suggestedActions={[
        { label: "Statewide Generic Savings Impact", href: "/impact" },
        { label: "UP Health Schemes Audit", href: "/schemes" },
        { label: "Search Chemist Inventories", href: "/search" },
      ]}
    />
  );
}
