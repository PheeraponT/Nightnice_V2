"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api, type AdminUserDto } from "@/lib/api";

// T119: Auth context and useAuth hook

interface AuthState {
  user: AdminUserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = "nightnice_auth";

interface StoredAuth {
  user: AdminUserDto;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
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
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize from storage on mount
  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setState({
        user: storedAuth.user,
        accessToken: storedAuth.accessToken,
        refreshToken: storedAuth.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

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
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
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
      isAuthenticated: false,
      isLoading: false,
    });
  }, [state.refreshToken]);

  const getToken = useCallback(() => {
    return state.accessToken;
  }, [state.accessToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        getToken,
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
