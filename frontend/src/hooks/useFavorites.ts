"use client";

import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "nightnice_favorites";

// Get favorites from localStorage
function getFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save favorites to localStorage
function saveFavoritesToStorage(favorites: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent("favorites-changed", { detail: favorites }));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
}

/**
 * Hook for managing favorite stores with localStorage and cross-tab sync
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load favorites from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = getFavoritesFromStorage();
    setFavorites(stored);
    setIsHydrated(true);
  }, []);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        const newFavorites = e.newValue ? JSON.parse(e.newValue) : [];
        setFavorites(newFavorites);
      }
    };

    const handleCustomEvent = (e: CustomEvent<string[]>) => {
      setFavorites(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("favorites-changed", handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorites-changed", handleCustomEvent as EventListener);
    };
  }, []);

  const addFavorite = useCallback((storeId: string) => {
    const current = getFavoritesFromStorage();
    if (!current.includes(storeId)) {
      const updated = [...current, storeId];
      saveFavoritesToStorage(updated);
      setFavorites(updated);
    }
  }, []);

  const removeFavorite = useCallback((storeId: string) => {
    const current = getFavoritesFromStorage();
    const updated = current.filter((id) => id !== storeId);
    saveFavoritesToStorage(updated);
    setFavorites(updated);
  }, []);

  const toggleFavorite = useCallback((storeId: string) => {
    const current = getFavoritesFromStorage();
    let updated: string[];
    if (current.includes(storeId)) {
      updated = current.filter((id) => id !== storeId);
    } else {
      updated = [...current, storeId];
    }
    saveFavoritesToStorage(updated);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback(
    (storeId: string) => {
      return favorites.includes(storeId);
    },
    [favorites]
  );

  const clearAll = useCallback(() => {
    saveFavoritesToStorage([]);
    setFavorites([]);
  }, []);

  return {
    favorites,
    favoriteCount: favorites.length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAll,
    isHydrated,
  };
}

/**
 * Hook for checking if a specific store is favorited
 * More efficient for single store checks (e.g., in StoreCard)
 */
export function useIsFavorite(storeId: string) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return {
    isFavorite: isFavorite(storeId),
    toggle: () => toggleFavorite(storeId),
  };
}
