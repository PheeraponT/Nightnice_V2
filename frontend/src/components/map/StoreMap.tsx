"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { StoreListDto } from "@/lib/api";

// Fix Leaflet default icon issue with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface StoreWithCoords extends StoreListDto {
  latitude: number;
  longitude: number;
}

interface StoreMapProps {
  stores: StoreWithCoords[];
  className?: string;
  onStoreSelect?: (store: StoreWithCoords | null) => void;
  selectedStore?: StoreWithCoords | null;
}

export function StoreMap({
  stores,
  className,
  onStoreSelect,
  selectedStore,
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isMapReady, setIsMapReady] = useState(false);

  // Calculate center from stores
  const center = useMemo(() => {
    if (stores.length === 0) {
      // Default to Bangkok center
      return { lat: 13.7563, lng: 100.5018 };
    }

    const validStores = stores.filter((s) => s.latitude && s.longitude);
    if (validStores.length === 0) {
      return { lat: 13.7563, lng: 100.5018 };
    }

    const sumLat = validStores.reduce((sum, s) => sum + s.latitude, 0);
    const sumLng = validStores.reduce((sum, s) => sum + s.longitude, 0);

    return {
      lat: sumLat / validStores.length,
      lng: sumLng / validStores.length,
    };
  }, [stores]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 10,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, [center.lat, center.lng]);

  // Update markers when stores change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    const validStores = stores.filter((s) => s.latitude && s.longitude);
    const bounds: L.LatLngBounds | null =
      validStores.length > 0 ? L.latLngBounds([]) : null;

    validStores.forEach((store) => {
      const marker = L.marker([store.latitude, store.longitude], {
        icon: DefaultIcon,
      });

      // Create popup content
      const popupContent = document.createElement("div");
      popupContent.className = "store-popup";
      popupContent.innerHTML = `
        <div style="min-width: 200px; max-width: 280px;">
          <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1a1a2e;">
            ${store.name}
          </h3>
          ${store.provinceName ? `<p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">${store.provinceName}</p>` : ""}
          ${
            store.categoryNames && store.categoryNames.length > 0
              ? `<p style="font-size: 11px; color: #888; margin: 0 0 8px 0;">${store.categoryNames.join(", ")}</p>`
              : ""
          }
          <a href="/store/${store.slug}"
             style="display: inline-block; font-size: 12px; color: #ff6b6b; text-decoration: none; font-weight: 500;">
            ดูรายละเอียด →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      });

      marker.on("click", () => {
        onStoreSelect?.(store);
      });

      marker.addTo(map);
      markersRef.current.set(store.id, marker);

      if (bounds) {
        bounds.extend([store.latitude, store.longitude]);
      }
    });

    // Fit bounds if we have stores
    if (bounds && validStores.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [stores, isMapReady, onStoreSelect]);

  // Handle selected store change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !selectedStore) return;

    const marker = markersRef.current.get(selectedStore.id);
    if (marker) {
      mapInstanceRef.current.setView(
        [selectedStore.latitude, selectedStore.longitude],
        15,
        { animate: true }
      );
      marker.openPopup();
    }
  }, [selectedStore, isMapReady]);

  return (
    <div
      ref={mapRef}
      className={cn("w-full h-full min-h-[400px] rounded-xl overflow-hidden", className)}
      style={{ zIndex: 1 }}
    />
  );
}
