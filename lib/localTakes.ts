/**
 * Device-local Socials posts when the dedicated API is unavailable.
 * Never presented as live server data.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@kilode/local_takes_v1";

export type LocalTake = {
  id: string;
  text: string;
  body: string;
  name: string;
  handle: string;
  time: string;
  role: string;
  likes: number;
  comments: number;
  reposts: number;
  tags: string[];
  factPct: number;
  createdAt: string;
  /** Explicit marker for UI honesty */
  localOnly: true;
  media?: boolean;
  mediaUrl?: string;
};

export async function loadLocalTakes(): Promise<LocalTake[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.id === "string" && typeof x.text === "string");
  } catch {
    return [];
  }
}

export async function saveLocalTake(input: {
  text: string;
  name?: string;
  handle?: string;
  role?: string;
}): Promise<LocalTake> {
  const text = String(input.text || "").trim();
  const take: LocalTake = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    body: text,
    name: (input.name || "You").trim() || "You",
    handle: (input.handle || "you").trim().replace(/^@/, "") || "you",
    time: "just now",
    role: input.role || "member",
    likes: 0,
    comments: 0,
    reposts: 0,
    tags: ["take"],
    factPct: 50,
    createdAt: new Date().toISOString(),
    localOnly: true,
  };
  const existing = await loadLocalTakes();
  const next = [take, ...existing].slice(0, 100);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return take;
}

export async function mergeTakesWithLocal(remoteOrSeed: any[]): Promise<any[]> {
  const local = await loadLocalTakes();
  const remoteIds = new Set((remoteOrSeed || []).map((t) => String(t?.id)));
  const extras = local.filter((t) => !remoteIds.has(String(t.id)));
  // Local device posts first so a just-published take is visible immediately.
  return [...extras, ...(remoteOrSeed || [])];
}
