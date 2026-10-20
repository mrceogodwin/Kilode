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

export async function listRecentPosts(limit = 40, userId?: string): Promise<{ ok: boolean; data: any[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "supabase not configured" };
  const { data, error } = await sb
    .from("posts")
    .select("id, body, media_url, created_at, author:profiles(handle, display_name, kind)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, data: [], error: error.message };

  const postIds = (data || []).map((row: any) => String(row.id));
  const likesByPost = new Map<string, number>();
  const commentsByPost = new Map<string, number>();
  const likedByMe = new Set<string>();
  if (postIds.length) {
    const [likesResult, repliesResult] = await Promise.all([
      sb.from("post_likes").select("post_id,user_id").in("post_id", postIds),
      sb.from("post_replies").select("post_id").in("post_id", postIds),
    ]);
    if (likesResult.error) return { ok: false, data: [], error: likesResult.error.message };
    if (repliesResult.error) return { ok: false, data: [], error: repliesResult.error.message };
    for (const like of likesResult.data || []) {
      const postId = String(like.post_id);
      likesByPost.set(postId, (likesByPost.get(postId) || 0) + 1);
      if (userId && String(like.user_id) === userId) likedByMe.add(postId);
    }
    for (const reply of repliesResult.data || []) {
      const postId = String(reply.post_id);
      commentsByPost.set(postId, (commentsByPost.get(postId) || 0) + 1);
    }
  }

  const rows = (data || []).map((row: any) => ({
    id: row.id,
    text: row.body,
    body: row.body,
    mediaUrl: row.media_url,
    name: row.author?.display_name || "Member",
    handle: row.author?.handle || "member",
    time: row.created_at,
    role: row.author?.kind || "member",
    likes: Math.max(0, (likesByPost.get(String(row.id)) || 0) - (likedByMe.has(String(row.id)) ? 1 : 0)),
    likedByMe: likedByMe.has(String(row.id)),
    comments: commentsByPost.get(String(row.id)) || 0,
    reposts: 0,
  }));
  return { ok: true, data: rows };
}

export async function listPostReplies(postId: string): Promise<{ ok: boolean; data: any[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "Supabase is not configured." };
  const { data, error } = await sb.from("post_replies")
    .select("id, post_id, body, created_at, author:profiles(handle, display_name)")
    .eq("post_id", postId).order("created_at", { ascending: true }).limit(200);
  if (error) return { ok: false, data: [], error: error.message };
  return { ok: true, data: (data || []).map((row: any) => ({
    id: String(row.id), takeId: String(row.post_id), text: row.body,
    name: row.author?.display_name || row.author?.handle || "Member",
    time: row.created_at,
  })) };
}

export async function createPostReply(postId: string, body: string, userId: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  const sb = getSupabase();
  const normalizedBody = body.trim();
  if (!sb) return { ok: false, error: "Supabase is not configured." };
  if (!postId || !userId) return { ok: false, error: "Sign in to your live Kilode account to comment." };
  if (!normalizedBody) return { ok: false, error: "Write a comment first." };
  const { data, error } = await sb.from("post_replies")
    .insert({ post_id: postId, author_id: userId, body: normalizedBody })
    .select("id, post_id, body, created_at, author:profiles(handle, display_name)").single();
  if (error) return { ok: false, error: error.message };
  const author = Array.isArray(data.author) ? data.author[0] : data.author;
  return { ok: true, data: {
    id: String(data.id), takeId: String(data.post_id), text: data.body,
    name: author?.display_name || author?.handle || "You", time: data.created_at,
  } };
}

export async function togglePostLike(postId: string, userId: string): Promise<{ ok: boolean; liked?: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase is not configured." };
  if (!postId || !userId) return { ok: false, error: "Sign in to like posts." };

  const { data: existing, error: readError } = await sb
    .from("post_likes").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  if (readError) return { ok: false, error: readError.message };

  if (existing) {
    const { error } = await sb.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, liked: false };
  }

  const { error } = await sb.from("post_likes").insert({ post_id: postId, user_id: userId });
  if (error) return { ok: false, error: error.message };
  return { ok: true, liked: true };
}

