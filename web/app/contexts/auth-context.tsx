"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, users, setToken, setUnauthenticatedHandler, type User } from "@/app/lib/api";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function logout() {
    try { await auth.logout(); } catch {}
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setToken(null);
      setUser(null);
    });

    // Validate session on startup by fetching the real user from the server.
    // Attempt a silent token refresh first; if that fails, user is logged out.
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) { setLoading(false); return; }
        const { token } = await res.json();
        setToken(token);
        const me = await users.getMe();
        setUser(me);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const data = await auth.login(email, password);
    setToken(data.token);
    setUser(data.user);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
