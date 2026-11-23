"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface StorePin {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  openHours: string;
  totalSkus: number;
  outOfStockCount: number;
  lowStockCount: number;
}

interface AreaStat {
  area: string;
  lat: number;
  lng: number;
  totalSearches: number;
  surgePercent: number;
  riskLevel: "CRITICAL_SURGE" | "ELEVATED" | "NORMAL";
  storesCount: number;
  janAushadhiCount: number;
  topQueries: { name: string; count: number }[];
  recommendation: string;
}

interface HeatmapMapProps {
  areas: AreaStat[];
  stores: StorePin[];
  heatmapPoints: [number, number, number][];
  selectedArea: string | null;
  onSelectArea: (area: string) => void;
  filterMode: "ALL" | "HEATMAP" | "STORES";
}

export default function HeatmapMap({
  areas,
  stores,
  heatmapPoints,
  selectedArea,
  onSelectArea,
  filterMode,
}: HeatmapMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Lucknow
    const map = L.map(mapContainerRef.current, {
      center: [26.8467, 80.9462],
      zoom: 12,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    // OpenStreetMap standard tiles (Zero API Key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Attribution
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('&copy; OpenStreetMap | DawaaSetu UP Health')
      .addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isMounted]);

  // Update layers when areas, stores, or filterMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // 1. Try to render leaflet.heat layer if mode includes HEATMAP
    if ((filterMode === "ALL" || filterMode === "HEATMAP") && typeof window !== "undefined") {
      try {
        // dynamically require leaflet.heat if not already attached
        // eslint-disable-next-line
        require("leaflet.heat");
        if ((L as any).heatLayer && heatmapPoints.length > 0) {
          const heat = (L as any).heatLayer(
            heatmapPoints.map(([lat, lng, val]) => [lat, lng, val * 35]),
            {
              radius: 35,
              blur: 25,
              maxZoom: 15,
              gradient: {
                0.2: "#0d9488",
                0.4: "#eab308",
                0.7: "#f97316",
                1.0: "#dc2626",
              },
            }
          );
          heat.addTo(map);
          heatLayerRef.current = heat;
        }
      } catch (err) {
        console.warn("leaflet.heat dynamic layer fallback:", err);
      }
    }

    // 2. Render Outbreak / Surge Area Circles
    if (filterMode === "ALL" || filterMode === "HEATMAP") {
      areas.forEach((area) => {
        const isCritical = area.riskLevel === "CRITICAL_SURGE";
        const isElevated = area.riskLevel === "ELEVATED";

        const fillColor = isCritical
          ? "#ef4444" // red
          : isElevated
          ? "#f59e0b" // amber
          : "#14b8a6"; // teal

        const radius = isCritical ? 1400 : isElevated ? 1000 : 700;

        // Visual surge circle
        const circle = L.circle([area.lat, area.lng], {
          color: fillColor,
          fillColor,
          fillOpacity: isCritical ? 0.35 : 0.22,
          weight: isCritical ? 3 : 1.5,
          radius,
        });

        const topMedNames = area.topQueries.map((t) => `${t.name} (${t.count})`).join(", ");

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; min-width: 200px; color: #1e293b;">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
              <span>${area.area}</span>
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; background: ${
                isCritical ? "#fee2e2; color: #991b1b;" : isElevated ? "#fef3c7; color: #92400e;" : "#ccfbf1; color: #115e59;"
              }">
                ${isCritical ? "CRITICAL OUTBREAK" : isElevated ? "SURGE ALERT" : "STABLE"}
              </span>
            </div>
            <p style="margin: 2px 0; color: #475569;">
              <strong>Search Volume:</strong> ${area.totalSearches} queries 
              <span style="color: ${area.surgePercent > 0 ? "#dc2626" : "#16a34a"}; font-weight: 600;">
                (${area.surgePercent > 0 ? "+" : ""}${area.surgePercent}% vs baseline)
              </span>
            </p>
            <p style="margin: 2px 0; color: #475569;">
              <strong>Top Medicines:</strong> ${topMedNames || "General"}
            </p>
            <p style="margin: 2px 0; color: #475569;">
              <strong>Jan Aushadhi Coverage:</strong> ${area.janAushadhiCount} / ${area.storesCount} stores
            </p>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #0f766e; font-weight: 600;">
              ⚡ ${area.recommendation}
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        circle.on("click", () => {
          onSelectArea(area.area);
        });

        circle.addTo(layersGroup);
      });
    }

    // 3. Render Pharmacy Markers
    if (filterMode === "ALL" || filterMode === "STORES") {
      stores.forEach((store) => {
        const isJanAushadhi = store.type === "JAN_AUSHADHI";
        const isHospital = store.type === "HOSPITAL";
        const hasStockout = store.outOfStockCount > 0;

        // Custom HTML marker for clean styling without external images
        const markerBg = isJanAushadhi
          ? "#059669" // Emerald green
          : isHospital
          ? "#7c3aed" // Violet
          : "#2563eb"; // Blue

        const markerHtml = `
          <div style="
            position: relative;
            background-color: ${markerBg};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
          ">
            <span>${isJanAushadhi ? "जन" : isHospital ? "H" : "Rx"}</span>
            ${
              hasStockout
                ? `<span style="
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 10px;
                    height: 10px;
                    background-color: #ef4444;
                    border: 1.5px solid #ffffff;
                    border-radius: 50%;
                  "></span>`
                : ""
            }
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-leaflet-marker",
          html: markerHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([store.lat, store.lng], { icon });

        const popupContent = `
          <div style="font-family: inherit; font-size: 13px; min-width: 220px; color: #1e293b;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #0f172a;">
              ${store.name}
            </div>
            <div style="font-size: 11px; margin-bottom: 6px;">
              <span style="display: inline-block; padding: 1px 6px; border-radius: 4px; font-weight: 600; background: ${
                isJanAushadhi ? "#d1fae5; color: #065f46;" : isHospital ? "#ede9fe; color: #5b21b6;" : "#dbeafe; color: #1e40af;"
              }">
                ${isJanAushadhi ? "PM Jan Aushadhi Kendra" : isHospital ? "Hospital Pharmacy" : "Private Chemist"}
              </span>
            </div>
            <p style="margin: 2px 0; color: #64748b; font-size: 12px;">📍 ${store.address}, ${store.area}</p>
            <p style="margin: 2px 0; color: #64748b; font-size: 12px;">🕒 ${store.openHours}</p>
            <p style="margin: 2px 0; color: #64748b; font-size: 12px;">📞 ${store.phone}</p>
            
            <div style="margin: 6px 0; padding: 4px 6px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 11px;">
              <span style="color: #059669; font-weight: 600;">In Stock: ${store.totalSkus - store.outOfStockCount}</span> | 
              <span style="color: ${store.outOfStockCount > 0 ? "#dc2626" : "#64748b"}; font-weight: 600;">
                Stockouts: ${store.outOfStockCount}
              </span>
            </div>

            <div style="margin-top: 8px; text-align: center;">
              <a href="/store/${store.id}" style="
                display: block;
                padding: 6px 12px;
                background-color: #0d9488;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
              ">
                View Live Inventory &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(layersGroup);
      });
    }

    // Pan to selected area if user clicks one from the sidebar
    if (selectedArea) {
      const match = areas.find((a) => a.area.toLowerCase() === selectedArea.toLowerCase());
      if (match) {
        map.setView([match.lat, match.lng], 14, { animate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas, stores, heatmapPoints, selectedArea, filterMode]);

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden border border-health-200 shadow-sm bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 max-w-[240px]">
        <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shrink-0" />
          <span className="text-slate-700">Jan Aushadhi (जन औषधि)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shrink-0" />
          <span className="text-slate-700">Private Pharmacy (प्राइवेट)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-white shrink-0" />
          <span className="text-slate-700">Hospital Pharmacy (अस्पताल)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500/40 border border-red-500 shrink-0" />
          <span className="text-slate-700">Outbreak Surge (&gt;+80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
          <span className="text-slate-600">Stockout Warning Alert</span>
        </div>
      </div>
    </div>
  );
}
