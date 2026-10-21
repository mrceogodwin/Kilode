/**
 * Local-only report / block store (AsyncStorage).
 * This is a development fallback, not production moderation: reports are
 * not delivered to staff and blocks are not enforced across devices.
 * Production requires authenticated server-side report queues and block rules.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const BLOCK_KEY = "@kilode/blocked_users";
const REPORT_KEY = "@kilode/reports";

function scopedKey(base: string, scope?: string): string {
  const account = (scope || "guest").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_") || "guest";
  return `${base}:${account}`;
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "violence"
  | "nudity"
  | "misinfo"
  | "other";

export type ReportRecord = {
  id: string;
  targetType: "post" | "user" | "comment";
  targetId: string;
  reason: ReportReason;
  note?: string;
  createdAt: string;
};

export async function getBlockedUsers(scope?: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(scopedKey(BLOCK_KEY, scope));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function blockUser(handle: string, scope?: string): Promise<void> {
  const key = scopedKey(BLOCK_KEY, scope);
  const list = await getBlockedUsers(scope);
  if (!list.includes(handle)) {
    list.push(handle);
    await AsyncStorage.setItem(key, JSON.stringify(list));
  }
}

export async function unblockUser(handle: string, scope?: string): Promise<void> {
  const key = scopedKey(BLOCK_KEY, scope);
  const list = (await getBlockedUsers(scope)).filter((h) => h !== handle);
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

export async function submitReport(
  targetType: ReportRecord["targetType"],
  targetId: string,
  reason: ReportReason,
  note?: string,
  scope?: string
): Promise<ReportRecord> {
  const record: ReportRecord = {
    id: `rpt-${Date.now()}`,
    targetType,
    targetId,
    reason,
    note,
    createdAt: new Date().toISOString(),
  };
  try {
    const key = scopedKey(REPORT_KEY, scope);
    const raw = await AsyncStorage.getItem(key);
    const list: ReportRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    await AsyncStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* local only */
  }
  return record;
}
