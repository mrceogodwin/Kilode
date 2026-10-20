/**
 * Dedicated Kilode native backend client (Supabase).
 *
 * - Uses only the anon / publishable key.
 * - Never import or embed the service_role key.
 * - Returns null when EXPO_PUBLIC_SUPABASE_* is not configured.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPABASE_URL, SUPABASE_ANON_KEY, getBackendMode } from "./config";
import type { AccountKind } from "./accountKinds";

export type ProfileRow = {
  id: string;
  handle: string;
  display_name: string;
  kind: AccountKind;
  role: "user" | "moderator" | "super_admin";
  bio: string | null;
  avatar_url: string | null;
};

let client: SupabaseClient | null | undefined;

/** Singleton client, or null if backend mode is not supabase. */
export function getSupabase(): SupabaseClient | null {
  if (getBackendMode() !== "supabase") return null;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (client === undefined) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export function isSupabaseReady(): boolean {
  return getSupabase() != null;
}

export async function fetchOwnProfile(userId: string): Promise<ProfileRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

export async function listRecentPosts(limit = 40): Promise<{ ok: boolean; data: any[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "supabase not configured" };
  const { data, error } = await sb
    .from("posts")
    .select("id, body, media_url, created_at, author:profiles(handle, display_name, kind)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, data: [], error: error.message };
  const rows = (data || []).map((row: any) => ({
    id: row.id,
    text: row.body,
    body: row.body,
    mediaUrl: row.media_url,
    name: row.author?.display_name || "Member",
    handle: row.author?.handle || "member",
    time: row.created_at,
    role: row.author?.kind || "member",
    likes: 0,
    comments: 0,
    reposts: 0,
  }));
  return { ok: true, data: rows };
}

export async function createPost(body: string, userId: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase not configured" };
  const { data, error } = await sb
    .from("posts")
    .insert({ body, author_id: userId })
    .select("id, body, media_url, created_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    data: {
      id: data.id,
      text: data.body,
      body: data.body,
      mediaUrl: data.media_url,
      time: data.created_at,
      name: "You",
      handle: "you",
      likes: 0,
      comments: 0,
      reposts: 0,
    },
  };
}
