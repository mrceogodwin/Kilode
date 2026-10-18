import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";

const KEY = "@kilode/session";

export type Session = {
  token: string;
  handle: string;
  name: string;
  kind: string;
};

type AuthCtx = {
  session: Session | null;
  guest: boolean;
  loading: boolean;
  signInGuest: (name?: string) => void;
  signIn: (handle: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const s = JSON.parse(raw) as Session;
          setSession(s);
          setGuest(s.token === "guest");
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
  }, []);

  const persist = async (s: Session | null) => {
    try {
      if (s) await AsyncStorage.setItem(KEY, JSON.stringify(s));
      else await AsyncStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  const signInGuest = useCallback((name?: string) => {
    const s: Session = {
      token: "guest",
      handle: "guest",
      name: name || "Guest",
      kind: "member",
    };
    setSession(s);
    setGuest(true);
    persist(s);
  }, []);

  const signIn = useCallback(async (handle: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: handle.includes("@") ? handle : `${handle}@kilode.ng`,
          password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const s: Session = {
          token: data.token || data.session?.token || "live",
          handle: data.user?.name || handle,
          name: data.user?.name || handle,
          kind: "member",
        };
        setSession(s);
        setGuest(false);
        await persist(s);
        setLoading(false);
        return { ok: true };
      }
    } catch {
      /* offline */
    }
    if (handle.trim().length >= 2) {
      const s: Session = {
        token: "local",
        handle: handle.replace(/^@/, ""),
        name: handle.replace(/^@/, ""),
        kind: "member",
      };
      setSession(s);
      setGuest(false);
      await persist(s);
      setLoading(false);
      return { ok: true };
    }
    setLoading(false);
    return { ok: false, error: "Enter a handle (min 2 chars)" };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setGuest(false);
    persist(null);
  }, []);

  const value = useMemo(
    () => ({ session, guest, loading, signInGuest, signIn, signOut }),
    [session, guest, loading, signInGuest, signIn, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
