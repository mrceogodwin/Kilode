import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE, getBackendMode } from "./config";
import { asAccountKind, type AccountKind } from "./accountKinds";
import { createPost, fetchOwnProfile, getSupabase, listRecentPosts } from "./supabase";

const KEY = "@kilode/session";
const KIND_KEY = "@kilode/lastKind";

export type Session = {
  token: string;
  handle: string;
  name: string;
  kind: AccountKind;
  /** true when session is device-local because no live backend accepted the session */
  localOnly?: boolean;
  /** Supabase auth user id when live */
  userId?: string;
};

type AuthCtx = {
  session: Session | null;
  guest: boolean;
  loading: boolean;
  signInGuest: (name?: string) => void;
  signIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  signUp: (handle: string, password: string, kind: AccountKind, displayName?: string, emailAddress?: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  setAccountKind: (kind: AccountKind) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function localToken(handle: string) {
  return `local:${handle}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        if (sb) {
          const { data } = await sb.auth.getSession();
          const u = data.session?.user;
          if (u && data.session?.access_token) {
            const profile = await fetchOwnProfile(u.id);
            const s: Session = {
              token: data.session.access_token,
              userId: u.id,
              handle: profile?.handle || (u.user_metadata?.handle as string) || u.email?.split("@")[0] || "user",
              name: profile?.display_name || (u.user_metadata?.display_name as string) || "Kilode",
              kind: asAccountKind(profile?.kind || (u.user_metadata?.kind as string) || "member"),
              localOnly: false,
            };
            setSession(s);
            setGuest(false);
            await AsyncStorage.setItem(KEY, JSON.stringify(s));
            setLoading(false);
            return;
          }
        }
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const s = JSON.parse(raw) as Session;
          s.kind = asAccountKind(s.kind);
          s.localOnly = !!s.localOnly || (typeof s.token === "string" && s.token.startsWith("local:"));
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
      if (s) {
        await AsyncStorage.setItem(KEY, JSON.stringify(s));
        await AsyncStorage.setItem(KIND_KEY, s.kind);
      } else {
        await AsyncStorage.removeItem(KEY);
      }
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
      localOnly: true,
    };
    setSession(s);
    setGuest(true);
    persist(s);
  }, []);

  const setAccountKind = useCallback(async (kind: AccountKind) => {
    const k = asAccountKind(kind);
    await AsyncStorage.setItem(KIND_KEY, k);
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, kind: k };
      persist(next);
      return next;
    });
  }, []);

  const signIn = useCallback(async (handle: string, password: string, kind?: AccountKind) => {
    setLoading(true);
    const h = handle.replace(/^@/, "").trim();
    const email = handle.includes("@") ? handle.trim() : `${h}@users.kilode.ng`;

    // Dedicated Supabase backend
    if (getBackendMode() === "supabase") {
      const sb = getSupabase();
      if (!sb) {
        setLoading(false);
        return { ok: false, error: "Supabase is not configured." };
      }
      try {
        if (!handle.includes("@")) {
          setLoading(false);
          return { ok: false, error: "Use the email address associated with your Kilode account to sign in." };
        }
        const { data, error } = await sb.auth.signInWithPassword({ email: handle.trim(), password });
        if (error || !data.session?.user) {
          setLoading(false);
          return { ok: false, error: error?.message || "Those login details were not accepted." };
        }
        const u = data.session.user;
        const profile = await fetchOwnProfile(u.id);
        const s: Session = {
          token: data.session.access_token,
          userId: u.id,
          handle: profile?.handle || h,
          name: profile?.display_name || h,
          kind: asAccountKind(profile?.kind || "member"),
          localOnly: false,
        };
        setSession(s);
        setGuest(false);
        await persist(s);
        setLoading(false);
        return { ok: true };
      } catch (e) {
        setLoading(false);
        return { ok: false, error: e instanceof Error ? e.message : "Sign-in failed." };
      }
    }

    // Optional custom API only (not Kilode-v2/nine by default)
    if (API_BASE) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/auth/sign-in/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          const token = data.token || data.session?.token;
          if (token) {
            const s: Session = {
              token,
              handle: data.user?.name || h,
              name: data.user?.name || h,
              kind: asAccountKind(data.user?.kind || "member"),
              localOnly: false,
            };
            setSession(s);
            setGuest(false);
            await persist(s);
            setLoading(false);
            return { ok: true };
          }
        }
      } catch {
        /* fall through */
      }
    }

    setLoading(false);
    if (h.length < 2) {
      return { ok: false, error: "Enter a username or email (at least 2 characters)." };
    }
    return {
      ok: false,
      error:
        "Sign-in service is unavailable. Create a local account, continue as guest, or configure Supabase.",
    };
  }, []);

  const signUp = useCallback(async (handle: string, password: string, kind: AccountKind, displayName?: string, emailAddress?: string) => {
    const h = handle.replace(/^@/, "").trim();
    if (h.length < 3) return { ok: false, error: "Username needs 3+ letters or numbers." };
    if (password.length < 8) return { ok: false, error: "Password needs 8+ characters." };
    if (!kind) return { ok: false, error: "Choose an account type." };

    setLoading(true);
    const email = (emailAddress || "").trim().toLowerCase();

    if (getBackendMode() === "supabase") {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setLoading(false);
        return { ok: false, error: "Enter a valid email address so you can verify and recover your account." };
      }
      const sb = getSupabase();
      if (!sb) {
        setLoading(false);
        return { ok: false, error: "Supabase is not configured." };
      }
      try {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              handle: h,
              display_name: displayName || h,
              kind,
            },
          },
        });
        if (error) {
          setLoading(false);
          return { ok: false, error: error.message };
        }
        if (!data.session?.user) {
          setLoading(false);
          return {
            ok: false,
            error: "Check your email to confirm the account, then sign in.",
          };
        }
        const u = data.session.user;
        const profile = await fetchOwnProfile(u.id);
        const s: Session = {
          token: data.session.access_token,
          userId: u.id,
          handle: profile?.handle || h,
          name: profile?.display_name || displayName || h,
          kind: asAccountKind(profile?.kind || kind),
          localOnly: false,
        };
        setSession(s);
        setGuest(false);
        await persist(s);
        setLoading(false);
        return { ok: true };
      } catch (e) {
        setLoading(false);
        return { ok: false, error: e instanceof Error ? e.message : "Sign-up failed." };
      }
    }

    // A custom API URL is not enough to assume its sign-up contract exists.
    // Never silently create a device-only account when a server was configured.
    if (API_BASE) {
      setLoading(false);
      return {
        ok: false,
        error: "Sign-up for this custom API is not connected yet. Configure Supabase Auth or implement the dedicated API sign-up endpoint.",
      };
    }

    // Offline / no dedicated backend — explicit local-only account
    const s: Session = {
      token: localToken(h),
      handle: h,
      name: displayName || h,
      kind: asAccountKind(kind),
      localOnly: true,
    };
    setSession(s);
    setGuest(false);
    await persist(s);
    setLoading(false);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    const sb = getSupabase();
    if (sb) sb.auth.signOut().catch(() => undefined);
    setSession(null);
    setGuest(false);
    persist(null);
  }, []);

  const value = useMemo(
    () => ({ session, guest, loading, signInGuest, signIn, signUp, signOut, setAccountKind }),
    [session, guest, loading, signInGuest, signIn, signUp, signOut, setAccountKind]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

/** Socials feed helper used by root when Supabase is live. */
export async function loadSocialsFeed(userId?: string): Promise<{ source: "live" | "mock" | "error"; data: any[]; error?: string }> {
  if (getBackendMode() !== "supabase") {
    return { source: "mock", data: [] };
  }
  const r = await listRecentPosts(40, userId);
  if (!r.ok) return { source: "error", data: [], error: r.error };
  return { source: "live", data: r.data };
}

export async function publishSocialPost(
  text: string,
  userId?: string
): Promise<{ source: "live" | "mock" | "error"; data?: any; error?: string }> {
  if (!userId || getBackendMode() !== "supabase") {
    return { source: "mock", error: "live publish requires Supabase session" };
  }
  const r = await createPost(text, userId);
  if (!r.ok) return { source: "error", error: r.error };
  return { source: "live", data: r.data };
}
