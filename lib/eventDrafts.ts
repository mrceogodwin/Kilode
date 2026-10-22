/**
 * Local-only event drafts.
 * Backend is the source of truth for published events, RSVPs, and moderation.
 * This module never claims a draft is live, ticketed, or discoverable by others.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@kilode/event_drafts_v1";

export type EventDraftStatus = "local_draft" | "pending_backend";

export type EventDraft = {
  id: string;
  title: string;
  venue: string;
  city: string;
  /** Free-text date/time for now — structured datetime when API exists */
  whenText: string;
  priceText: string;
  notes: string;
  status: EventDraftStatus;
  createdAt: string;
  updatedAt: string;
  localOnly: true;
};

function uid(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function listEventDrafts(): Promise<EventDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((d: any) => ({
      ...d,
      localOnly: true as const,
      status: (d?.status === "pending_backend" ? "pending_backend" : "local_draft") as EventDraftStatus,
    }));
  } catch {
    return [];
  }
}

async function saveAll(list: EventDraft[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export type CreateEventDraftInput = {
  title: string;
  venue?: string;
  city?: string;
  whenText?: string;
  priceText?: string;
  notes?: string;
};

export async function createEventDraft(
  input: CreateEventDraftInput
): Promise<{ ok: true; draft: EventDraft } | { ok: false; message: string }> {
  const title = (input.title || "").trim();
  if (!title) return { ok: false, message: "Event title is required." };

  const now = new Date().toISOString();
  const draft: EventDraft = {
    id: uid(),
    title,
    venue: (input.venue || "").trim(),
    city: (input.city || "").trim(),
    whenText: (input.whenText || "").trim(),
    priceText: (input.priceText || "").trim() || "Free",
    notes: (input.notes || "").trim(),
    status: "local_draft",
    createdAt: now,
    updatedAt: now,
    localOnly: true,
  };

  const list = await listEventDrafts();
  list.unshift(draft);
  await saveAll(list);
  return { ok: true, draft };
}

export async function updateEventDraft(
  id: string,
  patch: Partial<
    Pick<EventDraft, "title" | "venue" | "city" | "whenText" | "priceText" | "notes">
  >
): Promise<{ ok: true; draft: EventDraft } | { ok: false; message: string }> {
  const list = await listEventDrafts();
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) return { ok: false, message: "Draft not found." };

  const current = list[idx];
  const next: EventDraft = {
    ...current,
    title: patch.title !== undefined ? String(patch.title).trim() : current.title,
    venue: patch.venue !== undefined ? String(patch.venue).trim() : current.venue,
    city: patch.city !== undefined ? String(patch.city).trim() : current.city,
    whenText: patch.whenText !== undefined ? String(patch.whenText).trim() : current.whenText,
    priceText:
      patch.priceText !== undefined ? String(patch.priceText).trim() || "Free" : current.priceText,
    notes: patch.notes !== undefined ? String(patch.notes).trim() : current.notes,
    updatedAt: new Date().toISOString(),
    localOnly: true,
    status: "local_draft",
  };

  if (!next.title) return { ok: false, message: "Event title is required." };

  list[idx] = next;
  await saveAll(list);
  return { ok: true, draft: next };
}

export async function deleteEventDraft(id: string): Promise<void> {
  const list = await listEventDrafts();
  await saveAll(list.filter((d) => d.id !== id));
}
