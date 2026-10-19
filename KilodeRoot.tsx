import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Share,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Platform,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, LISTINGS, STORIES, TAKES, ROOMS, NEWS, TRACKS, ACTIVITY } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { AuthScreen } from "./screens/Auth";
import { KilodeWordmark } from "./components/KilodeWordmark";
import { MediaScreen } from "./screens/Media";
import { SettingsScreen } from "./screens/Settings";
import { DeskDetailScreen } from "./screens/DeskDetail";
import { UserProfileScreen } from "./screens/UserProfile";
import { PostDetailScreen } from "./screens/PostDetail";
import { CommentsSheet } from "./screens/Comments";
import { KilodeTabBar } from "./components/ui";
import { Ionicons } from "@expo/vector-icons";
import { PostActions } from "./components/ui/PostActions";
import { SectionHeader } from "./components/ui/SectionHeader";
import { EmptyState } from "./components/ui/EmptyState";
import { ConnectionBanner } from "./components/ui/ConnectionBanner";
import { blockUser, submitReport, getBlockedUsers } from "./lib/moderation";

const SYSTEM_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  "💼": "briefcase-outline",
  "🛍️": "bag-handle-outline",
  "🏠": "home-outline",
  "📅": "calendar-outline",
  "🎬": "film-outline",
  "🎵": "musical-notes-outline",
  "💬": "chatbubble-ellipses-outline",
  "📢": "megaphone-outline",
  "📚": "book-outline",
  "⚽": "football-outline",
  "💻": "laptop-outline",
  "▶️": "play-circle-outline",
  "✏️": "create-outline",
};
const systemIconName = (emoji: string): keyof typeof Ionicons.glyphMap =>
  SYSTEM_ICON[emoji] || "apps-outline";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  // The web preview defaults to the same welcome screen as iOS.
  // Keep the unauthenticated welcome screen independent of feed loading; the feed is not needed to render onboarding.
  // Add ?preview=home when a reviewer explicitly wants to jump into the seeded home feed.
  useEffect(() => {
    const homePreview = Platform.OS === "web" &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("preview") === "home";
    if (homePreview && !authLoading && !session) signInGuest("Guest");
  }, [authLoading, session, signInGuest]);
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (system === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

  const [tab, setTab] = useState("home");
  const [homeChip, setHomeChip] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentTake, setCommentTake] = useState<any | null>(null);
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [boot, setBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<"live" | "mock" | "error">("mock");
  const [takes, setTakes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedDeskItem, setSelectedDeskItem] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayHandle, setDisplayHandle] = useState("");
  const [displayBio, setDisplayBio] = useState("");
  const [profileName, setProfileName] = useState(session?.name || "");
  const [profileHandle, setProfileHandle] = useState(session?.handle || "");
  const [profileBio, setProfileBio] = useState("");
  const [blocked, setBlocked] = useState<string[]>([]);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false); setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null);
  };

  const loadAll = useCallback(async () => {
    const [t, r, n, tr, a] = await Promise.all([fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity(session?.token)]);
    // The old Kilode Nine page currently server-renders “No posts yet”, and its mobile
    // bridge is not connected to this preview. Use the actual in-repo demo dataset on web
    // so the preview never looks empty; on iOS prefer API data but safely fall back if empty.
    const previewWeb = Platform.OS === "web";
    // Only the explicit web design preview uses seed content. Native iOS must
    // never disguise an API failure or empty database as real user activity.
    setTakes(previewWeb ? TAKES : Array.isArray(t.data) ? t.data : []);
    setRooms(previewWeb ? ROOMS : Array.isArray(r.data) ? r.data : []);
    setNews(previewWeb ? NEWS : Array.isArray(n.data) ? n.data : []);
    setTracks(previewWeb ? TRACKS : Array.isArray(tr.data) ? tr.data : []);
    setActivity(previewWeb ? ACTIVITY : Array.isArray(a.data) ? a.data : []);
    const sources = [t, r, n, tr].map((x) => x.source);
    const nextSource: "live" | "mock" | "error" = previewWeb
      ? "mock"
      : sources.every((value) => value === "live")
        ? "live"
        : sources.some((value) => value === "error")
          ? "error"
          : "live";
    setSource(nextSource);
    return nextSource;
  }, [session?.token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await getBlockedUsers();
      if (!cancelled) setBlocked(b);
      await loadAll();
      if (!cancelled) setBoot(false);
    })();
    return () => { cancelled = true; };
  }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await loadAll();
      show(result === "error"
        ? "Some Kilode services are unavailable. Try again shortly."
        : result === "mock"
          ? "Preview content refreshed"
          : "Refreshed");
    } catch {
      show("Could not refresh Kilode. Check your connection and try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || (session && boot)) {
    return (
      <SafeAreaView style={[s.root, s.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.accent} size="large" />
        <Text style={[s.sub, { marginTop: 12 }]}>Loading Kilode…</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        isDark={isDark}
        C={C}
        onSignIn={signIn}
        onSignUp={signUp}
        onGuest={() => { signInGuest("Guest"); show("Guest mode"); }}
        onGoogle={() => { show("Google sign-in isn't connected yet."); }}
        show={show}
      />
    );
  }

  const Header = ({ title }: { title?: string }) => (
    <View style={s.header}>
      <View style={s.headerLeft}>
        {title ? (
          <Text style={s.headerTitle}>{title}</Text>
        ) : (
          <KilodeWordmark size="small" />
        )}
      </View>
      <View style={s.headerRight}>
<TouchableOpacity style={s.iconBtn} onPress={() => setThemeMode(isDark ? "light" : "dark")}>
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={C.text} />
        </TouchableOpacity>
        <TouchableOpacity style={s.avatar} onPress={() => go("myspace")}>
          <Text style={s.avatarText}>{(session.name || "K").slice(0, 1).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;

  const Home = () => (
    <ScrollView style={s.flex} contentContainerStyle={[s.scrollPad, { paddingBottom: 28 }]} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={[s.padH, { paddingTop: 10, paddingBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }]}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.7 }}>Discover</Text>
          
        </View>
        <TouchableOpacity activeOpacity={0.72} onPress={() => setMoreOpen(true)} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingBottom: 3 }}>
          <Text style={{ fontSize: 13, color: C.accent, fontWeight: "700" }}>Explore</Text>
          <Ionicons name="arrow-forward" size={15} color={C.accent} />
        </TouchableOpacity>
      </View>

      {(() => {
        const workspaces: Record<string, { title: string; description: string; tab: string; action: string }> = {
          artist: { title: "Artist Studio", description: "Your music, releases and artist presence.", tab: "music", action: "Open studio" },
          writer: { title: "Writer Desk", description: "Stories, articles and editorial work.", tab: "media", action: "Open desk" },
          cinema: { title: "Cinema Studio", description: "Manage your film submissions and cinema presence.", tab: "cinema", action: "Open studio" },
          advertiser: { title: "Campaign Desk", description: "Promote a business and manage your ad presence.", tab: "ads", action: "Open campaigns" },
          brand: { title: "Business Hub", description: "Your business presence, campaigns and listings.", tab: "ads", action: "Open hub" },
          job_poster: { title: "Hiring Desk", description: "Create roles and manage applicants.", tab: "jobs", action: "Manage jobs" },
          job_seeker: { title: "Career Space", description: "Explore roles and move your job search forward.", tab: "jobs", action: "Find jobs" },
          vendor: { title: "Seller Hub", description: "Showcase products in Kilode Market.", tab: "market", action: "Open market" },
          renter: { title: "Space Listings", description: "Manage rent, property and space listings.", tab: "rent", action: "Open listings" },
        };
        const workspace = workspaces[String(session.kind || "member")];
        if (!workspace) return null;
        return (
          <View style={[s.roomRow, { marginHorizontal: 14, marginBottom: 12, borderColor: C.border, alignItems: "center" }]}>
            <View style={s.flex}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "800" }}>{workspace.title}</Text>
              <Text style={[s.meta, { marginTop: 3 }]}>{workspace.description}</Text>
            </View>
            <TouchableOpacity style={s.joinBtn} onPress={() => go(workspace.tab)}>
              <Text style={s.joinBtnText}>{workspace.action}</Text>
            </TouchableOpacity>
          </View>
        );
      })()}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.storyRow, { paddingTop: 2, paddingBottom: 14 }]}>
        {STORIES.map((st) => (
          <TouchableOpacity key={st.id} activeOpacity={0.72} style={s.story} onPress={() => st.id === "s0" ? setComposeOpen(true) : setSelectedProfile({ name: st.label, handle: st.label.toLowerCase(), role: "Kilode member" })}>
            <View style={[s.storyRing, { borderColor: st.id === "s0" ? C.border : C.accent, borderWidth: st.id === "s0" ? 1 : 2 }]}>
              <View style={s.storyInner}>{st.avatarUrl ? <Image source={{ uri: st.avatarUrl }} style={{ width: 42, height: 42, borderRadius: 21 }} resizeMode="cover" /> : <Ionicons name="add" size={22} color={C.accent} />}</View>
            </View>
            <Text style={s.storyLabel} numberOfLines={1}>{st.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.chipsRow, { paddingTop: 4, paddingBottom: 14 }]}>
        {["For you", "Trending", "Rooms", "News"].map((c, i) => (
          <TouchableOpacity key={c} activeOpacity={0.72} style={[s.chip, homeChip === i && s.chipOn, { backgroundColor: homeChip === i ? C.accentSoft : "transparent", borderColor: homeChip === i ? C.accent : "transparent" }]} onPress={() => setHomeChip(i)}>
            <Text style={[s.chipText, homeChip === i && s.chipTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {(homeChip === 0 || homeChip === 3) && news[0] ? (
        <View style={{ marginBottom: 22 }}>
          <View style={[s.sectionHead, { marginTop: 0, marginBottom: 10 }]}>
            <Text style={s.sectionTitle}>The latest</Text>
            <TouchableOpacity activeOpacity={0.72} onPress={() => { setSelectedArticleId(null); go("media"); }}><Text style={s.link}>All stories <Ionicons name="arrow-forward" size={12} /></Text></TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.9} onPress={() => { setSelectedArticleId(String(news[0].id)); go("media"); }} style={{ marginHorizontal: 16, overflow: "hidden", borderRadius: 18, backgroundColor: C.card }}>
            {news[0].imageUrl ? <Image source={{ uri: news[0].imageUrl }} style={{ width: "100%", height: 164, backgroundColor: C.elevated }} resizeMode="cover" /> : <View style={{ height: 164, backgroundColor: C.elevated }} />}
            <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 15 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>{String(news[0].kicker || "MEDIA").toUpperCase()}  ·  {news[0].time || "LATEST"}</Text>
              <Text style={{ color: C.text, fontSize: 17, lineHeight: 22, fontWeight: "800", letterSpacing: -0.3, marginTop: 6 }} numberOfLines={3}>{news[0].title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 11 }}>
                <Text style={{ color: C.text2, fontSize: 11 }}>Kilode Media</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="arrow-forward" size={18} color={C.accent} />
              </View>
            </View>
          </TouchableOpacity>
          {news.slice(1, 3).map((n: any) => (
            <TouchableOpacity key={n.id} activeOpacity={0.78} onPress={() => { setSelectedArticleId(String(n.id)); go("media"); }} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginTop: 12 }}>
              {n.imageUrl ? <Image source={{ uri: n.imageUrl }} style={{ width: 84, height: 72, borderRadius: 10, backgroundColor: C.elevated }} resizeMode="cover" /> : <View style={{ width: 84, height: 72, borderRadius: 10, backgroundColor: C.elevated }} />}
              <View style={{ flex: 1, paddingVertical: 3 }}>
                <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }}>{String(n.kicker || "MEDIA").toUpperCase()} · {n.time}</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 5 }} numberOfLines={3}>{n.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {(homeChip === 0 || homeChip === 1) && (
        <View style={{ marginBottom: 22 }}>
          <View style={[s.sectionHead, { marginTop: 0, marginBottom: 12 }]}>
            <Text style={s.sectionTitle}>{homeChip === 1 ? "People are talking" : "Music for your mood"}</Text>
            <TouchableOpacity activeOpacity={0.72} onPress={() => go(homeChip === 1 ? "socials" : "music")}><Text style={s.link}>{homeChip === 1 ? "Socials" : "See all"} <Ionicons name="arrow-forward" size={12} /></Text></TouchableOpacity>
          </View>
          {homeChip === 1 ? takes.slice().sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0)).slice(0, 3).map((t: any) => (
            <TouchableOpacity key={t.id} activeOpacity={0.78} onPress={() => go("socials")} style={{ flexDirection: "row", alignItems: "flex-start", gap: 11, paddingHorizontal: 16, paddingVertical: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, overflow: "hidden", backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>{t.avatarUrl ? <Image source={{ uri: t.avatarUrl }} style={{ width: 38, height: 38 }} /> : <Text style={{ color: C.text, fontWeight: "700" }}>{(t.name || "?").slice(0,1)}</Text>}</View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>{t.name} <Text style={{ color: C.text3, fontWeight: "400" }}>· {t.time}</Text></Text>
                <Text style={{ color: C.text2, fontSize: 14, lineHeight: 20, marginTop: 4 }} numberOfLines={3}>{t.text}</Text>
              </View>
              <Ionicons name="heart-outline" size={17} color={C.text3} />
            </TouchableOpacity>
          )) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {tracks.slice(0, 5).map((t: any, i: number) => (
                <TouchableOpacity key={t.id} activeOpacity={0.82} onPress={() => { setNowPlaying(t); show(`Selected ${t.title}. Audio playback is not connected in this preview yet.`); }} style={{ width: 138 }}>
                  <View style={{ height: 138, borderRadius: 14, overflow: "hidden", backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ position: "absolute", width: 108, height: 108, borderRadius: 54, borderWidth: 1, borderColor: "rgba(255,255,255,0.24)" }} />
                    <View style={{ position: "absolute", width: 78, height: 78, borderRadius: 39, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" }} />
                    <Ionicons name="musical-notes" size={30} color="rgba(255,255,255,0.92)" />
                    <View style={{ position: "absolute", right: 9, bottom: 9, width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}><Ionicons name="play" size={14} color={C.text} /></View>
                  </View>
                  <Text style={{ color: C.text, fontSize: 13, fontWeight: "700", marginTop: 8 }} numberOfLines={1}>{t.title}</Text>
                  <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{t.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {(homeChip === 0 || homeChip === 2) && (
        <View style={{ marginBottom: 18 }}>
          <View style={[s.sectionHead, { marginTop: 0, marginBottom: 8 }]}>
            <Text style={s.sectionTitle}>Rooms worth joining</Text>
            <TouchableOpacity activeOpacity={0.72} onPress={() => go("chat")}><Text style={s.link}>All rooms <Ionicons name="arrow-forward" size={12} /></Text></TouchableOpacity>
          </View>
          {rooms.slice(0, 3).map((r: any) => {
            const isJoined = !!joined[r.id];
            return (
              <TouchableOpacity key={r.id} activeOpacity={0.78} onPress={() => setDetailItem({ title: r.name, meta: r.meta, description: `${r.live ? `${r.speaking || 0} people speaking. ` : ""}This is a preview room. Live audio and room messaging are not connected yet.` })} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 11 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 13, color: C.text, fontWeight: "800" }}>{r.av}</Text>
                  {r.live ? <View style={{ position: "absolute", width: 8, height: 8, borderRadius: 4, right: -1, top: -1, backgroundColor: C.accent, borderWidth: 1, borderColor: C.bg }} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>{r.name}</Text>
                  <Text style={{ color: C.text2, fontSize: 12, marginTop: 3 }}>{r.live ? `${r.speaking || 0} speaking · ` : ""}{r.meta}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.72} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 18, backgroundColor: isJoined ? C.accentSoft : C.elevated }} onPress={() => { setJoined({ ...joined, [r.id]: !isJoined }); show(isJoined ? `Left ${r.name}` : `Joined ${r.name}`); }}>
                  <Text style={{ color: isJoined ? C.accent : C.text, fontSize: 12, fontWeight: "700" }}>{isJoined ? "Joined" : "Join"}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      <View style={{ marginHorizontal: 16, paddingTop: 4, paddingBottom: 12 }}>
        <Text style={{ color: C.text3, fontSize: 10, letterSpacing: 0.5 }}>PREVIEW</Text>
      </View>
    </ScrollView>
  );
  const Socials = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.composer}>
        <View style={s.composerAv}><Text style={s.avatarText}>{(session.name || "K").slice(0, 1)}</Text></View>
        <TouchableOpacity style={s.composerInput} onPress={() => setComposeOpen(true)}><Text style={s.composerPlaceholder}>What is happening in Naija?</Text></TouchableOpacity>
        <TouchableOpacity style={s.postBtn} onPress={() => setComposeOpen(true)}><Text style={s.postBtnText}>Post</Text></TouchableOpacity>
      </View>
      {takes.length === 0 ? (
        <EmptyState
          title="No takes yet"
          body="Be the first to post what’s happening in Naija."
          actionLabel="Create a take"
          onAction={() => setComposeOpen(true)}
          icon="chatbubbles-outline"
          textColor={C.text}
          mutedColor={C.text2}
          accentColor={C.accent}
        />
      ) : null}
      {takes.filter((t: any) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || ""))).map((t: any) => (
        <View key={t.id} style={s.postCard}>
          <View style={s.postTop}>
            <TouchableOpacity activeOpacity={0.72} onPress={() => setSelectedProfile(t)} accessibilityRole="button"><View style={s.postAv}>{t.avatarUrl ? <Image source={{ uri: t.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} /> : <Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text>}</View></TouchableOpacity>
            <TouchableOpacity style={s.flex} onPress={() => setSelectedProfile(t)} accessibilityRole="button">
              <View style={s.row}><Text style={s.postName}>{t.name}</Text>{t.verified ? <Text style={s.verified}>✓</Text> : null}</View>
              <Text style={s.meta}>@{t.handle} · {t.time} · {t.role}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.followBtn} onPress={() => { setFollowing((prev) => ({ ...prev, [String(t.handle || t.name)]: !prev[String(t.handle || t.name)] })); show(following[String(t.handle || t.name)] ? `Unfollowed ${t.name}` : `Following ${t.name}`); }}><Text style={s.followBtnText}>{following[String(t.handle || t.name)] ? "Following" : "Follow"}</Text></TouchableOpacity>
          </View>
          <Text style={s.postBody}>{t.text}</Text>
          {t.mediaUrl ? (
            <Image source={{ uri: t.mediaUrl }} style={s.postMedia as import("react-native").ImageStyle} resizeMode="cover" />
          ) : t.media ? (
            <View style={[s.postMedia, { backgroundColor: t.mediaTone || C.elevated }]} />
          ) : null}
          <View style={[s.factCapRow, { marginTop: 12, opacity: 0.86 }]}>
            <Text style={[s.meta, { fontWeight: "700", color: C.accent, fontSize: 10, letterSpacing: 0.4 }]}>FACT {t.factPct ?? 50}%</Text>
            <View style={[s.factCapBar, { height: 3, borderRadius: 2, overflow: "hidden" }]}>
              <View style={[s.factFill, { flex: t.factPct ?? 50, backgroundColor: C.accent }]} />
              <View style={[s.capFill, { flex: 100 - (t.factPct ?? 50), backgroundColor: C.border }]} />
            </View>
            <Text style={[s.meta, { fontWeight: "700", color: C.text3, fontSize: 10, letterSpacing: 0.4 }]}>CAP {100 - (t.factPct ?? 50)}%</Text>
          </View>
          <PostActions
            liked={!!liked[t.id]}
            likes={(t.likes || 0) + (liked[t.id] ? 1 : 0)}
            comments={t.comments || 0}
            accent={C.accent}
            danger={C.danger}
            muted={C.text2}
            onLike={() => setLiked({ ...liked, [t.id]: !liked[t.id] })}
            onComment={() => setCommentTake(t)}
            onShare={async () => {
              try { await Share.share({ message: `${t.name}: ${t.text}` }); }
              catch { show("Could not open share sheet"); }
            }}
            onReport={async () => {
              await submitReport("post", String(t.id), "other");
              show("Reported · saved locally until moderation API is live");
            }}
            onBlock={async () => {
              const h = String(t.handle || t.name);
              await blockUser(h);
              setBlocked((prev) => (prev.includes(h) ? prev : [...prev, h]));
              show(`Blocked @${h} on this device`);
            }}
          />
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const ActivityView = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}><Text style={s.h1}>Notifications</Text><Text style={s.sub}>Today · chronological</Text></View>
      {activity.map((a: any) => (
        <TouchableOpacity key={a.id} style={[s.activityRow, a.unread && s.activityUnread]} onPress={() => go(a.lane || "home")}>
          <Text style={s.activityIcon}>{a.icon}</Text>
          <View style={s.flex}><Text style={s.activityText}>{a.text}</Text><Text style={s.meta}>{a.time}</Text></View>
          {a.action === "follow_back" ? (
            <TouchableOpacity style={s.followBtn} onPress={() => show("Followed back")}><Text style={s.followBtnText}>Follow</Text></TouchableOpacity>
          ) : a.unread ? <View style={s.unreadDot} /> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const MySpace = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.profileHead}>
        <View style={s.profileAv}><Text style={s.profileAvText}>{(session.name || "K").slice(0, 2).toUpperCase()}</Text></View>
        <Text style={s.h1}>{displayName || session.name}</Text>
        <Text style={s.sub}>@{displayHandle || session.handle} · {session.kind}</Text>
        {displayBio ? <Text style={{ color: C.text2, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 4, textAlign: "center" }}>{displayBio}</Text> : null}
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statN}>{takes.length}</Text><Text style={s.statL}>Takes</Text></View>
          <View style={s.stat}><Text style={s.statN}>0</Text><Text style={s.statL}>Following</Text></View>
          <View style={s.stat}><Text style={s.statN}>0</Text><Text style={s.statL}>Followers</Text></View>
        </View>
        <View style={s.rowGap}>
          <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => { setProfileName(session.name || ""); setProfileHandle(displayHandle || session.handle || ""); setProfileBio(displayBio); setEditOpen(true); }}><Text style={s.primaryBtnText}>Edit profile</Text></TouchableOpacity>
          <TouchableOpacity style={s.ghostBtn} onPress={() => { signOut(); show("Signed out"); }}><Text style={s.ghostBtnText}>Sign out</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={[s.ghostBtn, { marginTop: 10, alignItems: "center" }]} onPress={() => setSettingsOpen(true)}><Text style={s.ghostBtnText}>Settings & account</Text></TouchableOpacity>
      </View>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Wallet</Text></View>
      <View style={s.roomRow}>
        <View style={s.flex}><Text style={s.roomName}>₦0.00</Text><Text style={s.meta}>Paystack · backend when live</Text></View>
        <TouchableOpacity style={s.joinBtn} onPress={() => setDetailItem({ title: "Kilode Wallet", meta: "Wallet setup", description: "Wallet top-ups will be available when the payment backend is connected. No money has been charged." })}><Text style={s.joinBtnText}>Top up</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );

  const Desk = ({ name }: { name: string }) => {
    const d = DESKS.find((x) => x.id === name);
    const items = LISTINGS[name] || [];
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
        <View style={s.deskHero}>
          <Text style={s.deskHeroIcon}>{d?.icon || "📦"}</Text>
          <Text style={s.h1}>{d?.label || name}</Text>
          <Text style={s.sub}>{d?.blurb}</Text>
          <TouchableOpacity style={[s.primaryBtn, { marginTop: 18, paddingHorizontal: 28 }]} onPress={() => setCreateOpen(true)}>
            <Text style={s.primaryBtnText}>Create in {d?.label || name}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.sectionHead}><Text style={s.sectionTitle}>{items.length ? `${items.length} listings` : "No listings yet"}</Text></View>
        {items.map((item) => (
          <TouchableOpacity key={item.id} style={s.roomRow} onPress={() => setSelectedDeskItem(item)}>
            <View style={s.flex}><Text style={s.roomName}>{item.title}</Text><Text style={s.meta}>{item.meta}</Text></View>
            {item.price ? <Text style={[s.chipText, { fontWeight: "700", color: C.accent }]}>{item.price}</Text> : null}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[s.ghostBtn, { marginHorizontal: 14, alignItems: "center", marginTop: 12 }]} onPress={() => go("home")}>
          <Text style={s.ghostBtnText}>Back home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const body = () => {
    if (settingsOpen) return (
      <SettingsScreen
        s={s}
        C={C}
        isDark={isDark}
        sessionHandle={session.handle}
        show={show}
        onBack={() => setSettingsOpen(false)}
        onDeleteAccount={async () => ({ ok: false, error: "Account deletion is not connected to a server endpoint yet. No account was deleted." })}
      />
    );
    if (selectedPost) return <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} following={!!following[String(selectedPost.handle || selectedPost.name)]} onBack={() => setSelectedPost(null)} onLike={() => setLiked((prev) => ({ ...prev, [String(selectedPost.id)]: !prev[String(selectedPost.id)] }))} onComment={() => setCommentTake(selectedPost)} onFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedPost.handle || selectedPost.name)]: !prev[String(selectedPost.handle || selectedPost.name)] }))} onReport={async () => { await submitReport("post", String(selectedPost.id), "other"); show("Report saved for review."); }} onBlock={async () => { const h = String(selectedPost.handle || selectedPost.name); await blockUser(h); setBlocked((prev) => prev.includes(h) ? prev : [...prev, h]); setSelectedPost(null); show("Blocked @" + h); }} show={show} />;
    if (selectedProfile) return <UserProfileScreen s={s} C={C} user={selectedProfile} posts={takes.filter((post: any) => String(post.handle || post.name) === String(selectedProfile.handle || selectedProfile.name))} isFollowing={!!following[String(selectedProfile.handle || selectedProfile.name)]} onBack={() => setSelectedProfile(null)} onToggleFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedProfile.handle || selectedProfile.name)]: !prev[String(selectedProfile.handle || selectedProfile.name)] }))} onOpenPost={(post) => { setSelectedProfile(null); setSelectedPost(post); }} />;
    if (selectedDeskItem) return (
      <DeskDetailScreen
        s={s}
        C={C}
        system={DESKS.find((d) => d.id === tab)?.label || tab}
        item={selectedDeskItem}
        onBack={() => setSelectedDeskItem(null)}
        show={show}
      />
    );
    if (tab === "media") return (
      <MediaScreen
        s={s}
        C={C}
        articles={news.map((n: any) => ({ id: String(n.id), title: n.title, kicker: n.kicker, time: n.time, tone: n.tone, body: n.summary || n.description, author: n.author || "Kilode Editorial", imageUrl: n.imageUrl }))}
        initialArticleId={selectedArticleId}
        onBack={() => { setSelectedArticleId(null); go("home"); }}
        show={show}
      />
    );
    if (tab === "home") return <Home />;
    if (tab === "socials") return <Socials />;
    if (tab === "activity") return <ActivityView />;
    if (tab === "myspace") return <MySpace />;
    if (tab === "chat") return <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "cinema") return <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "music") return <MusicScreen s={s} C={C} onBack={() => go("home")} show={show} onPlay={setNowPlaying} />;
    if (DESKS.some((d) => d.id === tab)) return <Desk name={tab} />;
    return <Home />;
  };

  const headerTitle = settingsOpen ? "Settings" : tab === "activity" ? "Notifications" : tab === "myspace" ? "My Space" : tab === "media" ? "Media" : DESKS.find((d) => d.id === tab)?.label;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      <ConnectionBanner source={source} isDark={isDark} />
      <View style={s.flex}>{body()}</View>
      {nowPlaying ? (
        <View style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent }]} />
          <View style={s.flex}><Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text><Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}</Text></View>
          <TouchableOpacity onPress={() => setNowPlaying(null)}><Ionicons name="close" size={18} color={C.text2} /></TouchableOpacity>
        </View>
      ) : null}
      <KilodeTabBar
        active={tab === "home" || tab === "socials" || tab === "activity" || tab === "myspace" ? tab : "home"}
        onTab={(id) => go(id)}
        onCreate={() => setCreateOpen(true)}
        isDark={isDark}
      />

      <Modal visible={composeOpen} transparent animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setComposeOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>New take</Text><TouchableOpacity onPress={() => setComposeOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <TextInput multiline autoFocus style={{ minHeight: 120, backgroundColor: C.input, borderRadius: 16, padding: 14, color: C.text, borderWidth: 1, borderColor: C.border, fontSize: 16, textAlignVertical: "top" }} placeholder="What is happening in Naija?" placeholderTextColor={C.text3} value={composeText} onChangeText={setComposeText} />
            <TouchableOpacity style={[s.primaryBtn, { marginTop: 14, opacity: composeText.trim() && !posting ? 1 : 0.5 }]} disabled={!composeText.trim() || posting}
              onPress={async () => {
                if (!session.token) {
                  show("Sign in to publish a take.");
                  return;
                }
                setPosting(true);
                try {
                  const r = await postTake(composeText, session.token);
                  if (r.ok && (r as any).data) {
                    setTakes((prev) => [(r as any).data, ...prev]);
                    setComposeText(""); setComposeOpen(false); go("socials");
                    show(r.source === "live" ? "Posted live" : "Added to preview");
                  } else {
                    show((r as any).error || "Could not post. Kilode's posting service may be unavailable.");
                  }
                } catch (e) {
                  show(e instanceof Error ? e.message : "Could not post. Check your connection and try again.");
                } finally {
                  setPosting(false);
                }
              }}>
              <Text style={s.primaryBtnText}>{posting ? "Posting…" : "Post take"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>More on Kilode</Text><TouchableOpacity onPress={() => setMoreOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <View style={s.deskGrid}>{DESKS.map((d) => (<TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}><View style={{ width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.62)", borderWidth: 1, borderColor: isDark ? "rgba(229,193,88,0.28)" : "rgba(130,105,48,0.22)", shadowColor: isDark ? "#D4AF37" : "#7A642E", shadowOpacity: isDark ? 0.12 : 0.08, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}><Ionicons name={systemIconName(d.icon)} size={21} color={C.accent} /></View><Text style={s.deskGridLabel}>{d.label}</Text></TouchableOpacity>))}</View>
          </View>
        </View>
      </Modal>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Create</Text><TouchableOpacity onPress={() => setCreateOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <View style={s.deskGrid}>{CREATE.map((o) => (
              <TouchableOpacity key={o.label} style={s.deskGridItem} onPress={() => { if (o.label === "Post") { setCreateOpen(false); setComposeOpen(true); return; } go(o.tab); show(o.label); }}>
                <View style={{ width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.62)", borderWidth: 1, borderColor: isDark ? "rgba(229,193,88,0.28)" : "rgba(130,105,48,0.22)", shadowColor: isDark ? "#D4AF37" : "#7A642E", shadowOpacity: isDark ? 0.12 : 0.08, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}><Ionicons name={systemIconName(o.icon)} size={21} color={C.accent} /></View><Text style={s.deskGridLabel}>{o.label}</Text>
              </TouchableOpacity>
            ))}</View>
          </View>
        </View>
      </Modal>

      <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setEditOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Edit profile</Text><TouchableOpacity onPress={() => setEditOpen(false)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 12, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: 10 }} placeholder="Display name" placeholderTextColor={C.text3} value={profileName} onChangeText={setProfileName} />
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 12, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: 10 }} placeholder="Handle" placeholderTextColor={C.text3} value={profileHandle} onChangeText={setProfileHandle} autoCapitalize="none" />
            <TextInput style={{ backgroundColor: C.input, borderRadius: 12, padding: 12, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: 10, minHeight: 80, textAlignVertical: "top" }} placeholder="Bio" placeholderTextColor={C.text3} value={profileBio} onChangeText={setProfileBio} multiline />
            <TouchableOpacity style={s.primaryBtn} onPress={() => { setDisplayName(profileName.trim() || session.name); setDisplayHandle(profileHandle.trim() || session.handle); setDisplayBio(profileBio.trim()); setEditOpen(false); show("Profile updated locally"); }}>
              <Text style={s.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!detailItem} transparent animationType="slide" onRequestClose={() => setDetailItem(null)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setDetailItem(null)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>{detailItem?.title || "Details"}</Text><TouchableOpacity onPress={() => setDetailItem(null)}><Ionicons name="close" size={22} color={C.text2} /></TouchableOpacity></View>
            {detailItem?.meta ? <Text style={s.meta}>{detailItem.meta}</Text> : null}
            <Text style={{ color: C.text, fontSize: 15, lineHeight: 22, marginTop: 10 }}>{detailItem?.description || detailItem?.blurb || "More details will appear when this service is connected."}</Text>
          </View>
        </View>
      </Modal>

      <CommentsSheet
        visible={!!commentTake}
        onClose={() => setCommentTake(null)}
        takeId={commentTake?.id || ""}
        takeAuthor={commentTake?.name || ""}
        takeText={commentTake?.text || ""}
        token={session.token}
        C={C}
        isDark={isDark}
        show={show}
      />

      {toast ? <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View> : null}
    </SafeAreaView>
  );
}

export function KilodeRoot() {
  return <AuthProvider><KilodeApp /></AuthProvider>;
}
