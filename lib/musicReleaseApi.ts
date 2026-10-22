/**
 * Native client for the artist release / entitlements API contract.
 * See docs/NATIVE_ARTIST_RELEASE_API_CONTRACT.md and docs/ARTIST_MONETISATION_DECISIONS.md.
 *
 * No endpoint is claimed to be live. Until API_BASE serves these routes,
 * every call returns source: "error" with a clear message — never fake credits or publish success.
 */
import { API_BASE, FORCE_MOCK } from "./config";

export type DataSource = "live" | "mock" | "error";

export type MusicApiResult<T> = {
  ok: boolean;
  data: T;
  source: DataSource;
  error?: string;
};

/** Server-authoritative snapshot (shape proposed by the contract). */
export type ArtistEntitlements = {
  accountKind: string | null;
  planId: string | null;
  planLabel: string | null;
  /** Remaining release credits (one credit = one master). null = unknown / not connected */
  releaseCredits: number | null;
  /** Proposed free-allowance documentation only when offline */
  freeAllowanceProposed: number;
  billingState: "unknown" | "none" | "active" | "past_due" | "cancelled";
  capabilities: string[];
  serverVersion: string | null;
  /** True only when the response came from a live entitlements endpoint */
  connected: boolean;
};

export type ServerReleaseStatus =
  | "draft"
  | "upload_pending"
  | "uploaded"
  | "processing"
  | "review_pending"
  | "approved"
  | "scheduled"
  | "published"
  | "upload_failed"
  | "processing_failed"
  | "rejected"
  | "withdrawn"
  | "takedown_pending"
  | "taken_down";

const UA = "KilodeNative/1.0 (iOS; Expo)";

/** Product default from ARTIST_MONETISATION_DECISIONS.md — not granted offline. */
export const PROPOSED_FREE_ALLOWANCE = 3;

function offlineEntitlements(error: string): MusicApiResult<ArtistEntitlements> {
  return {
    ok: false,
    source: "error",
    error,
    data: {
      accountKind: null,
      planId: null,
      planLabel: null,
      releaseCredits: null,
      freeAllowanceProposed: PROPOSED_FREE_ALLOWANCE,
      billingState: "unknown",
      capabilities: [],
      serverVersion: null,
      connected: false,
    },
  };
}

/**
 * GET /v1/me/entitlements (proposed path).
 * Falls back honestly when API is missing, mock-forced, or request fails.
 */
export async function fetchArtistEntitlements(
  token?: string | null
): Promise<MusicApiResult<ArtistEntitlements>> {
  if (FORCE_MOCK) {
    return offlineEntitlements("Mock mode — entitlements not simulated as paid");
  }
  if (!API_BASE) {
    return offlineEntitlements("Dedicated Kilode API is not configured");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const ctrl = new AbortController();
    timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(`${API_BASE}/v1/me/entitlements`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      return offlineEntitlements(`HTTP ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return offlineEntitlements("non-json response");
    }
    const raw = await res.json();
    const credits =
      typeof raw?.releaseCredits === "number"
        ? raw.releaseCredits
        : typeof raw?.credits?.release === "number"
          ? raw.credits.release
          : null;
    const data: ArtistEntitlements = {
      accountKind: raw?.accountKind ?? raw?.kind ?? null,
      planId: raw?.planId ?? raw?.plan?.id ?? null,
      planLabel: raw?.planLabel ?? raw?.plan?.label ?? null,
      releaseCredits: credits,
      freeAllowanceProposed: PROPOSED_FREE_ALLOWANCE,
      billingState: raw?.billingState ?? "unknown",
      capabilities: Array.isArray(raw?.capabilities) ? raw.capabilities : [],
      serverVersion: raw?.serverVersion ?? raw?.version ?? null,
      connected: true,
    };
    return { ok: true, data, source: "live" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network";
    return offlineEntitlements(msg);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Placeholder: create server draft. Always fails until backend implements POST /v1/music/releases.
 * Local drafts remain in lib/artistReleases.ts.
 */
export async function createServerReleaseDraft(_input: {
  title: string;
  artistName: string;
  genre?: string;
  releaseType?: string;
  rightsVersion: string;
  idempotencyKey: string;
  token?: string | null;
}): Promise<MusicApiResult<{ releaseId: string; status: ServerReleaseStatus } | null>> {
  return {
    ok: false,
    data: null,
    source: "error",
    error: "Music release API is not connected. Use local drafts only.",
  };
}

/** Human-readable status for Plan & credits UI. */
export function entitlementsStatusLabel(r: MusicApiResult<ArtistEntitlements>): string {
  if (r.source === "live" && r.data.connected) return "Live";
  if (r.error?.includes("not configured")) return "API not configured";
  if (r.error?.includes("Mock")) return "Mock mode";
  return "Offline";
}
