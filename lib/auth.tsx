import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import { asAccountKind, type AccountKind } from "./accountKinds";

const KEY = "@kilode/session";

export type Session = {
  token: string;
  handle: string;
  name: string;
  kind: AccountKind;
};

type AuthCtx = {
  session: Session | null;
  guest: boolean;
  loading: boolean;
  signInGuest: (name?: string) => void;
  signIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  signUp: (handle: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
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
          s.kind = asAccountKind(s.kind);
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

  const signIn = useCallback(async (handle: string, password: string, kind?: AccountKind) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: handle.includes("@") ? handle : `${handle}@users.kilode.ng`,
          password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const s: Session = {
          token: data.token || data.session?.token || "live",
          handle: data.user?.name || handle.replace(/^@/, ""),
          name: data.user?.name || handle.replace(/^@/, ""),
          kind: asAccountKind(kind || data.user?.kind || "member"),
        };
        setSession(s);
        setGuest(false);
        await persist(s);
        setLoading(false);
        return { ok: true };
      }
    } catch {
      /* offline / HTML-only host */
    }
    setLoading(false);
    if (handle.trim().length < 2) {
      return { ok: false, error: "Enter a username or email (at least 2 characters)." };
    }
    return {
      ok: false,
      error: "Sign-in service is unavailable. No account was signed in; try again later or continue as guest.",
    };
  }, []);

  const signUp = useCallback(async (handle: string, password: string, kind: AccountKind, displayName?: string) => {
    const h = handle.replace(/^@/, "").trim();
    if (h.length < 3) return { ok: false, error: "Username needs 3+ letters or numbers." };
    if (password.length < 8) return { ok: false, error: "Password needs 8+ characters." };
    setLoading(true);
    // Production: registerAccount on Kilode-v2 / Nine when JSON auth is open
    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: `${h}@users.kilode.ng`,
          password,
          name: h,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const s: Session = {
          token: data.token || data.session?.token || "live",
          handle: h,
          name: displayName || h,
          kind: asAccountKind(kind),
        };
        setSession(s);
        setGuest(false);
        await persist(s);
        setLoading(false);
        return { ok: true };
      }
    } catch {
      /* fall through local */
    }
    setLoading(false);
    return {
      ok: false,
      error: "Account creation service is unavailable. No account was created; try again later or continue as guest.",
    };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setGuest(false);
    persist(null);
  }, []);

  const value = useMemo(
    () => ({ session, guest, loading, signInGuest, signIn, signUp, signOut }),
    [session, guest, loading, signInGuest, signIn, signUp, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
