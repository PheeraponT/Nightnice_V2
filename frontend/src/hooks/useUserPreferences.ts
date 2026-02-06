"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getIdToken } from "@/lib/firebase";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";

export type UserPreferences = {
  shareLocation: boolean;
  allowMoodDigest: boolean;
  marketingUpdates: boolean;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  shareLocation: true,
  allowMoodDigest: true,
  marketingUpdates: false,
};

export function useUserPreferences() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPreferences = async () => {
      if (!user) {
        if (!cancelled) {
          setPreferences(DEFAULT_PREFERENCES);
          setIsHydrated(true);
        }
        return;
      }

      try {
        const token = await getIdToken();
        if (!token) {
          return;
        }
        const account = await api.user.getAccount(token);
        if (!cancelled && account) {
          setPreferences({
            shareLocation: account.shareLocation,
            allowMoodDigest: account.allowMoodDigest,
            marketingUpdates: account.marketingUpdates,
          });
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
        if (!cancelled) {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    if (!authLoading) {
      setIsHydrated(false);
      loadPreferences();
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const persistPreferences = useCallback(
    async (next: UserPreferences) => {
      if (!user) return;
      try {
        setIsSaving(true);
        const token = await getIdToken();
        if (!token) return;
        await api.user.updatePreferences(token, next);
      } catch (error) {
        console.error("Failed to update preferences:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        void persistPreferences(next);
        return next;
      });
    },
    [persistPreferences]
  );

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    void persistPreferences(DEFAULT_PREFERENCES);
  }, [persistPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    isHydrated,
    isSaving,
  };
}

export { DEFAULT_PREFERENCES };
