"use client";

import * as React from "react";

import { api } from "@/lib/api";

type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: "SYSTEM_ADMIN" | "ADMIN" | "TEACHER";
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (input: { username?: string; email?: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "msbte_rm_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (stored) {
      setToken(stored);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  React.useEffect(() => {
    async function hydrate() {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await api.get("/v2/auth/me");
        setUser(res.data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    }

    hydrate();
  }, [token]);

  async function login(input: { username?: string; email?: string; password: string }) {
    const res = await api.post("/v2/auth/login", input);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
