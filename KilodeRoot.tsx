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
import { TrackDetailScreen } from "./screens/TrackDetail";
import { ArtistDetailScreen } from "./screens/ArtistDetail";
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
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
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
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false); setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null); setSelectedTrack(null); setSelectedArtist(null);
  };

  const loadAll = useCallback(async () => {
    if (Platform.OS === "web") {
      setTakes(TAKES);
      setRooms(ROOMS);
      setNews(NEWS);
      setTracks(TRACKS);
      setActivity(ACTIVITY);
      setSource("mock");
      return "mock" as const;
    }
    const [t, r, n, tr, a] = await Promise.all([
      fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity(session?.token),
    ]);
    setTakes(Array.isArray(t.data) ? t.data : []);
    setRooms(Array.isArray(r.data) ? r.data : []);
    setNews(Array.isArray(n.data) ? n.data : []);
    setTracks(Array.isArray(tr.data) ? tr.data : []);
    setActivity(Array.isArray(a.data) ? a.data : []);
    const sources = [t, r, n, tr].map((x) => x.source);
    const nextSource: "live" | "mock" | "error" =
      sources.every((value) => value === "live") ? "live"
        : sources.some((value) => value === "error") ? "error" : "live";
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
      show(result === "error" ? "Some Kilode services are unavailable. Try again shortly." : result === "mock" ? "Preview content refreshed" : "Refreshed");
    } catch {
      show("Could not refresh Kilode. Check your connection and try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (session && (authLoading || boot)) {
    return (
      <SafeAreaView style={[s.root, s.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.accent} size="large" />
        <Text style={[s.sub, { marginTop: 12 }]}>Loading Kilode…</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <AuthScreen isDark={isDark} C={C} onSignIn={signIn} onSignUp={signUp}
        onGuest={() => { signInGuest("Guest"); show("Guest mode"); }}
        onGoogle={() => { show("Google sign-in isn't connected yet."); }} show={show} />
    );
  }

  const Header = ({ title }: { title?: string }) => (
    <View style={s.header}>
      <View style={s.headerLeft}>{title ? <Text style={s.headerTitle}>{title}</Text> : <KilodeWordmark size="small" />}</View>
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

  // NOTE: Home/Socials/MySpace/Desk body implementations restored from commit 1e64e19 with destination wiring.
  // Full UI blocks preserved via dynamic require pattern replaced with inlined critical destinations.

  const body = () => {
    if (settingsOpen) return <SettingsScreen s={s} C={C} session={session} onBack={() => setSettingsOpen(false)} onSignOut={() => { signOut(); setSettingsOpen(false); }} show={show} />;
    if (selectedPost) return (
      <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} following={!!following[String(selectedPost.handle || selectedPost.name)]}
        onBack={() => setSelectedPost(null)}
        onLike={() => setLiked((prev) => ({ ...prev, [String(selectedPost.id)]: !prev[String(selectedPost.id)] }))}
        onComment={() => setCommentTake(selectedPost)}
        onFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedPost.handle || selectedPost.name)]: !prev[String(selectedPost.handle || selectedPost.name)] }))}
        onReport={async () => { await submitReport("post", String(selectedPost.id), "other"); show("Report saved for review."); }}
        onBlock={async () => { const h = String(selectedPost.handle || selectedPost.name); await blockUser(h); setBlocked((prev) => prev.includes(h) ? prev : [...prev, h]); setSelectedPost(null); show("Blocked @" + h); }}
        show={show} />
    );
    if (selectedProfile) return (
      <UserProfileScreen s={s} C={C} user={selectedProfile} posts={takes.filter((post: any) => String(post.handle || post.name) === String(selectedProfile.handle || selectedProfile.name))}
        isFollowing={!!following[String(selectedProfile.handle || selectedProfile.name)]}
        onBack={() => setSelectedProfile(null)}
        onToggleFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedProfile.handle || selectedProfile.name)]: !prev[String(selectedProfile.handle || selectedProfile.name)] }))}
        onOpenPost={(post) => { setSelectedProfile(null); setSelectedPost(post); }} />
    );
    if (selectedTrack) return (
      <TrackDetailScreen s={s} C={C} track={selectedTrack} related={tracks} onBack={() => setSelectedTrack(null)} onPlay={setNowPlaying}
        onOpenArtist={(name) => { setSelectedTrack(null); setSelectedArtist(name); }} onOpenTrack={(t) => setSelectedTrack(t)} show={show} />
    );
    if (selectedArtist) return (
      <ArtistDetailScreen s={s} C={C} artistName={selectedArtist} tracks={tracks} onBack={() => setSelectedArtist(null)}
        onOpenTrack={(t) => { setSelectedArtist(null); setSelectedTrack(t); }} onPlay={setNowPlaying} show={show} />
    );
    if (selectedDeskItem) return (
      <DeskDetailScreen s={s} C={C} item={selectedDeskItem} onBack={() => setSelectedDeskItem(null)} show={show} />
    );
    if (tab === "media") return (
      <MediaScreen s={s} C={C} news={news} initialArticleId={selectedArticleId} onBack={() => go("home")} show={show} />
    );
    if (tab === "music") return (
      <MusicScreen s={s} C={C} onBack={() => go("home")} show={show} onPlay={setNowPlaying}
        onOpenTrack={(t) => setSelectedTrack(t)} onOpenArtist={(name) => setSelectedArtist(name)} />
    );
    if (tab === "cinema") return <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "chat") return <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "activity") {
      return (
        <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
          <View style={s.padH}><Text style={s.h1}>Notifications</Text></View>
          {activity.map((a: any) => (
            <TouchableOpacity key={a.id} style={[s.activityRow, a.unread && s.activityUnread]} onPress={() => go(a.lane || "home")}>
              <Text style={s.activityIcon}>{a.icon}</Text>
              <View style={s.flex}><Text style={s.activityText}>{a.text}</Text><Text style={s.meta}>{a.time}</Text></View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }
    if (tab === "socials") {
      return (
        <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
          <View style={s.composer}>
            <View style={s.composerAv}><Text style={s.avatarText}>{(session.name || "K").slice(0, 1)}</Text></View>
            <TouchableOpacity style={s.composerInput} onPress={() => setComposeOpen(true)}><Text style={s.composerPlaceholder}>What is happening in Naija?</Text></TouchableOpacity>
            <TouchableOpacity style={s.postBtn} onPress={() => setComposeOpen(true)}><Text style={s.postBtnText}>Post</Text></TouchableOpacity>
          </View>
          {takes.filter((t: any) => !blocked.includes(String(t.handle || ""))).map((t: any) => (
            <View key={t.id} style={s.postCard}>
              <View style={s.postTop}>
                <TouchableOpacity onPress={() => setSelectedProfile(t)}><View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View></TouchableOpacity>
                <TouchableOpacity style={s.flex} onPress={() => setSelectedProfile(t)}>
                  <Text style={s.postName}>{t.name}</Text>
                  <Text style={s.meta}>@{t.handle} · {t.time}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setSelectedPost(t)}><Text style={s.postBody}>{t.text}</Text></TouchableOpacity>
              <PostActions liked={!!liked[t.id]} likes={(t.likes || 0) + (liked[t.id] ? 1 : 0)} comments={t.comments || 0}
                accent={C.accent} danger={C.danger} muted={C.text2}
                onLike={() => setLiked({ ...liked, [t.id]: !liked[t.id] })}
                onComment={() => setCommentTake(t)}
                onShare={async () => { try { await Share.share({ message: `${t.name}: ${t.text}` }); } catch { show("Could not share"); } }}
                onReport={async () => { await submitReport("post", String(t.id), "other"); show("Reported locally"); }}
                onBlock={async () => { const h = String(t.handle || t.name); await blockUser(h); setBlocked((p) => p.includes(h) ? p : [...p, h]); show("Blocked @" + h); }}
              />
            </View>
          ))}
        </ScrollView>
      );
    }
    if (tab === "myspace") {
      return (
        <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
          <View style={s.profileHead}>
            <View style={s.profileAv}><Text style={s.profileAvText}>{(session.name || "K").slice(0, 2).toUpperCase()}</Text></View>
            <Text style={s.h1}>{displayName || session.name}</Text>
            <Text style={s.sub}>@{displayHandle || session.handle} · {session.kind}</Text>
            <View style={s.rowGap}>
              <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => setEditOpen(true)}><Text style={s.primaryBtnText}>Edit profile</Text></TouchableOpacity>
              <TouchableOpacity style={s.ghostBtn} onPress={() => setSettingsOpen(true)}><Text style={s.ghostBtnText}>Settings</Text></TouchableOpacity>
              <TouchableOpacity style={s.ghostBtn} onPress={() => { signOut(); show("Signed out"); }}><Text style={s.ghostBtnText}>Sign out</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      );
    }
    if (DESKS.some((d) => d.id === tab)) {
      const d = DESKS.find((x) => x.id === tab);
      const items = LISTINGS[tab] || [];
      return (
        <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
          <View style={s.deskHero}>
            <Text style={s.h1}>{d?.label || tab}</Text>
            <Text style={s.sub}>{d?.blurb}</Text>
          </View>
          {items.map((item: any) => (
            <TouchableOpacity key={item.id} style={s.roomRow} onPress={() => setSelectedDeskItem(item)}>
              <View style={s.flex}><Text style={s.roomName}>{item.title}</Text><Text style={s.meta}>{item.meta}</Text></View>
              {item.price ? <Text style={{ color: C.accent, fontWeight: "700" }}>{item.price}</Text> : null}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[s.ghostBtn, { margin: 14 }]} onPress={() => go("home")}><Text style={s.ghostBtnText}>Back home</Text></TouchableOpacity>
        </ScrollView>
      );
    }
    // Home — discovery
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
        <View style={[s.padH, { paddingTop: 10 }]}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.7 }}>Discover</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {["For you", "Trending", "Rooms", "News"].map((c, i) => (
            <TouchableOpacity key={c} style={[s.chip, homeChip === i && s.chipOn]} onPress={() => setHomeChip(i)}>
              <Text style={[s.chipText, homeChip === i && s.chipTextOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {(homeChip === 0 || homeChip === 3) && news.slice(0, 4).map((n: any) => (
          <TouchableOpacity key={n.id} style={s.newsCard} onPress={() => { setSelectedArticleId(String(n.id)); go("media"); }}>
            <View style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} />
            <View style={s.flex}><Text style={s.newsKicker}>{n.kicker} · {n.time}</Text><Text style={s.newsTitle} numberOfLines={2}>{n.title}</Text></View>
          </TouchableOpacity>
        ))}
        {(homeChip === 0 || homeChip === 1) && takes.slice(0, 5).map((t: any) => (
          <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => setSelectedPost(t)}>
            <View style={s.roomAv}><Text style={s.roomAvText}>{(t.name || "?").slice(0, 1)}</Text></View>
            <View style={s.flex}><Text style={s.roomName}>{t.name}</Text><Text style={s.meta} numberOfLines={2}>{t.text}</Text></View>
          </TouchableOpacity>
        ))}
        {(homeChip === 0 || homeChip === 2) && rooms.map((r: any) => (
          <TouchableOpacity key={r.id} style={s.roomRow} onPress={() => setDetailItem({ title: r.name, meta: r.meta, description: "Room preview · live audio not connected." })}>
            <View style={s.roomAv}><Text style={s.roomAvText}>{r.av}</Text></View>
            <View style={s.flex}><Text style={s.roomName}>{r.name}</Text><Text style={s.meta}>{r.meta}</Text></View>
          </TouchableOpacity>
        ))}
        {(homeChip === 0) && (
          <ScrollView horizontal contentContainerStyle={s.tracksRow}>
            {tracks.slice(0, 6).map((t: any) => (
              <TouchableOpacity key={t.id} style={[s.trackCard, { backgroundColor: t.color || C.accent }]} onPress={() => setSelectedTrack(t)}>
                <Text style={s.trackTitle}>{t.title}</Text>
                <Text style={s.trackArtist}>{t.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    );
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
                if (!session.token) { show("Sign in to publish a take."); return; }
                setPosting(true);
                try {
                  const r = await postTake(composeText, session.token);
                  if (r.ok && (r as any).data) {
                    setTakes((prev) => [(r as any).data, ...prev]);
                    setComposeText(""); setComposeOpen(false); go("socials");
                    show(r.source === "live" ? "Posted live" : "Added to preview");
                  } else show((r as any).error || "Could not post.");
                } catch (e) { show(e instanceof Error ? e.message : "Could not post."); }
                finally { setPosting(false); }
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
            <View style={s.deskGrid}>{DESKS.map((d) => (
              <TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}>
                <Ionicons name={systemIconName(d.icon)} size={22} color={C.accent} />
                <Text style={s.deskGridLabel}>{d.label}</Text>
              </TouchableOpacity>
            ))}</View>
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
              <TouchableOpacity key={o.label} style={s.deskGridItem} onPress={() => { if (o.label === "Post") { setCreateOpen(false); setComposeOpen(true); return; } go(o.tab); }}>
                <Text style={{ fontSize: 22 }}>{o.icon}</Text><Text style={s.deskGridLabel}>{o.label}</Text>
              </TouchableOpacity>
            ))}</View>
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
            <Text style={{ color: C.text, fontSize: 15, lineHeight: 22, marginTop: 10 }}>{detailItem?.description || "More details when connected."}</Text>
          </View>
        </View>
      </Modal>
      <CommentsSheet visible={!!commentTake} onClose={() => setCommentTake(null)} takeId={commentTake?.id || ""} takeAuthor={commentTake?.name || ""} takeText={commentTake?.text || ""} token={session.token} C={C} isDark={isDark} show={show} />
      {toast ? <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View> : null}
    </SafeAreaView>
  );
}

export function KilodeRoot() {
  return <AuthProvider><KilodeApp /></AuthProvider>;
}
