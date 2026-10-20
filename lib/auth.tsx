import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import { asAccountKind, type AccountKind } from "./accountKinds";

const KEY = "@kilode/session";
const KIND_KEY = "@kilode/lastKind";

export type Session = {
  token: string;
  handle: string;
  name: string;
  kind: AccountKind;
  /** true when session is device-local because API did not accept JSON auth */
  localOnly?: boolean;
};

type AuthCtx = {
  session: Session | null;
  guest: boolean;
  loading: boolean;
  signInGuest: (name?: string) => void;
  signIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  signUp: (handle: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
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

  const setAccountKind = useCallback(
    async (kind: AccountKind) => {
      const k = asAccountKind(kind);
      await AsyncStorage.setItem(KIND_KEY, k);
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, kind: k };
        persist(next);
        return next;
      });
    },
    []
  );

  const signIn = useCallback(async (handle: string, password: string, kind?: AccountKind) => {
    setLoading(true);
    const h = handle.replace(/^@/, "").trim();
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: handle.includes("@") ? handle : `${h}@users.kilode.ng`,
          password,
        }),
      });
      if (!res.ok) {
        let message = "";
        try {
          const payload = await res.json();
          message = payload.message || payload.error || payload.code || "";
        } catch {
          /* host may return HTML */
        }
        setLoading(false);
        return {
          ok: false,
          error:
            message ||
            (res.status === 401 || res.status === 403
              ? "Those login details were not accepted."
              : `Sign-in failed (HTTP ${res.status}). Please try again.`),
        };
      }
      const data = await res.json();
      const token = data.token || data.session?.token;
      if (!token) {
        setLoading(false);
        return {
          ok: false,
          error: "The server did not return a native session token. Native authentication still needs backend support.",
        };
      }
      let storedKind: string | undefined;
      try {
        const profile = await fetchWithTimeout(`${API_BASE}/api/mobile/profile`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (profile.ok) storedKind = (await profile.json()).kind;
      } catch {
        /* profile optional */
      }
      const s: Session = {
        token,
        handle: data.user?.name || h,
        name: data.user?.name || h,
        kind: asAccountKind(kind || storedKind || data.user?.kind || "member"),
        localOnly: false,
      };
      setSession(s);
      setGuest(false);
      await persist(s);
      setLoading(false);
      return { ok: true };
    } catch {
      /* offline / HTML-only host — restore local session if one was stored for this handle */
    }

    // Device-local sign-in when API is unreachable (clearly localOnly)
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const existing = JSON.parse(raw) as Session;
        if (
          existing.handle === h &&
          (existing.localOnly || existing.token?.startsWith("local:"))
        ) {
          existing.kind = asAccountKind(kind || existing.kind);
          existing.localOnly = true;
          setSession(existing);
          setGuest(false);
          await persist(existing);
          setLoading(false);
          return { ok: true };
        }
      }
    } catch {
      /* ignore */
    }

    setLoading(false);
    if (h.length < 2) {
      return { ok: false, error: "Enter a username or email (at least 2 characters)." };
    }
    return {
      ok: false,
      error:
        "Sign-in service is unavailable. No live account was signed in. Create a local account or continue as guest.",
    };
  }, []);

  const signUp = useCallback(async (handle: string, password: string, kind: AccountKind, displayName?: string) => {
    const h = handle.replace(/^@/, "").trim();
    if (h.length < 3) return { ok: false, error: "Username needs 3+ letters or numbers." };
    if (password.length < 8) return { ok: false, error: "Password needs 8+ characters." };
    if (!kind) return { ok: false, error: "Choose an account type." };

    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: `${h}@users.kilode.ng`,
          password,
          name: displayName || h,
          kind,
        }),
      });
      if (!res.ok) {
        let message = "";
        try {
          const payload = await res.json();
          message = payload.message || payload.error || payload.code || "";
        } catch {
          /* HTML host */
        }
        // Fall through to local account when host rejects JSON (e.g. 406)
        if (res.status !== 406 && res.status !== 404 && res.status < 500) {
          setLoading(false);
          return {
            ok: false,
            error:
              message ||
              (res.status === 409
                ? "An account with that username already exists."
                : `Account creation failed (HTTP ${res.status}). Please try again.`),
          };
        }
      } else {
        const data = await res.json();
        const token = data.token || data.session?.token;
        if (token) {
          try {
            await fetchWithTimeout(`${API_BASE}/api/mobile/profile`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ kind, handle: h }),
            });
          } catch {
            /* profile optional */
          }
          const s: Session = {
            token,
            handle: h,
            name: displayName || h,
            kind: asAccountKind(kind),
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
      /* fall through local */
    }

    // Local-only account so native registration still works while mobile APIs return 406.
    // Not claimed as a live server account — session.localOnly === true.
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
