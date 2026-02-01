"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
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

const SelectedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "selected-marker",
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

// Default center (Bangkok)
const DEFAULT_CENTER: L.LatLngExpression = [13.7563, 100.5018];
const DEFAULT_ZOOM = 10;

export function StoreMap({
  stores,
  className,
  onStoreSelect,
  selectedStore,
}: StoreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const isInitializedRef = useRef(false);

  // Calculate center from stores
  const center = useMemo((): L.LatLngExpression => {
    const validStores = stores.filter((s) => s.latitude && s.longitude);
    if (validStores.length === 0) return DEFAULT_CENTER;

    const sumLat = validStores.reduce((sum, s) => sum + s.latitude, 0);
    const sumLng = validStores.reduce((sum, s) => sum + s.longitude, 0);

    return [sumLat / validStores.length, sumLng / validStores.length];
  }, [stores]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || isInitializedRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Create a layer group for markers
    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;
    isInitializedRef.current = true;

    return () => {
      isInitializedRef.current = false;
      markersMapRef.current.clear();
      markersLayerRef.current = null;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when stores change
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer || !isInitializedRef.current) return;

    // Clear existing markers
    markersLayer.clearLayers();
    markersMapRef.current.clear();

    const validStores = stores.filter((s) => s.latitude && s.longitude);

    if (validStores.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds([]);

    validStores.forEach((store) => {
      if (!store.latitude || !store.longitude) return;

      const isSelected = selectedStore?.id === store.id;

      const marker = L.marker([store.latitude, store.longitude], {
        icon: isSelected ? SelectedIcon : DefaultIcon,
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 180px; max-width: 250px;">
          <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1a1a2e;">
            ${store.name}
          </h3>
          ${store.provinceName ? `<p style="font-size: 12px; color: #666; margin: 0 0 6px 0;">${store.provinceName}</p>` : ""}
          ${
            store.categoryNames && store.categoryNames.length > 0
              ? `<p style="font-size: 11px; color: #888; margin: 0 0 8px 0;">${store.categoryNames.slice(0, 2).join(", ")}</p>`
              : ""
          }
          <a href="/store/${store.slug}"
             style="display: inline-block; font-size: 12px; color: #6366f1; text-decoration: none; font-weight: 500;">
            ดูรายละเอียด →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: "custom-popup",
      });

      marker.on("click", () => {
        onStoreSelect?.(store);
      });

      markersLayer.addLayer(marker);
      markersMapRef.current.set(store.id, marker);
      bounds.extend([store.latitude, store.longitude]);
    });

    // Fit bounds with padding
    if (bounds.isValid()) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        map.setView(center, DEFAULT_ZOOM);
      }
    }
  }, [stores, selectedStore?.id, onStoreSelect, center]);

  // Handle selected store change - pan to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStore || !isInitializedRef.current) return;

    const marker = markersMapRef.current.get(selectedStore.id);
    if (marker && selectedStore.latitude && selectedStore.longitude) {
      try {
        map.setView([selectedStore.latitude, selectedStore.longitude], 15, {
          animate: true,
          duration: 0.5,
        });

        // Open popup after a short delay to ensure the view is set
        setTimeout(() => {
          if (marker && mapRef.current) {
            marker.openPopup();
          }
        }, 300);
      } catch {
        // Ignore errors during view changes
      }
    }
  }, [selectedStore]);

  return (
    <div
      ref={mapContainerRef}
      className={cn("w-full h-full min-h-[400px] overflow-hidden bg-night-lighter", className)}
      style={{ zIndex: 1 }}
    />
  );
}
