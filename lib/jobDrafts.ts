/**
 * Local-only job post drafts.
 * Backend is the source of truth for published roles, applications, and staff approval.
 * This module never claims a draft is live, approved, or visible to seekers.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@kilode/job_drafts_v1";

export type JobDraftStatus = "local_draft" | "pending_backend";

export type JobDraft = {
  id: string;
  title: string;
  company: string;
  location: string;
  /** e.g. Full-time, Contract, Remote */
  employmentType: string;
  salaryText: string;
  notes: string;
  status: JobDraftStatus;
  createdAt: string;
  updatedAt: string;
  localOnly: true;
};

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Internship",
  "Gig",
] as const;

function uid(): string {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function listJobDrafts(): Promise<JobDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((d: any) => ({
      ...d,
      localOnly: true as const,
      status: (d?.status === "pending_backend" ? "pending_backend" : "local_draft") as JobDraftStatus,
    }));
  } catch {
    return [];
  }
}

async function saveAll(list: JobDraft[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export type CreateJobDraftInput = {
  title: string;
  company?: string;
  location?: string;
  employmentType?: string;
  salaryText?: string;
  notes?: string;
};

export async function createJobDraft(
  input: CreateJobDraftInput
): Promise<{ ok: true; draft: JobDraft } | { ok: false; message: string }> {
  const title = (input.title || "").trim();
  if (!title) return { ok: false, message: "Job title is required." };

  const now = new Date().toISOString();
  const draft: JobDraft = {
    id: uid(),
    title,
    company: (input.company || "").trim(),
    location: (input.location || "").trim(),
    employmentType: (input.employmentType || "Full-time").trim() || "Full-time",
    salaryText: (input.salaryText || "").trim(),
    notes: (input.notes || "").trim(),
    status: "local_draft",
    createdAt: now,
    updatedAt: now,
    localOnly: true,
  };

  const list = await listJobDrafts();
  list.unshift(draft);
  await saveAll(list);
  return { ok: true, draft };
}

export async function updateJobDraft(
  id: string,
  patch: Partial<
    Pick<
      JobDraft,
      "title" | "company" | "location" | "employmentType" | "salaryText" | "notes"
    >
  >
): Promise<{ ok: true; draft: JobDraft } | { ok: false; message: string }> {
  const list = await listJobDrafts();
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) return { ok: false, message: "Draft not found." };

  const current = list[idx];
  const next: JobDraft = {
    ...current,
    title: patch.title !== undefined ? String(patch.title).trim() : current.title,
    company: patch.company !== undefined ? String(patch.company).trim() : current.company,
    location: patch.location !== undefined ? String(patch.location).trim() : current.location,
    employmentType:
      patch.employmentType !== undefined
        ? String(patch.employmentType).trim() || "Full-time"
        : current.employmentType,
    salaryText:
      patch.salaryText !== undefined ? String(patch.salaryText).trim() : current.salaryText,
    notes: patch.notes !== undefined ? String(patch.notes).trim() : current.notes,
    updatedAt: new Date().toISOString(),
    localOnly: true,
    status: "local_draft",
  };

  if (!next.title) return { ok: false, message: "Job title is required." };

  list[idx] = next;
  await saveAll(list);
  return { ok: true, draft: next };
}

export async function deleteJobDraft(id: string): Promise<void> {
  const list = await listJobDrafts();
  await saveAll(list.filter((d) => d.id !== id));
}
