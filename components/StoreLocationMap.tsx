"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface StoreLocationMapProps {
  name: string;
  lat: number;
  lng: number;
  type: string;
  address: string;
}

export default function StoreLocationMap({
  name,
  lat,
  lng,
  type,
  address,
}: StoreLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const isJanAushadhi = type === "JAN_AUSHADHI";
    const isHospital = type === "HOSPITAL";

    const markerBg = isJanAushadhi
      ? "#059669" // Emerald green
      : isHospital
      ? "#7c3aed" // Violet
      : "#2563eb"; // Blue

    const markerHtml = `
      <div style="
        background-color: ${markerBg};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
      ">
        <span>${isJanAushadhi ? "जन" : isHospital ? "H" : "Rx"}</span>
      </div>
    `;

    const icon = L.divIcon({
      className: "store-location-marker",
      html: markerHtml,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    marker
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px; color: #1e293b;">
          <strong>${name}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">${address}</span>
        </div>`
      )
      .openPopup();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isMounted, lat, lng, name, type, address]);

  return (
    <div className="w-full h-48 md:h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-[1000] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:text-health-700 shadow-sm border border-slate-200"
      >
        View on Full OSM Map &rarr;
      </a>
    </div>
  );
}
