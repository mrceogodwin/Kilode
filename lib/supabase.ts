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
    likes: likesByPost.get(String(row.id)) || 0,
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

/** Update only the signed-in user's editable profile fields. Authority fields are never accepted here. */
export async function updateOwnProfile(
  userId: string,
  input: { handle: string; display_name: string; bio: string | null }
): Promise<{ ok: boolean; data?: ProfileRow; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase is not configured." };
  if (!userId) return { ok: false, error: "Sign in to update your live profile." };
  const handle = input.handle.trim().replace(/^@/, "").toLowerCase();
  const display_name = input.display_name.trim();
  const bio = input.bio?.trim() || null;
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) {
    return { ok: false, error: "Handle must be 3–30 characters using letters, numbers, or underscores." };
  }
  if (display_name.length < 2 || display_name.length > 60) {
    return { ok: false, error: "Display name must be 2–60 characters." };
  }
  if (bio && bio.length > 160) return { ok: false, error: "Bio must be 160 characters or fewer." };
  const { data, error } = await sb.from("profiles")
    .update({ handle, display_name, bio })
    .eq("id", userId)
    .select("id, handle, display_name, kind, role, bio, avatar_url")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as ProfileRow };
}

/** Public artist catalogue. Only profile fields safe for discovery are selected. */
export async function listArtistProfiles(limit = 40): Promise<{ ok: boolean; data: ProfileRow[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "Kilode's artist catalogue is not configured yet." };
  const { data, error } = await sb.from("profiles")
    .select("id, handle, display_name, kind, role, bio, avatar_url")
    .eq("kind", "artist")
    .order("display_name", { ascending: true })
    .limit(Math.max(1, Math.min(limit, 100)));
  if (error) return { ok: false, data: [], error: error.message };
  return { ok: true, data: (data || []) as ProfileRow[] };
}

/** Read the signed-in user's follow state for an artist profile. */
export async function isFollowingArtist(followerId: string, artistId: string): Promise<{ ok: boolean; following: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, following: false, error: "Artist following requires the Kilode backend." };
  if (!followerId || !artistId) return { ok: false, following: false, error: "Sign in to follow artists." };
  const { data, error } = await sb.from("artist_follows")
    .select("artist_id")
    .eq("follower_id", followerId)
    .eq("artist_id", artistId)
    .maybeSingle();
  if (error) return { ok: false, following: false, error: error.message };
  return { ok: true, following: Boolean(data) };
}

