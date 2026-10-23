import React, { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import { asAccountKind, type AccountKind } from "./accountKinds";

const KEY = "@kilode/session";

export type Session = {
  token: string;
  handle: string;
  name: string;
  kind: AccountKind;
  refreshToken?: string;
  expiresAt?: number;
};

type AuthCtx = {
  session: Session | null;
  guest: boolean;
  loading: boolean;
  signInGuest: (name?: string, kind?: AccountKind) => void;
  /** Device-only kind switch for guest sessions — not server authorization */
  setLocalKind: (kind: AccountKind) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, username: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string; requiresConfirmation?: boolean }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  completePasswordReset: (token: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const value = data as { message?: unknown; error?: unknown };
    if (typeof value.message === "string" && value.message.trim()) return value.message;
    if (typeof value.error === "string" && value.error.trim()) return value.error;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const refreshInFlight = useRef(false);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Session>;
          // Local placeholder sessions are not authenticated accounts. Do not
          // restore them as if they were valid server-issued credentials.
          if (parsed.token === "guest" && active) {
            const s: Session = {
              token: "guest",
              handle: "guest",
              name: typeof parsed.name === "string" ? parsed.name : "Guest",
              kind: asAccountKind(parsed.kind),
            };
            sessionRef.current = s;
            setSession(s);
            setGuest(true);
          } else if (
            typeof parsed.token === "string" &&
            parsed.token !== "local" &&
            parsed.token !== "live" &&
            typeof parsed.handle === "string" &&
            typeof parsed.name === "string" &&
            active
          ) {
            const s: Session = {
              token: parsed.token,
              handle: parsed.handle,
              name: parsed.name,
              kind: asAccountKind(parsed.kind),
              refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : undefined,
              expiresAt: typeof parsed.expiresAt === "number" && Number.isFinite(parsed.expiresAt) ? parsed.expiresAt : undefined,
            };
            sessionRef.current = s;
            setSession(s);
            setGuest(false);
          } else {
            await AsyncStorage.removeItem(KEY);
          }
        }
      } catch {
        try {
          await AsyncStorage.removeItem(KEY);
        } catch {
          // Storage may be unavailable; app can still open as guest.
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (s: Session | null) => {
    try {
      if (s) await AsyncStorage.setItem(KEY, JSON.stringify(s));
      else await AsyncStorage.removeItem(KEY);
    } catch {
      // Storage failures must not turn a rejected login into a successful one.
    }
  }, []);

  const refreshSession = useCallback(async (expectedRefreshToken: string): Promise<"refreshed" | "retry" | "expired" | "stale"> => {
    const current = sessionRef.current;
    if (!current || current.token === "guest" || current.refreshToken !== expectedRefreshToken) return "stale";
    if (!API_BASE) return "retry";
    if (refreshInFlight.current) return "retry";
    refreshInFlight.current = true;
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken: expectedRefreshToken }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { /* retry unless the server confirms the session is invalid */ }
      if (res.status === 401) {
        if (sessionRef.current?.refreshToken === expectedRefreshToken) {
          sessionRef.current = null;
          setSession(null);
          setGuest(false);
          await persist(null);
        }
        return "expired";
      }
      if (!res.ok) return "retry";
      const token = data.token || data.session?.token;
      const refreshToken = data.refreshToken || data.session?.refresh_token;
      const user = data.user;
      if (typeof token !== "string" || !token || token.length > 16_384 ||
          typeof refreshToken !== "string" || !refreshToken || refreshToken.length > 16_384 ||
          !user || typeof user.username !== "string") return "retry";
      if (sessionRef.current?.refreshToken !== expectedRefreshToken) return "stale";
      const expiresInRaw = Number(data.expiresIn);
      const expiresIn = Number.isFinite(expiresInRaw) && expiresInRaw > 0 ? Math.min(expiresInRaw, 86_400) : 3600;
      const next: Session = {
        token,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
        handle: user.username,
        name: typeof user.name === "string" ? user.name : user.username,
        kind: asAccountKind(user.kind),
      };
      sessionRef.current = next;
      setSession(next);
      setGuest(false);
      await persist(next);
      return "refreshed";
    } catch {
      return "retry";
    } finally {
      refreshInFlight.current = false;
    }
  }, [persist]);

  useEffect(() => {
    if (!session || session.token === "guest" || !session.refreshToken || !API_BASE) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (delayMs: number) => {
      if (timer) clearTimeout(timer);
      const safeDelay = Math.min(Math.max(1000, delayMs), 2_147_000_000);
      timer = setTimeout(async () => {
        if (!active || !session.refreshToken) return;
        const result = await refreshSession(session.refreshToken);
        if (active && result === "retry") schedule(30_000);
      }, safeDelay);
    };
    // Refresh a minute before expiry; a persisted legacy session without an
    // expiry is refreshed immediately if it already has a refresh token.
    const refreshAt = typeof session.expiresAt === "number" ? session.expiresAt - 60_000 : Date.now();
    schedule(refreshAt - Date.now());
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [session, refreshSession]);

  const signInGuest = useCallback((name?: string, kind?: AccountKind) => {
    const s: Session = {
      token: "guest",
      handle: "guest",
      name: name?.trim() || "Guest",
      kind: asAccountKind(kind || "member"),
    };
    sessionRef.current = s;
    setSession(s);
    setGuest(true);
    void persist(s);
  }, [persist]);

  const setLocalKind = useCallback(async (kind: AccountKind) => {
    setSession((prev) => {
      if (!prev || prev.token !== "guest") return prev;
      const next: Session = { ...prev, kind: asAccountKind(kind) };
      sessionRef.current = next;
      void persist(next);
      return next;
    });
  }, [persist]);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) return { ok: false, error: "Enter a valid email address." };
    if (!password) return { ok: false, error: "Enter your password." };
    if (!API_BASE) {
      return { ok: false, error: "Kilode sign-in is not available yet because its dedicated backend is not connected. You can continue as a guest." };
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Non-JSON server responses are reported below without treating them as success.
      }
      if (!res.ok) {
        return { ok: false, error: errorMessage(data, "Sign-in failed. Check your details or try again later.") };
      }
      const token = data.token || data.session?.token;
      const refreshToken = data.refreshToken || data.session?.refresh_token;
      if (typeof token !== "string" || !token || token === "live" || token === "local" || token === "guest" || typeof refreshToken !== "string" || !refreshToken || !data.user || typeof data.user.username !== "string") {
        return { ok: false, error: "The server did not return a valid account session. Please try again later." };
      }
      const expiresInRaw = Number(data.expiresIn);
      const expiresIn = Number.isFinite(expiresInRaw) && expiresInRaw > 0 ? Math.min(expiresInRaw, 86_400) : 3600;
      const s: Session = {
        token,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
        handle: data.user.username,
        name: typeof data.user.name === "string" ? data.user.name : data.user.username,
        // The authenticated server profile is authoritative; never grant a local role choice at sign-in.
        kind: asAccountKind(data.user?.kind || "member"),
      };
      sessionRef.current = s;
      setSession(s);
      setGuest(false);
      await persist(s);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach Kilode sign-in. Check your connection and try again." };
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const signUp = useCallback(async (email: string, username: string, password: string, kind: AccountKind, displayName?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const h = username.trim().replace(/^@/, "").toLowerCase();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) return { ok: false, error: "Enter a valid email address." };
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(h)) return { ok: false, error: "Username must be 3–30 letters, numbers, underscores or periods." };
    if (password.length < 8 || password.length > 72) return { ok: false, error: "Password must be between 8 and 72 characters." };
    if (!API_BASE) {
      return { ok: false, error: "Kilode registration is not available yet because its dedicated backend is not connected. You can continue as a guest and preview workspaces locally." };
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          username: h,
          password,
          name: displayName?.trim() || h,
          kind,
        }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Non-JSON server responses are reported below without treating them as success.
      }
      if (!res.ok) {
        return { ok: false, error: errorMessage(data, "Registration failed. Please try again later.") };
      }
      if (data.requiresConfirmation === true) return { ok: true, requiresConfirmation: true };
      const token = data.token || data.session?.token;
      const refreshToken = data.refreshToken || data.session?.refresh_token;
      if (typeof token !== "string" || !token || token === "live" || token === "local" || token === "guest" || typeof refreshToken !== "string" || !refreshToken || !data.user || typeof data.user.username !== "string") {
        return { ok: false, error: "The server did not return a valid account session. Please try again later." };
      }
      const expiresInRaw = Number(data.expiresIn);
      const expiresIn = Number.isFinite(expiresInRaw) && expiresInRaw > 0 ? Math.min(expiresInRaw, 86_400) : 3600;
      const s: Session = {
        token,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
        handle: data.user.username,
        name: typeof data.user.name === "string" ? data.user.name : (displayName?.trim() || h),
        kind: asAccountKind(data.user.kind),
      };
      sessionRef.current = s;
      setSession(s);
      setGuest(false);
      await persist(s);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach Kilode registration. Check your connection and try again." };
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const requestPasswordReset = useCallback(async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return { ok: false, error: "Enter a valid email address first." };
    }
    if (!API_BASE) return { ok: false, error: "Password recovery is unavailable until Kilode's dedicated backend is connected." };
    try {
      const res = await fetch(`${API_BASE}/api/auth/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { /* generic fallback below */ }
      if (!res.ok) return { ok: false, error: errorMessage(data, "Password recovery is temporarily unavailable. Try again later.") };
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach Kilode password recovery. Check your connection and try again." };
    }
  }, []);

  const completePasswordReset = useCallback(async (token: string, password: string) => {
    if (typeof token !== "string" || token.length < 20 || token.length > 16_384) {
      return { ok: false, error: "This recovery link is invalid or expired. Request a new one." };
    }
    if (password.length < 8 || password.length > 72) {
      return { ok: false, error: "Password must be between 8 and 72 characters." };
    }
    if (!API_BASE) return { ok: false, error: "Password recovery is unavailable until Kilode's dedicated backend is connected." };
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token, password }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { /* generic fallback below */ }
      if (!res.ok) return { ok: false, error: errorMessage(data, "Password could not be updated. Request a new recovery link.") };
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach password update. Check your connection and try again." };
    }
  }, []);

  const signOut = useCallback(() => {
    sessionRef.current = null;
    setSession(null);
    setGuest(false);
    void persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ session, guest, loading, signInGuest, setLocalKind, signIn, signUp, requestPasswordReset, completePasswordReset, signOut }),
    [session, guest, loading, signInGuest, setLocalKind, signIn, signUp, requestPasswordReset, completePasswordReset, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