/** Read-only catalogue queries used by the shared Home discovery feed and each system screen. */
async function listRows(
  table: string,
  columns: string,
  orderColumn = "created_at",
  limit = 40
): Promise<{ ok: boolean; data: any[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "supabase not configured" };
  const { data, error } = await sb.from(table).select(columns).order(orderColumn, { ascending: false }).limit(limit);
  if (error) return { ok: false, data: [], error: error.message };
  return { ok: true, data: (data || []) as any[] };
}

export async function listRecentArticles() {
  const r = await listRows("articles", "id, title, kicker, body, image_url, published_at, created_at");
  if (!r.ok) return r;
  return { ok: true, data: r.data.map((row: any) => ({
    id: row.id, title: row.title, kicker: row.kicker || "Media", body: row.body || "",
    imageUrl: row.image_url || undefined, time: row.published_at || row.created_at, createdAt: row.created_at,
    author: "Kilode Editorial", previewOnly: false,
  })) };
}

export async function listRecentTracks() {
  const r = await listRows("tracks", "id, title, artist_name, cover_url, audio_url, created_at");
  if (!r.ok) return r;
  return { ok: true, data: r.data.map((row: any) => ({
    id: row.id, title: row.title, artist: row.artist_name, imageUrl: row.cover_url || undefined,
    previewUrl: row.audio_url || undefined, createdAt: row.created_at, previewOnly: false,
  })) };
}

export async function listRecentEvents() {
  const r = await listRows("events", "id, title, venue, starts_at, price_label, created_at");
  if (!r.ok) return r;
  return { ok: true, data: r.data.map((row: any) => ({
    id: row.id, title: row.title, meta: [row.venue, row.starts_at].filter(Boolean).join(" · ") || "Details to be confirmed",
    price: row.price_label || "See details", tag: "Event", category: "All", date: row.starts_at || undefined, createdAt: row.created_at,
    previewOnly: false,
  })) };
}

export async function listRecentMarketListings() {
  const r = await listRows("market_listings", "id, title, category, price_label, created_at");
  if (!r.ok) return r;
  return { ok: true, data: r.data.map((row: any) => ({
    id: row.id, title: row.title, price: row.price_label || "Price on request",
    category: row.category || "Other", createdAt: row.created_at, previewOnly: false,
  })) };
}

export async function listRecentJobs() {
  const r = await listRows("jobs", "id, title, location_label, salary_label, created_at");
  if (!r.ok) return r;
  return { ok: true, data: r.data.map((row: any) => ({
    id: row.id, title: row.title, company: "Employer not specified",
    location: row.location_label || "Location not specified", type: "Not specified",
    salary: row.salary_label || "Salary not specified", color: "#E6A94A", createdAt: row.created_at, previewOnly: false,
  })) };
}

export async function createPost(body: string, userId: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase not configured" };
  const normalizedBody = body.trim();
  if (!normalizedBody) return { ok: false, error: "Write something before posting." };
  if (!userId) return { ok: false, error: "Sign in before posting." };

  const { data, error } = await sb
    .from("posts")
    .insert({ body: normalizedBody, author_id: userId })
    .select("id, body, media_url, created_at, author:profiles(handle, display_name, kind)")
    .single();
  if (error) return { ok: false, error: error.message };
  const author = Array.isArray(data.author) ? data.author[0] : data.author;
  return {
    ok: true,
    data: {
      id: data.id,
      text: data.body,
      body: data.body,
      mediaUrl: data.media_url,
      time: data.created_at,
      name: author?.display_name || "Member",
      handle: author?.handle || "member",
      role: author?.kind || "member",
      likes: 0,
      comments: 0,
      reposts: 0,
    },
  };
}
