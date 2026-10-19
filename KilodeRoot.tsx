import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Share,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Platform,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, ROLE_GRID, CAROUSEL as CAROUSEL_FALLBACK, LISTINGS, STORIES, TAKES, ROOMS, NEWS, TRACKS, ACTIVITY } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { AuthScreen } from "./screens/Auth";
import { MediaScreen } from "./screens/Media";
import { SettingsScreen } from "./screens/Settings";
import { DeskDetailScreen } from "./screens/DeskDetail";
import { CommentsSheet } from "./screens/Comments";
import { KilodeTabBar } from "./components/ui";
import { Ionicons } from "@expo/vector-icons";
import { PostActions } from "./components/ui/PostActions";
import { SectionHeader } from "./components/ui/SectionHeader";
import { EmptyState } from "./components/ui/EmptyState";
import { ConnectionBanner } from "./components/ui/ConnectionBanner";
import { blockUser, submitReport, getBlockedUsers } from "./lib/moderation";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  // Web preview only: open directly into a clearly seeded guest feed so reviewers can
  // inspect the real native screen structure without creating an account. iOS keeps auth.
  useEffect(() => {
    if (Platform.OS === "web" && !authLoading && !session) signInGuest("Guest");
  }, [authLoading, session, signInGuest]);
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (system === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

  const [tab, setTab] = useState("home");
  const [homeChip, setHomeChip] = useState(0);
  const [slide, setSlide] = useState(0);
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
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false); setSelectedDeskItem(null);
  };

  const loadAll = useCallback(async () => {
    const [t, r, n, tr, a] = await Promise.all([fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity()]);
    // The old Kilode Nine page currently server-renders “No posts yet”, and its mobile
    // bridge is not connected to this preview. Use the actual in-repo demo dataset on web
    // so the preview never looks empty; on iOS prefer API data but safely fall back if empty.
    const previewWeb = Platform.OS === "web";
    setTakes(!previewWeb && Array.isArray(t.data) && t.data.length ? t.data : TAKES);
    setRooms(!previewWeb && Array.isArray(r.data) && r.data.length ? r.data : ROOMS);
    setNews(!previewWeb && Array.isArray(n.data) && n.data.length ? n.data : NEWS);
    setTracks(!previewWeb && Array.isArray(tr.data) && tr.data.length ? tr.data : TRACKS);
    setActivity(Array.isArray(a.data) && a.data.length ? a.data : ACTIVITY);
    const sources = [t, r, n, tr].map((x) => x.source);
    if (previewWeb) setSource("mock");
    else if (sources.some((s) => s === "live" && [t, r, n, tr].some((x) => x.data?.length))) setSource("live");
    else if (sources.every((s) => s === "error")) setSource("error");
    else setSource("mock");
  }, []);

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

  const onRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); show(source === "error" ? "Backend offline · seed" : "Refreshed"); };

  if (boot || authLoading || (Platform.OS === "web" && !session)) {
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
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: C.text3, letterSpacing: 0.4, textTransform: "uppercase" }}>For you</Text>
        <Text style={{ fontSize: 18, fontWeight: "700", color: C.text, letterSpacing: -0.3, marginTop: 2 }}>{session.name || session.handle}</Text>
        <Text style={[s.sub, { marginBottom: 4 }]}>{session.kind} · Kilode</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselRow} decelerationRate="fast" snapToInterval={316} onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / 316))}>
        {CAROUSEL_FALLBACK.map((c) => (
          <TouchableOpacity key={c.id} style={[s.slide, { backgroundColor: c.color }]} onPress={() => { const key = c.cta.toLowerCase(); if (key === "play") go("music"); else if (key === "jobs") go("jobs"); else if (key === "cinema") go("cinema"); else setMoreOpen(true); }}>
            <Text style={s.slideTitle}>{c.title}</Text>
            <Text style={s.slideSub}>{c.sub}</Text>
            <View style={s.slideCta}><Text style={s.slideCtaText}>{c.cta}</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.dotsRow}>{CAROUSEL_FALLBACK.map((_, i) => <View key={i} style={[s.dot, i === slide && s.dotOn]} />)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storyRow}>
        {STORIES.map((st) => (
          <TouchableOpacity key={st.id} style={s.story} onPress={() => setDetailItem({ title: `${st.label} story`, meta: "Story preview", description: `Stories from ${st.label} will appear here when published.` })}>
            <View style={s.storyRing}><View style={s.storyInner}>{st.avatarUrl ? <Image source={{ uri: st.avatarUrl }} style={{ width: 42, height: 42, borderRadius: 21 }} resizeMode="cover" /> : <Text style={{ color: C.text, fontWeight: "700" }}>{st.av}</Text>}</View></View>
            <Text style={s.storyLabel} numberOfLines={1}>{st.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {["For you", "Trending", "Rooms", "News"].map((c, i) => (
          <TouchableOpacity key={c} style={[s.chip, homeChip === i && s.chipOn]} onPress={() => setHomeChip(i)}>
            <Text style={[s.chipText, homeChip === i && s.chipTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {(homeChip === 0 || homeChip === 1) && (
        <>
          <SectionHeader title="Explore" actionLabel="More" onAction={() => setMoreOpen(true)} titleColor={C.text} actionColor={C.accent} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 4, paddingBottom: 4 }}>
            {ROLE_GRID.map((r) => (
              <TouchableOpacity key={r.id} style={s.gridCell} onPress={() => go(r.id)}>
                <Text style={s.gridIcon}>{r.icon}</Text>
                <Text style={s.gridLabel}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
      {(homeChip === 0 || homeChip === 1) && (
        <>
          <SectionHeader title={homeChip === 1 ? "Trending takes" : "Music · New drops"} actionLabel={homeChip === 1 ? "Socials" : "Browse"} onAction={() => go(homeChip === 1 ? "socials" : "music")} titleColor={C.text} actionColor={C.accent} />
          {homeChip === 1 ? (
            takes.slice().sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0)).slice(0, 5).map((t: any) => (
              <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => go("socials")}>
                <View style={s.roomAv}><Text style={s.roomAvText}>{(t.name || "?").slice(0, 1)}</Text></View>
                <View style={s.flex}><Text style={s.roomName} numberOfLines={1}>{t.name}</Text><Text style={s.meta} numberOfLines={2}>{t.text}</Text></View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><Ionicons name="heart" size={14} color={C.accent} /><Text style={[s.meta, { fontWeight: "700", color: C.accent }]}>{t.likes || 0}</Text></View>
              </TouchableOpacity>
            ))
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
              {tracks.map((t: any) => (
                <TouchableOpacity key={t.id} style={[s.trackCard, { backgroundColor: t.color || C.accent }]} onPress={() => { setNowPlaying(t); show(`Selected ${t.title}. Audio playback is not connected in this preview yet.`); }}>
                  <Ionicons name="play" size={18} color="#fff" style={{ marginBottom: 6 }} /><Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text><Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
      {(homeChip === 0 || homeChip === 3) && (
        <>
          <SectionHeader title="Media" actionLabel="See all" onAction={() => { setSelectedArticleId(null); go("media"); }} titleColor={C.text} actionColor={C.accent} />
          {news.map((n: any) => (
            <TouchableOpacity key={n.id} style={s.newsCard} onPress={() => { setSelectedArticleId(String(n.id)); go("media"); }}>
              {n.imageUrl ? <Image source={{ uri: n.imageUrl }} style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} resizeMode="cover" /> : <View style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} />}
              <View style={s.flex}><Text style={s.newsKicker}>{n.kicker} · {n.time}</Text><Text style={s.newsTitle} numberOfLines={2}>{n.title}</Text></View>
            </TouchableOpacity>
          ))}
        </>
      )}
      {(homeChip === 0 || homeChip === 2) && (
        <>
          <SectionHeader title={`Rooms · ${rooms.filter((r: any) => r.live).length} live`} titleColor={C.text} actionColor={C.accent} />
          {rooms.map((r: any) => {
            const isJoined = !!joined[r.id];
            return (
              <TouchableOpacity key={r.id} style={s.roomRow} onPress={() => setDetailItem({ title: r.name, meta: r.meta, description: `${r.live ? `${r.speaking || 0} people speaking. ` : ""}This is a preview room. Live audio and room messaging are not connected yet.` })}>
                <View style={s.roomAv}><Text style={s.roomAvText}>{r.av}</Text>{r.live ? <View style={s.roomLive} /> : null}</View>
                <View style={s.flex}><Text style={s.roomName}>{r.name}</Text><Text style={s.meta}>{r.live ? `${r.speaking || 0} speaking · ` : ""}{r.meta}</Text></View>
                <TouchableOpacity style={[s.joinBtn, isJoined && s.joinLive]} onPress={() => { setJoined({ ...joined, [r.id]: !isJoined }); show(isJoined ? `Left ${r.name}` : `Joined ${r.name}`); }}>
                  <Text style={[s.joinBtnText, isJoined && s.joinLiveText]}>{isJoined ? "Joined" : "Join"}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </>
      )}
      <View style={{ height: 20 }} />
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
            <View style={s.postAv}>{t.avatarUrl ? <Image source={{ uri: t.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} /> : <Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text>}</View>
            <View style={s.flex}>
              <View style={s.row}><Text style={s.postName}>{t.name}</Text>{t.verified ? <Text style={s.verified}>✓</Text> : null}</View>
              <Text style={s.meta}>@{t.handle} · {t.time} · {t.role}</Text>
            </View>
            <TouchableOpacity style={s.followBtn} onPress={() => { setFollowing((prev) => ({ ...prev, [t.id]: !prev[t.id] })); show(following[t.id] ? `Unfollowed ${t.name}` : `Following ${t.name}`); }}><Text style={s.followBtnText}>{following[t.id] ? "Following" : "Follow"}</Text></TouchableOpacity>
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
                setPosting(true);
                const r = await postTake(composeText, session.token);
                setPosting(false);
                if (r.ok && (r as any).data) {
                  setTakes((prev) => [(r as any).data, ...prev]);
                  setComposeText(""); setComposeOpen(false); go("socials");
                  show(r.source === "live" ? "Posted live" : r.source === "error" ? "Saved offline (API error)" : "Posted local");
                } else show("Could not post");
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
            <View style={s.deskGrid}>{DESKS.map((d) => (<TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}><Text style={{ fontSize: 22 }}>{d.icon}</Text><Text style={s.deskGridLabel}>{d.label}</Text></TouchableOpacity>))}</View>
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
                <Text style={{ fontSize: 22 }}>{o.icon}</Text><Text style={s.deskGridLabel}>{o.label}</Text>
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
