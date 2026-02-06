"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

const FAVORITES_KEY = "nightnice_favorites";
const FAVORITES_EVENT = "favorites-changed";

function normalizeId(storeId: string): string {
  return storeId.trim().toLowerCase();
}

function getFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as string[];
    return Array.isArray(parsed) ? parsed.map(normalizeId) : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(favorites: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: favorites }));
  } catch (error) {
    console.error("Failed to persist favorites:", error);
  }
}

async function fetchServerFavorites(): Promise<string[]> {
  const token = await getIdToken();
  if (!token) return [];
  const result = await api.user.getFavorites(token);
  const ids = result.storeIds.map(normalizeId);
  saveFavoritesToStorage(ids);
  return ids;
}

async function addServerFavorite(storeId: string) {
  const token = await getIdToken();
  if (!token) return [];
  const updated = await api.user.addFavorite(token, storeId);
  const ids = updated.storeIds.map(normalizeId);
  saveFavoritesToStorage(ids);
  return ids;
}

async function removeServerFavorite(storeId: string) {
  const token = await getIdToken();
  if (!token) return [];
  const updated = await api.user.removeFavorite(token, storeId);
  const ids = updated.storeIds.map(normalizeId);
  saveFavoritesToStorage(ids);
  return ids;
}

async function clearServerFavorites() {
  const token = await getIdToken();
  if (!token) return [];
  await api.user.clearFavorites(token);
  saveFavoritesToStorage([]);
  return [];
}

export function useFavorites() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = getFavoritesFromStorage();
    setFavorites(stored);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === FAVORITES_KEY) {
        const value = event.newValue ? JSON.parse(event.newValue) : [];
        setFavorites(Array.isArray(value) ? value : []);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const custom = event as CustomEvent<string[]>;
      if (Array.isArray(custom.detail)) {
        setFavorites(custom.detail);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(FAVORITES_EVENT, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(FAVORITES_EVENT, handleCustomEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (authLoading) return;
      setIsHydrated(false);

      if (!user) {
        if (!cancelled) {
          setFavorites(getFavoritesFromStorage());
          setIsHydrated(true);
        }
        return;
      }

      try {
        const serverFavorites = await fetchServerFavorites();
        if (serverFavorites.length === 0) {
          const localOnly = getFavoritesFromStorage();
          if (localOnly.length > 0) {
            for (const storeId of localOnly) {
              try {
                await addServerFavorite(storeId);
              } catch (error) {
                console.error("Failed to sync favorite:", error);
              }
            }
          }
        }
        if (!cancelled) {
          const synced = await fetchServerFavorites();
          setFavorites(synced);
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
        if (!cancelled) {
          setFavorites(getFavoritesFromStorage());
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const addFavorite = useCallback(
    (storeId: string) => {
      const normalized = normalizeId(storeId);
      if (!normalized) return;

      if (user) {
        void addServerFavorite(normalized)
          .then((ids) => setFavorites(ids))
          .catch((error) => console.error("Failed to add favorite:", error));
      } else {
        setFavorites((prev) => {
          if (prev.includes(normalized)) return prev;
          const updated = [...prev, normalized];
          saveFavoritesToStorage(updated);
          return updated;
        });
      }
    },
    [user]
  );

  const removeFavorite = useCallback(
    (storeId: string) => {
      const normalized = normalizeId(storeId);
      if (!normalized) return;

      if (user) {
        void removeServerFavorite(normalized)
          .then((ids) => setFavorites(ids))
          .catch((error) => console.error("Failed to remove favorite:", error));
      } else {
        setFavorites((prev) => {
          const updated = prev.filter((id) => id !== normalized);
          saveFavoritesToStorage(updated);
          return updated;
        });
      }
    },
    [user]
  );

  const toggleFavorite = useCallback(
    (storeId: string) => {
      const normalized = normalizeId(storeId);
      if (favorites.includes(normalized)) {
        removeFavorite(storeId);
      } else {
        addFavorite(storeId);
      }
    },
    [addFavorite, favorites, removeFavorite]
  );

  const clearAll = useCallback(() => {
    if (user) {
      void clearServerFavorites()
        .then((ids) => setFavorites(ids))
        .catch((error) => console.error("Failed to clear favorites:", error));
    } else {
      saveFavoritesToStorage([]);
      setFavorites([]);
    }
  }, [user]);

  const isFavorite = useCallback(
    (storeId: string) => favorites.includes(normalizeId(storeId)),
    [favorites]
  );

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

export function useIsFavorite(storeId: string) {
  const { favorites, toggleFavorite } = useFavorites();
  const normalized = normalizeId(storeId);

  return {
    isFavorite: favorites.includes(normalized),
    toggle: () => toggleFavorite(storeId),
  };
}
