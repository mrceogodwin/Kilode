import React, { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Share,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, ROLE_GRID, CAROUSEL as CAROUSEL_FALLBACK, LISTINGS, STORIES } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { subscribeMusicPlayer, toggleMusicPlayback, stopMusicPlayback, playMusicTrack, seekMusicPlayback, setMusicRepeat } from "./lib/musicPlayer";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { MusicFullPlayer } from "./screens/MusicFullPlayer";
import { PushLinkScreen } from "./screens/PushLink";
import { AuthScreen } from "./screens/Auth";
import { CommentsSheet } from "./screens/Comments";
import { KilodeTabBar } from "./components/ui";
import { SettingsScreen } from "./screens/Settings";
import { blockUser, submitReport, getBlockedUsers } from "./lib/moderation";
import { MediaScreen } from "./screens/Media";
import { PostActions } from "./components/ui/PostActions";
import { DeskDetailScreen } from "./screens/DeskDetail";
import { UserProfileScreen } from "./screens/UserProfile";
import { PostDetailScreen } from "./screens/PostDetail";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (system === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

  const [tab, setTab] = useState("home");
  const [slide, setSlide] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentTake, setCommentTake] = useState<any | null>(null);
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [socialPrefsLoadedFor, setSocialPrefsLoadedFor] = useState<string | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [boot, setBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<"live" | "mock" | "error" | "mixed">("mock");
  const [takesSource, setTakesSource] = useState<"live" | "mock" | "error">("error");
  const [takes, setTakes] = useState<any[]>([]);
  const [takesNextCursor, setTakesNextCursor] = useState<string | null>(null);
  const [takesHasMore, setTakesHasMore] = useState(false);
  const [loadingMoreTakes, setLoadingMoreTakes] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicPlayerExpanded, setMusicPlayerExpanded] = useState(false);
  const [musicPositionMillis, setMusicPositionMillis] = useState(0);
  const [musicDurationMillis, setMusicDurationMillis] = useState(0);
  const [musicShuffle, setMusicShuffle] = useState(false);
  const [musicRepeat, setMusicRepeatState] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDeskItem, setSelectedDeskItem] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const socialPrefsKey = `kilode:social-preferences:${String(session?.handle || session?.name || "guest").toLowerCase()}`;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(socialPrefsKey).then((raw) => {
      if (!active) return;
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setLiked(saved?.liked && typeof saved.liked === "object" ? saved.liked : {});
          setFollowing(saved?.following && typeof saved.following === "object" ? saved.following : {});
        } catch {
          setLiked({});
          setFollowing({});
        }
      } else {
        setLiked({});
        setFollowing({});
      }
    }).catch(() => {
      if (active) { setLiked({}); setFollowing({}); }
    }).finally(() => {
      if (active) setSocialPrefsLoadedFor(socialPrefsKey);
    });
    return () => { active = false; };
  }, [socialPrefsKey]);

  useEffect(() => {
    // Do not write account A's in-memory preferences under account B's key
    // during the render before B's AsyncStorage hydration has completed.
    if (socialPrefsLoadedFor !== socialPrefsKey) return;
    AsyncStorage.setItem(socialPrefsKey, JSON.stringify({ liked, following })).catch(() => {
      // Local preferences are best-effort; server-backed engagement is not implemented yet.
    });
  }, [following, liked, socialPrefsKey, socialPrefsLoadedFor]);

  useEffect(() => {
    const unsubscribe = subscribeMusicPlayer((track, playing, positionMillis, durationMillis) => {
      setNowPlaying(track);
      setIsMusicPlaying(playing);
      setMusicPositionMillis(positionMillis);
      setMusicDurationMillis(durationMillis);
    });
    return () => { unsubscribe(); };
  }, []);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const playAdjacentTrack = async (direction: -1 | 1) => {
    const playable = tracks.filter((item: any) => Boolean(item.audioUrl || item.audio_url || item.streamUrl || item.stream_url || item.previewUrl || item.preview_url));
    if (!playable.length) { show("More playable Kilode tracks are needed for the queue."); return; }
    const currentIndex = playable.findIndex((item: any) => String(item.id ?? item.title) === String(nowPlaying?.id ?? nowPlaying?.title));
    let nextIndex: number;
    if (musicShuffle && direction === 1) {
      const choices = playable.filter((_: any, index: number) => index !== currentIndex);
      const next = choices[Math.floor(Math.random() * choices.length)];
      if (!next) { await playMusicTrack(playable[0]); return; }
      await playMusicTrack(next);
      return;
    }
    nextIndex = currentIndex < 0 ? (direction === 1 ? 0 : playable.length - 1) : (currentIndex + direction + playable.length) % playable.length;
    await playMusicTrack(playable[nextIndex]);
  };
  const toggleMusicShuffle = () => setMusicShuffle((value) => !value);
  const toggleMusicRepeat = () => setMusicRepeatState((value) => {
    setMusicRepeat(!value);
    return !value;
  });

  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false); setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null);
  };

  const loadAll = useCallback(async () => {
    const [t, r, n, tr, a] = await Promise.all([fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity()]);
    setTakes(Array.isArray(t.data) ? t.data : []);
    setTakesSource(t.source);
    setTakesNextCursor(t.nextCursor || null);
    setTakesHasMore(Boolean(t.hasMore && t.nextCursor));
    setRooms(Array.isArray(r.data) ? r.data : []);
    setNews(Array.isArray(n.data) ? n.data : []);
    setTracks(Array.isArray(tr.data) ? tr.data : []);
    setActivity(Array.isArray(a.data) ? a.data : []);
    const sources = [t, r, n, tr, a].map((x) => x.source);
    const nextSource = sources.every((value) => value === "live")
      ? "live"
      : sources.every((value) => value === "error")
        ? "error"
        : sources.every((value) => value === "mock")
          ? "mock"
          : "mixed";
    setSource(nextSource);
    return { feedSource: t.source, appSource: nextSource };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const b = await getBlockedUsers(session?.handle || session?.name || "guest");
      if (!cancelled) setBlocked(b);
      await loadAll();
      if (!cancelled) setBoot(false);
    })();
    return () => { cancelled = true; };
  }, [loadAll]);

  const loadMoreTakes = useCallback(async () => {
    if (loadingMoreTakes || !takesHasMore || !takesNextCursor || takesSource !== "live") return;
    setLoadingMoreTakes(true);
    try {
      const page = await fetchTakes(takesNextCursor);
      if (!page.ok || page.source !== "live") {
        show(page.error || "Could not load more posts. Try again.");
        return;
      }
      // Compute the page merge outside the state updater. React may invoke
      // updater functions more than once in development; they must stay pure.
      const knownIds = new Set(takes.map((item: any) => String(item.id)));
      const additions = page.data.filter((item: any) => {
        const id = String(item.id);
        if (knownIds.has(id)) return false;
        knownIds.add(id);
        return true;
      });

      // Stop if the server repeats its cursor without returning new posts;
      // otherwise the user could repeatedly request the same page forever.
      const cursorStalled = Boolean(page.nextCursor && page.nextCursor === takesNextCursor);
      if (cursorStalled && additions.length === 0) {
        setTakesHasMore(false);
        setTakesNextCursor(null);
      } else {
        setTakesNextCursor(page.nextCursor || null);
        setTakesHasMore(Boolean(page.hasMore && page.nextCursor));
      }

      // Keep the updater pure and re-check IDs against the latest state in
      // case another refresh added a post while this page request was in flight.
      setTakes((current) => {
        const currentIds = new Set(current.map((item: any) => String(item.id)));
        const uniqueAdditions = additions.filter((item: any) => {
          const id = String(item.id);
          if (currentIds.has(id)) return false;
          currentIds.add(id);
          return true;
        });
        return uniqueAdditions.length ? [...current, ...uniqueAdditions] : current;
      });
    } catch {
      show("Could not load more posts. Try again.");
    } finally {
      setLoadingMoreTakes(false);
    }
  }, [loadingMoreTakes, takesHasMore, takesNextCursor, takesSource, takes]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await loadAll();
      show(result.appSource === "error" ? "Backend unavailable · preview content" : result.feedSource === "live" ? "Feed updated" : "Preview refreshed");
    } catch {
      show("Refresh failed · try again");
    } finally {
      setRefreshing(false);
    }
  };

  if (boot || authLoading) {
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
          <Text style={s.brand}>
            Kilode<Text style={s.brandAccent}>!</Text>
          </Text>
        )}
      </View>
      <View style={s.headerRight}>
        <View style={[s.chip, { paddingVertical: 4, paddingHorizontal: 8 }]}>
          <Text style={[s.chipText, { fontSize: 10 }]}>{source}</Text>
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={() => setThemeMode(isDark ? "light" : "dark")}>
          <Text style={s.iconBtnText}>{isDark ? "☀" : "☾"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.avatar} onPress={() => go("myspace")}>
          <Text style={s.avatarText}>{(session.name || "K").slice(0, 1).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;

  const Home = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={s.h1}>Kilode</Text>
        <Text style={s.sub}>Everything happening, in one place</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselRow} decelerationRate="fast" snapToInterval={316} onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / 316))}>
        {CAROUSEL_FALLBACK.map((c) => (
          <TouchableOpacity key={c.id} style={[s.slide, { backgroundColor: c.color }]} onPress={() => { if (c.id === "c1") setMoreOpen(true); else if (c.id === "c2") go("music"); else if (c.id === "c3") go("jobs"); else go("cinema"); }}>
            <Text style={s.slideTitle}>{c.title}</Text>
            <Text style={s.slideSub}>{c.sub}</Text>
            <View style={s.slideCta}><Text style={s.slideCtaText}>{c.cta}</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.dotsRow}>{CAROUSEL_FALLBACK.map((_, i) => <View key={i} style={[s.dot, i === slide && s.dotOn]} />)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storyRow}>
        {STORIES.map((st) => (
          <TouchableOpacity key={st.id} style={s.story} onPress={() => st.id === "s0" ? setComposeOpen(true) : setSelectedProfile({ name: st.label, handle: st.label.toLowerCase(), role: "Kilode member" })}>
            <View style={s.storyRing}><View style={s.storyInner}><Text style={{ color: C.text, fontWeight: "700" }}>{st.av}</Text></View></View>
            <Text style={s.storyLabel} numberOfLines={1}>{st.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {takes.length > 0 ? (
        <View style={{ marginTop: 8 }}>
          <View style={[s.sectionHead, { marginBottom: 8 }]}>
            <View>
              <Text style={s.sectionTitle}>From Socials</Text>
              {takesSource !== "live" ? <Text style={[s.meta, { marginTop: 2 }]}>Preview content · not live</Text> : null}
            </View>
            <TouchableOpacity onPress={() => go("socials")}><Text style={s.link}>See all</Text></TouchableOpacity>
          </View>
          {takes.filter((take: any) => !blocked.includes(String(take.handle || "")) && !blocked.includes(String(take.name || ""))).slice(0, 2).map((take: any) => (
            <TouchableOpacity
              key={String(take.id)}
              onPress={() => { go("socials"); setSelectedPost(take); }}
              accessibilityRole="button"
              style={{ marginHorizontal: 14, marginBottom: 8, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={[s.postAv, { width: 30, height: 30, borderRadius: 15, marginRight: 8 }]}><Text style={s.avatarText}>{String(take.name || "?").slice(0, 1)}</Text></View>
                <View style={s.flex}>
                  <Text style={[s.postName, { fontSize: 12 }]} numberOfLines={1}>{take.name || "Kilode member"}</Text>
                  <Text style={[s.meta, { fontSize: 10 }]} numberOfLines={1}>@{take.handle || "member"} · {take.time || "recent"}</Text>
                </View>
              </View>
              <Text style={{ color: C.text, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>{take.text || take.body || ""}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      <>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Explore Kilode</Text>
          <TouchableOpacity onPress={() => setMoreOpen(true)}><Text style={s.link}>More</Text></TouchableOpacity>
        </View>
        <View style={s.grid4}>
          {ROLE_GRID.map((r) => (
            <TouchableOpacity key={r.id} style={s.gridCell} onPress={() => go(r.id)}>
              <Text style={s.gridIcon}>{r.icon}</Text>
              <Text style={s.gridLabel}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const visibleTakes = takes.filter((t: any) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || "")));

  const Socials = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      {takesSource !== "live" ? (
        <View style={{ marginHorizontal: 14, marginBottom: 10, padding: 11, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <Text style={{ color: C.text, fontSize: 12, fontWeight: "700" }}>{takesSource === "error" ? "Preview feed · not connected" : "Sample feed"}</Text>
          <Text style={{ color: C.text2, fontSize: 11, marginTop: 3, lineHeight: 16 }}>{takesSource === "error" ? "These posts are preview content. Live posts will appear when Kilode’s dedicated feed API is connected." : "You’re viewing sample posts, not a live community feed."}</Text>
        </View>
      ) : null}
      <View style={s.composer}>
        <View style={s.composerAv}><Text style={s.avatarText}>{(session.name || "K").slice(0, 1)}</Text></View>
        <TouchableOpacity style={s.composerInput} onPress={() => setComposeOpen(true)}><Text style={s.composerPlaceholder}>What is happening in Naija?</Text></TouchableOpacity>
        <TouchableOpacity style={s.postBtn} onPress={() => setComposeOpen(true)}><Text style={s.postBtnText}>Post</Text></TouchableOpacity>
      </View>
      {visibleTakes.length === 0 ? (
        <View style={{ marginHorizontal: 14, marginTop: 18, padding: 22, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: "center" }}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "700" }}>Your feed starts here</Text>
          <Text style={{ color: C.text2, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6 }}>Follow people or publish the first take to start the conversation.</Text>
        </View>
      ) : visibleTakes.map((t: any) => (
        <View key={t.id} style={s.postCard}>
          <View style={s.postTop}>
            <TouchableOpacity onPress={() => setSelectedProfile(t)} accessibilityRole="button"><View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View></TouchableOpacity>
            <TouchableOpacity style={s.flex} onPress={() => setSelectedProfile(t)} accessibilityRole="button">
              <View style={s.row}><Text style={s.postName}>{t.name}</Text>{t.verified ? <Text style={s.verified}>✓</Text> : null}</View>
              <Text style={s.meta}>@{t.handle} · {t.time} · {t.role}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.followBtn} onPress={() => setFollowing((prev) => ({ ...prev, [String(t.handle || t.name)]: !prev[String(t.handle || t.name)] }))}><Text style={s.followBtnText}>{following[String(t.handle || t.name)] ? "Following" : "Follow"}</Text></TouchableOpacity>
          </View>
          <Text style={s.postBody}>{t.text}</Text>
          {t.mediaUrl ? (
            <Image source={{ uri: t.mediaUrl }} style={s.postMedia} resizeMode="cover" />
          ) : t.media ? (
            <View style={[s.postMedia, { backgroundColor: t.mediaTone || C.elevated }]} />
          ) : null}
          <View style={s.factCapRow}>
            <Text style={[s.meta, { fontWeight: "700", color: C.success }]}>FACT {t.factPct ?? 50}%</Text>
            <View style={s.factCapBar}>
              <View style={[s.factFill, { flex: t.factPct ?? 50 }]} />
              <View style={[s.capFill, { flex: 100 - (t.factPct ?? 50) }]} />
            </View>
            <Text style={[s.meta, { fontWeight: "700", color: C.danger }]}>CAP {100 - (t.factPct ?? 50)}%</Text>
          </View>
          <PostActions
            liked={!!liked[t.id]}
            likes={(t.likes || 0) + (liked[t.id] ? 1 : 0)}
            comments={t.comments || 0}
            accent={C.accent}
            danger={C.danger}
            muted={C.text2}
            onLike={() => setLiked((prev) => ({ ...prev, [String(t.id)]: !prev[String(t.id)] }))}
            onComment={() => setCommentTake(t)}
            onShare={async () => { try { await Share.share({ message: `${t.name} (@${t.handle}) on Kilode:

${t.text}` }); } catch { show("Could not open share options."); } }}
            onReport={async () => { await submitReport("post", String(t.id), "other", undefined, session?.handle || session?.name || "guest"); show("Report saved on this device. Kilode review is not connected yet."); }}
            onBlock={async () => {
              const h = String(t.handle || t.name);
              await blockUser(h, session?.handle || session?.name || "guest");
              setBlocked((prev) => (prev.includes(h) ? prev : [...prev, h]));
              show(`Blocked @${h} on this device`);
            }}
          />
        </View>
      ))}
      {takesSource === "live" && takesHasMore && takesNextCursor ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Load more posts"
          disabled={loadingMoreTakes}
          onPress={() => { void loadMoreTakes(); }}
          style={{ marginHorizontal: 14, marginTop: 4, marginBottom: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, alignItems: "center", opacity: loadingMoreTakes ? 0.65 : 1 }}
        >
          {loadingMoreTakes ? <ActivityIndicator color={C.accent} /> : <Text style={{ color: C.accent, fontSize: 13, fontWeight: "700" }}>Load more posts</Text>}
        </TouchableOpacity>
      ) : null}
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
        <Text style={s.h1}>{session.name}</Text>
        <Text style={s.sub}>@{session.handle} · {session.kind}</Text>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statN}>{takes.length}</Text><Text style={s.statL}>Takes</Text></View>
          <View style={s.stat}><Text style={s.statN}>0</Text><Text style={s.statL}>Following</Text></View>
          <View style={s.stat}><Text style={s.statN}>0</Text><Text style={s.statL}>Followers</Text></View>
        </View>
        <View style={s.rowGap}>
          <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => show("Edit profile")}><Text style={s.primaryBtnText}>Edit profile</Text></TouchableOpacity>
          <TouchableOpacity style={s.ghostBtn} onPress={() => setSettingsOpen(true)}><Text style={s.ghostBtnText}>Settings</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={[s.ghostBtn, { marginHorizontal: 16, marginTop: 10, alignItems: "center" }]} onPress={() => { signOut(); show("Signed out"); }}>
          <Text style={s.ghostBtnText}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <View style={s.sectionHead}><Text style={s.sectionTitle}>Wallet</Text></View>
      <View style={s.roomRow}>
        <View style={s.flex}><Text style={s.roomName}>₦0.00</Text><Text style={s.meta}>Paystack · backend when live</Text></View>
        <TouchableOpacity style={s.joinBtn} onPress={() => show("Top up soon")}><Text style={s.joinBtnText}>Top up</Text></TouchableOpacity>
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
    if (selectedPost) return <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} following={!!following[String(selectedPost.handle || selectedPost.name)]} onBack={() => setSelectedPost(null)} onLike={() => setLiked((prev) => ({ ...prev, [String(selectedPost.id)]: !prev[String(selectedPost.id)] }))} onComment={() => setCommentTake(selectedPost)} onFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedPost.handle || selectedPost.name)]: !prev[String(selectedPost.handle || selectedPost.name)] }))} onReport={async () => { await submitReport("post", String(selectedPost.id), "other", undefined, session?.handle || session?.name || "guest"); show("Report saved on this device. Kilode review is not connected yet."); }} onBlock={async () => { const h = String(selectedPost.handle || selectedPost.name); await blockUser(h, session?.handle || session?.name || "guest"); setBlocked((prev) => prev.includes(h) ? prev : [...prev, h]); setSelectedPost(null); show("Blocked @" + h + " on this device"); }} show={show} />;
    if (selectedProfile) return (
      <UserProfileScreen
        s={s}
        C={C}
        user={selectedProfile}
        posts={takes.filter((post: any) => String(post.handle || post.name) === String(selectedProfile.handle || selectedProfile.name))}
        isFollowing={!!following[String(selectedProfile.handle || selectedProfile.name)]}
        onBack={() => setSelectedProfile(null)}
        onToggleFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedProfile.handle || selectedProfile.name)]: !prev[String(selectedProfile.handle || selectedProfile.name)] }))}
        onOpenPost={(post) => { setSelectedProfile(null); setSelectedPost(post); }}
      />
    );
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
    if (tab === "home") return <Home />;
    if (tab === "socials") return <Socials />;
    if (tab === "activity") return <ActivityView />;
    if (tab === "myspace") return <MySpace />;
    if (tab === "chat") return <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "cinema") return <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "music") return <MusicScreen s={s} C={C} onBack={() => go("home")} show={show} onPlay={setNowPlaying} />;
    if (tab === "pushlink") return <PushLinkScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "media") return (
      <MediaScreen
        s={s}
        C={C}
        articles={news.map((n: any) => ({
          id: n.id,
          title: n.title,
          kicker: n.kicker,
          time: n.time,
          tone: n.tone,
          body: n.summary || n.description,
          author: n.author || "Kilode Editorial",
          imageUrl: n.imageUrl,
        }))}
        initialArticleId={selectedArticleId}
        onBack={() => { setSelectedArticleId(null); go("home"); }}
        show={show}
      />
    );
    if (DESKS.some((d) => d.id === tab)) return <Desk name={tab} />;
    return <Home />;
  };

  const headerTitle = settingsOpen
    ? "Settings"
    : tab === "activity"
      ? "Notifications"
      : tab === "myspace"
        ? "My Space"
        : tab === "media"
          ? "Media"
          : DESKS.find((d) => d.id === tab)?.label;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      <View style={s.flex}>{body()}</View>
      {nowPlaying ? (
        <TouchableOpacity activeOpacity={0.92} onPress={() => setMusicPlayerExpanded(true)} accessibilityRole="button" accessibilityLabel="Expand full-screen music player" style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent }]} />
          <View style={s.flex}><Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text><Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}</Text></View>
          <TouchableOpacity onPress={() => void toggleMusicPlayback()} accessibilityRole="button" accessibilityLabel={isMusicPlaying ? "Pause music" : "Resume music"} style={{ paddingHorizontal: 10 }}>
            <Text style={s.playerBtn}>{isMusicPlaying ? "Ⅱ" : "▶"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void stopMusicPlayback()} accessibilityRole="button" accessibilityLabel="Stop music"><Text style={s.playerBtn}>✕</Text></TouchableOpacity>
        </TouchableOpacity>
      ) : null}
      <MusicFullPlayer
        visible={musicPlayerExpanded && Boolean(nowPlaying)}
        track={nowPlaying}
        playing={isMusicPlaying}
        C={C}
        onClose={() => setMusicPlayerExpanded(false)}
        positionMillis={musicPositionMillis}
        durationMillis={musicDurationMillis}
        onNext={() => void playAdjacentTrack(1)}
        onPrevious={() => { if (musicPositionMillis > 3000) void seekMusicPlayback(0); else void playAdjacentTrack(-1); }}
        shuffle={musicShuffle}
        repeat={musicRepeat}
        onToggleShuffle={toggleMusicShuffle}
        onToggleRepeat={toggleMusicRepeat}
      />
      <KilodeTabBar
        active={tab === "home" || tab === "socials" || tab === "activity" || tab === "myspace" ? tab : "home"}
        onTab={(id) => go(id)}
        onCreate={() => setCreateOpen(true)}
        isDark={isDark}
        accent={C.accent}
      />

      <Modal visible={composeOpen} transparent animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setComposeOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>New take</Text><TouchableOpacity onPress={() => setComposeOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            <TextInput multiline autoFocus style={{ minHeight: 120, backgroundColor: C.input, borderRadius: 16, padding: 14, color: C.text, borderWidth: 1, borderColor: C.border, fontSize: 16, textAlignVertical: "top" }} placeholder="What is happening in Naija?" placeholderTextColor={C.text3} value={composeText} onChangeText={setComposeText} />
            <TouchableOpacity style={[s.primaryBtn, { marginTop: 14, opacity: composeText.trim() && !posting ? 1 : 0.5 }]} disabled={!composeText.trim() || posting}
              onPress={async () => {
                if (posting || !composeText.trim()) return;
                setPosting(true);
                try {
                  const r = await postTake(composeText.trim(), session.token);
                  if (r.ok && (r as any).data) {
                    setTakes((prev) => [(r as any).data, ...prev]);
                    setComposeText("");
                    setComposeOpen(false);
                    go("socials");
                    show(r.source === "live" ? "Posted live" : r.source === "error" ? "Not published · API unavailable" : "Posted local");
                  } else {
                    show(r.error ? `Could not publish: ${r.error}` : "Could not publish this post.");
                  }
                } catch {
                  show("Could not publish. Check your connection and try again.");
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
            <View style={s.sheetHead}><Text style={s.sheetTitle}>More on Kilode</Text><TouchableOpacity onPress={() => setMoreOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            <View style={s.deskGrid}>{DESKS.map((d) => (<TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}><Text style={{ fontSize: 22 }}>{d.icon}</Text><Text style={s.deskGridLabel}>{d.label}</Text></TouchableOpacity>))}</View>
          </View>
        </View>
      </Modal>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Create</Text><TouchableOpacity onPress={() => setCreateOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            <View style={s.deskGrid}>{CREATE.map((o) => (
              <TouchableOpacity key={o.label} style={s.deskGridItem} onPress={() => { if (o.label === "Post") { setCreateOpen(false); setComposeOpen(true); return; } go(o.tab); show(o.label); }}>
                <Text style={{ fontSize: 22 }}>{o.icon}</Text><Text style={s.deskGridLabel}>{o.label}</Text>
              </TouchableOpacity>
            ))}</View>
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
        storageScope={session?.handle || session?.name || "guest"}
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
