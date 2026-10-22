/**
 * Local-only market listing drafts.
 * Backend is the source of truth for published listings, orders, and payments.
 * This module never claims a draft is live, sold, or visible to buyers.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@kilode/market_drafts_v1";

export type MarketDraftStatus = "local_draft" | "pending_backend";

export type MarketDraft = {
  id: string;
  title: string;
  priceText: string;
  location: string;
  category: string;
  notes: string;
  status: MarketDraftStatus;
  createdAt: string;
  updatedAt: string;
  localOnly: true;
};

export const MARKET_CATEGORIES = [
  "Fashion",
  "Phones & gadgets",
  "Home",
  "Food",
  "Services",
  "Other",
] as const;

function uid(): string {
  return `mkt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function listMarketDrafts(): Promise<MarketDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((d: any) => ({
      ...d,
      localOnly: true as const,
      status: (d?.status === "pending_backend" ? "pending_backend" : "local_draft") as MarketDraftStatus,
    }));
  } catch {
    return [];
  }
}

async function saveAll(list: MarketDraft[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export type CreateMarketDraftInput = {
  title: string;
  priceText?: string;
  location?: string;
  category?: string;
  notes?: string;
};

export async function createMarketDraft(
  input: CreateMarketDraftInput
): Promise<{ ok: true; draft: MarketDraft } | { ok: false; message: string }> {
  const title = (input.title || "").trim();
  if (!title) return { ok: false, message: "Listing title is required." };

  const now = new Date().toISOString();
  const draft: MarketDraft = {
    id: uid(),
    title,
    priceText: (input.priceText || "").trim(),
    location: (input.location || "").trim(),
    category: (input.category || "Other").trim() || "Other",
    notes: (input.notes || "").trim(),
    status: "local_draft",
    createdAt: now,
    updatedAt: now,
    localOnly: true,
  };

  const list = await listMarketDrafts();
  list.unshift(draft);
  await saveAll(list);
  return { ok: true, draft };
}

export async function updateMarketDraft(
  id: string,
  patch: Partial<
    Pick<MarketDraft, "title" | "priceText" | "location" | "category" | "notes">
  >
): Promise<{ ok: true; draft: MarketDraft } | { ok: false; message: string }> {
  const list = await listMarketDrafts();
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) return { ok: false, message: "Draft not found." };

  const current = list[idx];
  const next: MarketDraft = {
    ...current,
    title: patch.title !== undefined ? String(patch.title).trim() : current.title,
    priceText: patch.priceText !== undefined ? String(patch.priceText).trim() : current.priceText,
    location: patch.location !== undefined ? String(patch.location).trim() : current.location,
    category:
      patch.category !== undefined
        ? String(patch.category).trim() || "Other"
        : current.category,
    notes: patch.notes !== undefined ? String(patch.notes).trim() : current.notes,
    updatedAt: new Date().toISOString(),
    localOnly: true,
    status: "local_draft",
  };

  if (!next.title) return { ok: false, message: "Listing title is required." };

  list[idx] = next;
  await saveAll(list);
  return { ok: true, draft: next };
}

export async function deleteMarketDraft(id: string): Promise<void> {
  const list = await listMarketDrafts();
  await saveAll(list.filter((d) => d.id !== id));
}
