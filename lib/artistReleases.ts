/**
 * Local-only artist release drafts.
 * Backend is the source of truth for published releases, credits, and entitlements.
 * This module never claims a draft is uploaded, approved, or live.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@kilode/artist_release_drafts_v1";

export type ReleaseStatus =
  | "local_draft"
  | "pending_backend" // reserved for when API exists; not used until then
  | "upload_failed";

export type ArtistReleaseDraft = {
  id: string;
  title: string;
  artistName: string;
  genre: string;
  notes: string;
  rightsAcknowledged: boolean;
  rightsVersion: string;
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
  /** Local-only flag — never means server accepted the release */
  localOnly: true;
};

const RIGHTS_VERSION = "kilode-rights-v1-2026";

function uid(): string {
  return `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function listReleaseDrafts(): Promise<ArtistReleaseDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAll(list: ArtistReleaseDraft[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export type CreateDraftInput = {
  title: string;
  artistName: string;
  genre: string;
  notes?: string;
  rightsAcknowledged: boolean;
};

export async function createReleaseDraft(
  input: CreateDraftInput
): Promise<{ ok: true; draft: ArtistReleaseDraft } | { ok: false; message: string }> {
  const title = (input.title || "").trim();
  const artistName = (input.artistName || "").trim();
  const genre = (input.genre || "").trim();

  if (!title) return { ok: false, message: "Title is required." };
  if (!artistName) return { ok: false, message: "Artist name is required." };
  if (!input.rightsAcknowledged) {
    return { ok: false, message: "You must confirm rights before saving a draft." };
  }

  const now = new Date().toISOString();
  const draft: ArtistReleaseDraft = {
    id: uid(),
    title,
    artistName,
    genre: genre || "Afrobeats",
    notes: (input.notes || "").trim(),
    rightsAcknowledged: true,
    rightsVersion: RIGHTS_VERSION,
    status: "local_draft",
    createdAt: now,
    updatedAt: now,
    localOnly: true,
  };

  const list = await listReleaseDrafts();
  list.unshift(draft);
  await saveAll(list);
  return { ok: true, draft };
}

export async function updateReleaseDraft(
  id: string,
  patch: Partial<Pick<ArtistReleaseDraft, "title" | "artistName" | "genre" | "notes" | "rightsAcknowledged">>
): Promise<{ ok: true; draft: ArtistReleaseDraft } | { ok: false; message: string }> {
  const list = await listReleaseDrafts();
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) return { ok: false, message: "Draft not found." };

  const current = list[idx];
  const next: ArtistReleaseDraft = {
    ...current,
    title: patch.title !== undefined ? String(patch.title).trim() : current.title,
    artistName: patch.artistName !== undefined ? String(patch.artistName).trim() : current.artistName,
    genre: patch.genre !== undefined ? String(patch.genre).trim() : current.genre,
    notes: patch.notes !== undefined ? String(patch.notes).trim() : current.notes,
    rightsAcknowledged:
      patch.rightsAcknowledged !== undefined ? !!patch.rightsAcknowledged : current.rightsAcknowledged,
    updatedAt: new Date().toISOString(),
    localOnly: true,
    status: "local_draft",
  };

  if (!next.title) return { ok: false, message: "Title is required." };
  if (!next.artistName) return { ok: false, message: "Artist name is required." };

  list[idx] = next;
  await saveAll(list);
  return { ok: true, draft: next };
}

export async function deleteReleaseDraft(id: string): Promise<void> {
  const list = await listReleaseDrafts();
  await saveAll(list.filter((d) => d.id !== id));
}

export function rightsDeclarationText(): string {
  return (
    "I confirm I own or control the rights to the master recording, composition, " +
    "samples, and artwork for this release, and I have authority to distribute it on Kilode. " +
    "I understand this draft is stored on this device only until a dedicated music backend is connected."
  );
}

export function getRightsVersion(): string {
  return RIGHTS_VERSION;
}
