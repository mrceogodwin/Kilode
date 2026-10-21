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

async function fetchAuthWithTimeout(url: string, init: RequestInit, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

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
            };
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

  const signInGuest = useCallback((name?: string) => {
    const s: Session = {
      token: "guest",
      handle: "guest",
      name: name?.trim() || "Guest",
      kind: "member",
    };
    setSession(s);
    setGuest(true);
    void persist(s);
  }, [persist]);

  const signIn = useCallback(async (handle: string, password: string, kind?: AccountKind) => {
    const normalizedHandle = handle.trim();
    if (normalizedHandle.length < 2) return { ok: false, error: "Enter a handle (min 2 characters)." };
    if (!password) return { ok: false, error: "Enter your password." };
    if (!API_BASE) {
      return { ok: false, error: "Kilode sign-in is not available yet because its dedicated backend is not connected. You can continue as a guest." };
    }

    setLoading(true);
    try {
      const res = await fetchAuthWithTimeout(`${API_BASE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: normalizedHandle.includes("@") ? normalizedHandle : `${normalizedHandle.replace(/^@/, "")}@users.kilode.ng`,
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
      if (typeof token !== "string" || !token || token === "live" || token === "local" || token === "guest") {
        return { ok: false, error: "The server did not return a valid session. Please try again later." };
      }
      const s: Session = {
        token,
        handle: data.user?.username || data.user?.name || normalizedHandle.replace(/^@/, ""),
        name: data.user?.name || normalizedHandle.replace(/^@/, ""),
        kind: asAccountKind(kind || data.user?.kind || "member"),
      };
      setSession(s);
      setGuest(false);
      await persist(s);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Could not reach Kilode sign-in. Check your connection and try again." };
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const signUp = useCallback(async (handle: string, password: string, kind: AccountKind, displayName?: string) => {
    const h = handle.replace(/^@/, "").trim();
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(h)) {
      return { ok: false, error: "Username must be 3–30 letters, numbers, underscores or periods." };
    }
    if (password.length < 8) return { ok: false, error: "Password needs at least 8 characters." };
    if (!API_BASE) {
      return { ok: false, error: "Kilode registration is not available yet because its dedicated backend is not connected. You can continue as a guest." };
    }

    setLoading(true);
    try {
      const res = await fetchAuthWithTimeout(`${API_BASE}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: `${h}@users.kilode.ng`,
          password,
          name: displayName?.trim() || h,
          kind: asAccountKind(kind),
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
      const token = data.token || data.session?.token;
      if (typeof token !== "string" || !token || token === "live" || token === "local" || token === "guest") {
        return { ok: false, error: "The server did not return a valid session. Please try again later." };
      }
      const s: Session = {
        token,
        handle: h,
        name: data.user?.name || displayName?.trim() || h,
        kind: asAccountKind(kind),
      };
      setSession(s);
      setGuest(false);
      await persist(s);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Could not reach Kilode registration. Check your connection and try again." };
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const signOut = useCallback(() => {
    setSession(null);
    setGuest(false);
    void persist(null);
  }, [persist]);

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
