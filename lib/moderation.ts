/**
 * Local-only report / block store (AsyncStorage).
 * This is a development fallback, not production moderation: reports are
 * not delivered to staff and blocks are not enforced across devices.
 * Production requires authenticated server-side report queues and block rules.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const BLOCK_KEY = "@kilode/blocked_users";
const REPORT_KEY = "@kilode/reports";

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

export async function getBlockedUsers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function blockUser(handle: string): Promise<void> {
  const list = await getBlockedUsers();
  if (!list.includes(handle)) {
    list.push(handle);
    await AsyncStorage.setItem(BLOCK_KEY, JSON.stringify(list));
  }
}

export async function unblockUser(handle: string): Promise<void> {
  const list = (await getBlockedUsers()).filter((h) => h !== handle);
  await AsyncStorage.setItem(BLOCK_KEY, JSON.stringify(list));
}

export async function submitReport(
  targetType: ReportRecord["targetType"],
  targetId: string,
  reason: ReportReason,
  note?: string
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
    const raw = await AsyncStorage.getItem(REPORT_KEY);
    const list: ReportRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    await AsyncStorage.setItem(REPORT_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* local only */
  }
  return record;
}
