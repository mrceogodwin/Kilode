import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Share,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, LISTINGS } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { AuthScreen } from "./screens/Auth";
import { CommentsSheet } from "./screens/Comments";
import { KilodeTabBar } from "./components/ui";
import { SettingsScreen } from "./screens/Settings";
import { getBlockedUsers } from "./lib/moderation";
import { MediaScreen } from "./screens/Media";
import { DeskDetailScreen } from "./screens/DeskDetail";
import { UserProfileScreen } from "./screens/UserProfile";
import { PostDetailScreen } from "./screens/PostDetail";
import { getAccountCapabilities } from "./lib/accountCapabilities";
import { playMusicTrack, subscribeMusicPlayer, toggleMusicPlayback, stopMusicPlayback } from "./lib/musicPlayer";
import { HomeScreen } from "./screens/HomeScreen";
import { SocialsScreen } from "./screens/SocialsScreen";
import { ArtistReleasesScreen } from "./screens/ArtistReleases";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (system === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

  const [tab, setTab] = useState("home");
  const [socialSection, setSocialSection] = useState<"feed" | "creators" | "communities">("feed");
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
  const [tracksSource, setTracksSource] = useState<"live" | "mock" | "error">("mock");
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [artistReleasesOpen, setArtistReleasesOpen] = useState(false);
  const [artistComposeInitial, setArtistComposeInitial] = useState(false);
  const [selectedDeskItem, setSelectedDeskItem] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const go = (t: string) => {
    setTab(t);
    setMoreOpen(false);
    setCreateOpen(false);
    setComposeOpen(false);
    setSettingsOpen(false);
    setArtistReleasesOpen(false);
    setArtistComposeInitial(false);
    setSelectedDeskItem(null);
    setSelectedProfile(null);
    setSelectedPost(null);
  };

  useEffect(() => {
    const unsubscribe = subscribeMusicPlayer((track: any, playing: boolean) => { setNowPlaying(track); setMusicPlaying(playing); });
    return () => { unsubscribe(); };
  }, []);

  const loadAll = useCallback(async () => {
    const [t, r, n, tr, a] = await Promise.all([fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity()]);
    setTakes(Array.isArray(t.data) ? t.data : []);
    setRooms(Array.isArray(r.data) ? r.data : []);
    setNews(Array.isArray(n.data) ? n.data : []);
    setTracks(Array.isArray(tr.data) ? tr.data : []);
    setTracksSource(tr.source);
    setActivity(Array.isArray(a.data) ? a.data : []);
    const sources = [t, r, n, tr].map((x) => x.source);
    if (sources.some((s) => s === "live")) setSource("live");
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

  if (authLoading) {
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

  if (boot) {
    return (
      <SafeAreaView style={[s.root, s.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.accent} size="large" />
        <Text style={[s.sub, { marginTop: 12 }]}>Loading Kilode…</Text>
      </SafeAreaView>
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

  const ActivityView = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}><Text style={s.h1}>Notifications</Text></View>
      {activity.map((a: any) => (
        <View key={a.id} style={s.roomRow}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>{a.icon}</Text>
          <View style={s.flex}><Text style={s.roomName}>{a.text}</Text><Text style={s.meta}>{a.time}</Text></View>
        </View>
      ))}
    </ScrollView>
  );

  const caps = getAccountCapabilities((session as any).accountKind || (session as any).kind);
  const MySpace = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <Text style={s.h1}>My Space</Text>
        <Text style={s.sub}>{session.name} · {(session as any).accountKind || (session as any).kind || "member"}</Text>
      </View>
      <TouchableOpacity style={s.roomRow} onPress={() => setSettingsOpen(true)}>
        <Text style={s.roomName}>Settings</Text>
        <Text style={s.meta}>Theme, account, moderation</Text>
      </TouchableOpacity>
      {caps.musicReleaseManagement ? (
        <TouchableOpacity
          style={s.roomRow}
          onPress={() => {
            setArtistComposeInitial(false);
            setArtistReleasesOpen(true);
            setSettingsOpen(false);
          }}
        >
          <Text style={s.roomName}>Artist releases</Text>
          <Text style={s.meta}>Local drafts · upload when backend is live</Text>
        </TouchableOpacity>
      ) : null}
      {caps.musicReleaseManagement ? (
        <TouchableOpacity style={s.roomRow} onPress={() => go("music")}>
          <Text style={s.roomName}>Music discovery</Text>
          <Text style={s.meta}>Charts, library, sample playback</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={s.roomRow} onPress={() => { signOut(); show("Signed out"); }}>
        <Text style={[s.roomName, { color: C.danger }]}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const Desk = ({ name }: { name: string }) => {
    const items = LISTINGS[name] || [];
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <TouchableOpacity onPress={() => go("home")}><Text style={s.link}>‹ Home</Text></TouchableOpacity>
          <Text style={s.h1}>{DESKS.find((d) => d.id === name)?.label || name}</Text>
        </View>
        {items.length === 0 ? (
          <Text style={[s.sub, s.padH]}>Nothing listed yet · seed empty</Text>
        ) : items.map((it) => (
          <TouchableOpacity key={it.id} style={s.roomRow} onPress={() => setSelectedDeskItem({ ...it, system: name })}>
            <View style={s.flex}><Text style={s.roomName}>{it.title}</Text><Text style={s.meta}>{it.meta}</Text></View>
            {it.price ? <Text style={[s.meta, { color: C.accent }]}>{it.price}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  let body: React.ReactNode = null;
  if (settingsOpen) {
    body = <SettingsScreen s={s} C={C} isDark={isDark} themeMode={themeMode} setThemeMode={setThemeMode} onBack={() => setSettingsOpen(false)} onSignOut={() => { signOut(); setSettingsOpen(false); }} show={show} />;
  } else if (artistReleasesOpen && caps.musicReleaseManagement) {
    body = (
      <ArtistReleasesScreen
        s={s}
        C={C}
        sessionName={session.name}
        onBack={() => {
          setArtistReleasesOpen(false);
          setArtistComposeInitial(false);
        }}
        show={show}
        initialCompose={artistComposeInitial}
      />
    );
  } else if (selectedProfile) {
    body = <UserProfileScreen s={s} C={C} profile={selectedProfile} onBack={() => setSelectedProfile(null)} show={show} />;
  } else if (selectedPost) {
    body = <PostDetailScreen s={s} C={C} post={selectedPost} onBack={() => setSelectedPost(null)} show={show} />;
  } else if (selectedDeskItem) {
    body = <DeskDetailScreen s={s} C={C} system={selectedDeskItem.system} item={selectedDeskItem} onBack={() => setSelectedDeskItem(null)} show={show} />;
  } else if (tab === "home") {
    body = (
      <HomeScreen
        s={s} C={C} takes={takes} tracks={tracks} news={news} rooms={rooms}
        homeChip={homeChip} setHomeChip={setHomeChip} slide={slide} setSlide={setSlide}
        joined={joined} setJoined={setJoined} refreshing={refreshing} onRefresh={onRefresh}
        go={go} show={show} setMoreOpen={setMoreOpen} setComposeOpen={setComposeOpen}
        setSelectedProfile={setSelectedProfile} setSelectedArticleId={setSelectedArticleId}
      />
    );
  } else if (tab === "socials") {
    body = (
      <SocialsScreen
        s={s} C={C} session={session} takes={takes} blocked={blocked} setBlocked={setBlocked}
        socialSection={socialSection} setSocialSection={setSocialSection}
        liked={liked} setLiked={setLiked} following={following} setFollowing={setFollowing}
        refreshing={refreshing} onRefresh={onRefresh} setComposeOpen={setComposeOpen}
        setCommentTake={setCommentTake} setSelectedProfile={setSelectedProfile} show={show}
      />
    );
  } else if (tab === "activity") {
    body = <ActivityView />;
  } else if (tab === "myspace") {
    body = <MySpace />;
  } else if (tab === "chat") {
    body = <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
  } else if (tab === "cinema") {
    body = <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} />;
  } else if (tab === "music") {
    body = (
      <MusicScreen
        s={s} C={C} tracks={tracks} tracksSource={tracksSource}
        onBack={() => go("home")} show={show}
        onPlay={async (track) => {
          const result = await playMusicTrack(track, { queue: tracks });
          if (!result.ok) show(result.message || "Playback unavailable.");
        }}
      />
    );
  } else if (tab === "media") {
    body = (
      <MediaScreen
        s={s} C={C}
        articles={news.map((n: any) => ({
          id: n.id, title: n.title, kicker: n.kicker, time: n.time, tone: n.tone,
          body: n.summary || n.description, author: n.author || "Kilode Editorial", imageUrl: n.imageUrl,
        }))}
        initialArticleId={selectedArticleId}
        onBack={() => { setSelectedArticleId(null); go("home"); }}
        show={show}
      />
    );
  } else if (DESKS.some((d) => d.id === tab)) {
    body = <Desk name={tab} />;
  } else {
    body = (
      <HomeScreen
        s={s} C={C} takes={takes} tracks={tracks} news={news} rooms={rooms}
        homeChip={homeChip} setHomeChip={setHomeChip} slide={slide} setSlide={setSlide}
        joined={joined} setJoined={setJoined} refreshing={refreshing} onRefresh={onRefresh}
        go={go} show={show} setMoreOpen={setMoreOpen} setComposeOpen={setComposeOpen}
        setSelectedProfile={setSelectedProfile} setSelectedArticleId={setSelectedArticleId}
      />
    );
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header
        title={
          settingsOpen
            ? "Settings"
            : artistReleasesOpen
              ? "Releases"
              : tab === "activity"
                ? "Notifications"
                : tab === "myspace"
                  ? "My Space"
                  : undefined
        }
      />
      {body}
      {nowPlaying ? (
        <View style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent }]} />
          <View style={s.flex}>
            <Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text>
            <Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist || "Kilode artist"}</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={musicPlaying ? "Pause music" : "Resume music"} onPress={() => { void toggleMusicPlayback(); }}>
            <Text style={s.playerBtn}>{musicPlaying ? "Ⅱ" : "▶"}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Stop music" onPress={() => { void stopMusicPlayback(); }}>
            <Text style={s.playerBtn}>✕</Text>
          </TouchableOpacity>
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
            <View style={s.sheetHead}><Text style={s.sheetTitle}>New take</Text><TouchableOpacity onPress={() => setComposeOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            <TextInput multiline autoFocus style={{ minHeight: 120, backgroundColor: C.input, borderRadius: 16, padding: 14, color: C.text, borderWidth: 1, borderColor: C.border, fontSize: 16, textAlignVertical: "top" }} placeholder="What is happening in Naija?" placeholderTextColor={C.text3} value={composeText} onChangeText={setComposeText} />
            <TouchableOpacity style={[s.primaryBtn, { marginTop: 14, opacity: composeText.trim() && !posting ? 1 : 0.5 }]} disabled={!composeText.trim() || posting}
              onPress={async () => {
                setPosting(true);
                const r = await postTake(composeText, session.token);
                setPosting(false);
                if (r.ok && (r as any).data) {
                  setTakes((prev) => [(r as any).data, ...prev]);
                  setComposeText(""); setComposeOpen(false); go("socials");
                  show("Posted");
                } else {
                  show("Could not post · try again");
                }
              }}
            >
              <Text style={s.primaryBtnText}>{posting ? "Posting…" : "Post"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Create</Text><TouchableOpacity onPress={() => setCreateOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            {CREATE.map((c) => (
              <TouchableOpacity
                key={c.label}
                style={s.roomRow}
                onPress={() => {
                  setCreateOpen(false);
                  if (c.tab === "socials") {
                    setComposeOpen(true);
                    return;
                  }
                  // Track → Artist Releases (compose) when account has musicReleaseManagement
                  if (c.label === "Track" && caps.musicReleaseManagement) {
                    setArtistComposeInitial(true);
                    setArtistReleasesOpen(true);
                    setSettingsOpen(false);
                    show("Local release draft · not uploaded yet");
                    return;
                  }
                  go(c.tab);
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 12 }}>{c.icon}</Text>
                <View style={s.flex}>
                  <Text style={s.roomName}>{c.label}</Text>
                  <Text style={s.meta}>
                    {c.label === "Track" && caps.musicReleaseManagement
                      ? "Local draft · upload when backend is live"
                      : c.sub}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>All desks</Text><TouchableOpacity onPress={() => setMoreOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            {DESKS.map((d) => (
              <TouchableOpacity key={d.id} style={s.roomRow} onPress={() => { setMoreOpen(false); go(d.id); }}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{d.icon}</Text>
                <View style={s.flex}><Text style={s.roomName}>{d.label}</Text><Text style={s.meta}>{d.blurb}</Text></View>
              </TouchableOpacity>
            ))}
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
