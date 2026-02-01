"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, ApiError, type AdminUserDto } from "@/lib/api";

// T119: Auth context and useAuth hook

interface AuthState {
  user: AdminUserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: (message?: string) => Promise<void>;
  getToken: () => string | null;
  handleApiError: (error: unknown) => void;
  getTimeRemaining: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = "nightnice_auth";

interface StoredAuth {
  user: AdminUserDto;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Toast notification state (simple implementation without context dependency)
let toastCallback: ((message: string, type: "success" | "error" | "info" | "warning") => void) | null = null;

export function setAuthToastCallback(callback: typeof toastCallback) {
  toastCallback = callback;
}

function showAuthToast(message: string, type: "error" | "warning" = "error") {
  if (toastCallback) {
    toastCallback(message, type);
  }
}

function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const auth = JSON.parse(stored) as StoredAuth;

    // Check if token is expired
    if (new Date(auth.expiresAt) < new Date()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return auth;
  } catch {
    return null;
  }
}

function setStoredAuth(auth: StoredAuth | null): void {
  if (typeof window === "undefined") return;

  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const logoutRef = useRef<((message?: string) => Promise<void>) | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setState({
        user: storedAuth.user,
        accessToken: storedAuth.accessToken,
        refreshToken: storedAuth.refreshToken,
        expiresAt: new Date(storedAuth.expiresAt),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Check for token expiration periodically
  useEffect(() => {
    if (!state.expiresAt || !state.isAuthenticated) return;

    const checkExpiration = () => {
      const now = new Date();
      const expiresAt = state.expiresAt!;
      const timeRemaining = expiresAt.getTime() - now.getTime();

      // If expired, logout
      if (timeRemaining <= 0) {
        logoutRef.current?.("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      // Warning 5 minutes before expiration
      if (timeRemaining <= 5 * 60 * 1000 && timeRemaining > 4.9 * 60 * 1000) {
        showAuthToast("Session จะหมดอายุใน 5 นาที", "warning");
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30 * 1000);

    return () => clearInterval(interval);
  }, [state.expiresAt, state.isAuthenticated]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.admin.login({ username, password });

    const authData: StoredAuth = {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    };

    setStoredAuth(authData);

    setState({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: new Date(response.expiresAt),
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async (message?: string) => {
    if (state.refreshToken) {
      try {
        await api.admin.logout(state.refreshToken);
      } catch {
        // Ignore logout errors
      }
    }

    setStoredAuth(null);

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Show toast if message provided
    if (message) {
      showAuthToast(message, "warning");
    }

    // Redirect to login if not already there
    if (pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [state.refreshToken, pathname, router]);

  // Store logout ref for use in expiration check
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const getToken = useCallback(() => {
    return state.accessToken;
  }, [state.accessToken]);

  // Handle API errors - specifically 401 Unauthorized
  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        logout("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        return;
      }
      // Show toast for other API errors
      showAuthToast(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", "error");
    } else if (error instanceof Error) {
      showAuthToast(error.message || "เกิดข้อผิดพลาด", "error");
    }
  }, [logout]);

  // Get time remaining as formatted string
  const getTimeRemaining = useCallback(() => {
    if (!state.expiresAt) return null;

    const now = new Date();
    const diff = state.expiresAt.getTime() - now.getTime();

    if (diff <= 0) return "หมดอายุแล้ว";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  }, [state.expiresAt]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        getToken,
        handleApiError,
        getTimeRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