/** Toggle a persisted follow. RLS verifies the caller and that the target is an artist. */
export async function toggleArtistFollow(followerId: string, artistId: string): Promise<{ ok: boolean; following?: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Artist following requires the Kilode backend." };
  if (!followerId || !artistId) return { ok: false, error: "Sign in to follow artists." };
  if (followerId === artistId) return { ok: false, error: "You cannot follow your own artist profile." };

  const { data: existing, error: readError } = await sb.from("artist_follows")
    .select("artist_id")
    .eq("follower_id", followerId)
    .eq("artist_id", artistId)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };

  if (existing) {
    const { error } = await sb.from("artist_follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("artist_id", artistId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, following: false };
  }

  const { error } = await sb.from("artist_follows").insert({ follower_id: followerId, artist_id: artistId });
  if (error) return { ok: false, error: error.message };
  return { ok: true, following: true };
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


/** Create a private metadata-only release draft. Audio upload is a separate step. */
export async function createMusicReleaseDraft(
  artistId: string,
  input: { title: string; releaseType: "single" | "ep" | "album" }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const sb = getSupabase();
  const title = input.title.trim();
  if (!sb) return { ok: false, error: "Kilode Music backend is not configured." };
  if (!artistId) return { ok: false, error: "Sign in to your artist account first." };
  if (title.length < 1 || title.length > 120) return { ok: false, error: "Release title must be 1–120 characters." };
  const { data, error } = await sb
    .from("music_releases")
    .insert({ artist_id: artistId, title, release_type: input.releaseType, status: "draft" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: String(data.id) };
}

/** Upload a selected audio file to private storage and attach it to an owned draft. */
export async function uploadMusicReleaseAudio(
  artistId: string,
  releaseId: string,
  asset: { uri: string; name: string; mimeType?: string | null; size?: number | null }
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Kilode Music backend is not configured." };
  if (!artistId || !releaseId) return { ok: false, error: "Sign in and create a release draft first." };
  if (!asset.uri) return { ok: false, error: "Choose an audio file first." };
  if (asset.size && asset.size > 100 * 1024 * 1024) return { ok: false, error: "Audio files must be 100 MB or smaller." };

  const safeName = asset.name.trim().replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "track-audio";
  const path = `${artistId}/${releaseId}/${Date.now()}-${safeName}`;
  try {
    const response = await fetch(asset.uri);
    if (!response.ok) return { ok: false, error: "Could not read the selected audio file." };
    const fileData = await response.arrayBuffer();
    const contentType = asset.mimeType || "audio/mpeg";
    const { error: uploadError } = await sb.storage.from("kilode-music-audio").upload(path, fileData, {
      contentType,
      upsert: false,
    });
    if (uploadError) return { ok: false, error: uploadError.message };

    const { data: updated, error: updateError } = await sb.from("music_releases")
      .update({ audio_path: path })
      .eq("id", releaseId)
      .eq("artist_id", artistId)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();
    if (updateError || !updated) {
      await sb.storage.from("kilode-music-audio").remove([path]);
      return { ok: false, error: updateError?.message || "This release is no longer an editable draft." };
    }
    return { ok: true, path };
  } catch {
    return { ok: false, error: "Audio upload failed. Check your connection and try again." };
  }
}

/** Submit an uploaded release for trusted review; the client cannot publish it. */
export async function submitMusicReleaseForReview(
  artistId: string,
  releaseId: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Kilode Music backend is not configured." };
  if (!artistId || !releaseId) return { ok: false, error: "Sign in to your artist account first." };
  const { data: release, error: readError } = await sb.from("music_releases")
    .select("id, audio_path, status")
    .eq("id", releaseId)
    .eq("artist_id", artistId)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  if (!release) return { ok: false, error: "Release not found or you do not own it." };
  if (release.status !== "draft") return { ok: false, error: "Only a draft can be submitted." };
  if (!release.audio_path) return { ok: false, error: "Attach the audio file before submitting this release." };

  const { data: updated, error: updateError } = await sb.from("music_releases")
    .update({ status: "submitted" })
    .eq("id", releaseId)
    .eq("artist_id", artistId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, error: updateError.message };
  if (!updated) return { ok: false, error: "Could not submit this draft. Refresh and try again." };
  return { ok: true };
}

/** List only the signed-in artist's own release drafts and submissions. */
export async function listOwnMusicReleases(artistId: string): Promise<{ ok: boolean; data: any[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "Kilode Music backend is not configured." };
  if (!artistId) return { ok: false, data: [], error: "Sign in to your artist account first." };
  const { data, error } = await sb
    .from("music_releases")
    .select("id, title, release_type, status, cover_url, audio_path, created_at, updated_at")
    .eq("artist_id", artistId)
    .order("updated_at", { ascending: false })
    .limit(30);
  if (error) return { ok: false, data: [], error: error.message };
  return { ok: true, data: data || [] };
}



/** List the signed-in artist's support pages. Payment records remain server-controlled. */
export async function listOwnSupportPages(artistId: string): Promise<{ ok: boolean; data: any[]; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: [], error: "Kilode support backend is not configured." };
  if (!artistId) return { ok: false, data: [], error: "Sign in to your artist account first." };
  try {
    const { data, error } = await sb.from("support_pages")
      .select("id, title, message, currency, status, created_at")
      .eq("recipient_id", artistId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return { ok: false, data: [], error: error.message };
    return { ok: true, data: data || [] };
  } catch {
    return { ok: false, data: [], error: "Could not load support pages. Check your connection and retry." };
  }
}

/** Create an artist support page. This does not initiate or confirm a payment. */
export async function createArtistSupportPage(
  artistId: string,
  input: { title?: string; message?: string; currency?: string }
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Kilode support backend is not configured." };
  if (!artistId) return { ok: false, error: "Sign in to your artist account first." };
  const title = (input.title || "Support my music").trim();
  const message = (input.message || "If you enjoy my music, you can support my work here. Support is voluntary.").trim();
  const currency = (input.currency || "NGN").toUpperCase();
  if (title.length < 2 || title.length > 100) return { ok: false, error: "Support page title must be 2–100 characters." };
  if (message.length > 500) return { ok: false, error: "Support message must be 500 characters or fewer." };
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, error: "Use a valid three-letter currency code." };
  try {
    const { data, error } = await sb.from("support_pages")
      .insert({ recipient_id: artistId, title, message, currency, status: "draft" })
      .select("id, title, message, currency, status, created_at")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not create your support page. Check your connection and retry." };
  }
}
