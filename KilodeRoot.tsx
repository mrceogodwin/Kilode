import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Share,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, LISTINGS } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { HomeScreen } from "./screens/HomeIOS";
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
import { getAccountCapabilities } from "./lib/accountCapabilities";
import { playMusicTrack, subscribeMusicPlayer, toggleMusicPlayback, stopMusicPlayback } from "./lib/musicPlayer";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (systemScheme === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

  const [tab, setTab] = useState("home");
  const [socialSection, setSocialSection] = useState<"feed" | "creators" | "communities">("feed");
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentTake, setCommentTake] = useState<any | null>(null);
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [homeChip, setHomeChip] = useState(0);
  const [slide, setSlide] = useState(0);
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
  const [selectedDeskItem, setSelectedDeskItem] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false);
    setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null);
  };

  useEffect(() => {
    const unsub = subscribeMusicPlayer((track, playing) => { setNowPlaying(track); setMusicPlaying(playing); });
    return () => { unsub(); };
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
    if (sources.some((x) => x === "live")) setSource("live");
    else if (sources.every((x) => x === "error")) setSource("error");
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    show(source === "error" ? "Backend offline · seed" : "Refreshed");
  };

  if (authLoading || (!session && boot)) {
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
        {title ? <Text style={s.headerTitle}>{title}</Text> : <Text style={s.brand}>Kilode<Text style={s.brandAccent}>!</Text></Text>}
      </View>
      <View style={s.headerRight}>
        <TouchableOpacity style={s.iconBtn} onPress={() => { if (tab !== "home") go("home"); setSearchOpen(true); }}>
          <Text style={s.iconBtnText}>⌕</Text>
        </TouchableOpacity>
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

  const Socials = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={s.h1}>Socials</Text>
        <Text style={s.sub}>Feed, creators and communities.</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 14 }}>
        {(["feed", "creators", "communities"] as const).map((id) => {
          const active = socialSection === id;
          const label = id === "feed" ? "Feed" : id === "creators" ? "Creators" : "Communities";
          return (
            <TouchableOpacity key={id} onPress={() => setSocialSection(id)} style={{ flex: 1, alignItems: "center", minHeight: 38, justifyContent: "center", borderRadius: 13, borderWidth: 1, borderColor: active ? C.accent : C.border, backgroundColor: active ? C.accent + "20" : C.card }}>
              <Text style={{ color: active ? C.accent : C.text2, fontSize: 12, fontWeight: active ? "800" : "600" }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {socialSection === "feed" ? (
        <>
          <View style={s.composer}>
            <View style={s.composerAv}><Text style={s.avatarText}>{(session.name || "K").slice(0, 1)}</Text></View>
            <TouchableOpacity style={s.composerInput} onPress={() => setComposeOpen(true)}><Text style={s.composerPlaceholder}>What is happening in Naija?</Text></TouchableOpacity>
            <TouchableOpacity style={s.postBtn} onPress={() => setComposeOpen(true)}><Text style={s.postBtnText}>Post</Text></TouchableOpacity>
          </View>
          {takes.filter((t: any) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || ""))).map((t: any) => (
            <View key={t.id} style={s.postCard}>
              <View style={s.postTop}>
                <TouchableOpacity onPress={() => setSelectedProfile(t)}><View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View></TouchableOpacity>
                <TouchableOpacity style={s.flex} onPress={() => setSelectedProfile(t)}>
                  <View style={s.row}><Text style={s.postName}>{t.name}</Text>{t.verified ? <Text style={s.verified}>✓</Text> : null}</View>
                  <Text style={s.meta}>@{t.handle} · {t.time} · {t.role}{t.localOnly ? " · on this device" : ""}</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.postBody}>{t.text}</Text>
              {t.mediaUrl ? <Image source={{ uri: t.mediaUrl }} style={s.postMedia} resizeMode="cover" /> : null}
              <PostActions
                liked={!!liked[t.id]}
                likes={(t.likes || 0) + (liked[t.id] ? 1 : 0)}
                comments={t.comments || 0}
                accent={C.accent} danger={C.danger} muted={C.text2}
                onLike={() => setLiked((prev) => ({ ...prev, [String(t.id)]: !prev[String(t.id)] }))}
                onComment={() => setCommentTake(t)}
                onShare={async () => { try { await Share.share({ message: `${t.name}: ${t.text}` }); } catch { show("Share unavailable"); } }}
                onReport={async () => { await submitReport("post", String(t.id), "other"); show("Reported"); }}
                onBlock={async () => { const h = String(t.handle || t.name); await blockUser(h); setBlocked((p) => (p.includes(h) ? p : [...p, h])); show(`Blocked @${h}`); }}
              />
            </View>
          ))}
        </>
      ) : socialSection === "creators" ? (
        takes.slice(0, 8).map((t: any) => (
          <TouchableOpacity key={`c-${t.id}`} style={s.roomRow} onPress={() => setSelectedProfile(t)}>
            <View style={s.roomAv}><Text style={s.roomAvText}>{(t.name || "?").slice(0, 1)}</Text></View>
            <View style={s.flex}><Text style={s.roomName}>{t.name}</Text><Text style={s.meta}>@{t.handle}</Text></View>
          </TouchableOpacity>
        ))
      ) : (
        rooms.map((r: any) => {
          const isJoined = !!joined[r.id];
          return (
            <TouchableOpacity key={r.id} style={s.roomRow}>
              <View style={s.roomAv}><Text style={s.roomAvText}>{r.av}</Text></View>
              <View style={s.flex}><Text style={s.roomName}>{r.name}</Text><Text style={s.meta}>{r.meta}</Text></View>
              <TouchableOpacity style={[s.joinBtn, isJoined && s.joinLive]} onPress={() => { setJoined({ ...joined, [r.id]: !isJoined }); show(isJoined ? `Left ${r.name}` : `Joined ${r.name}`); }}>
                <Text style={[s.joinBtnText, isJoined && s.joinLiveText]}>{isJoined ? "Joined" : "Join"}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  const ActivityView = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} refreshControl={rc}>
      <View style={s.padH}><Text style={s.h1}>Notifications</Text></View>
      {activity.map((a: any) => (
        <TouchableOpacity key={a.id} style={s.roomRow} onPress={() => go(a.lane === "music" ? "music" : "socials")}>
          <View style={s.roomAv}><Text style={{ fontSize: 18 }}>{a.icon}</Text></View>
          <View style={s.flex}><Text style={s.roomName}>{a.text}</Text><Text style={s.meta}>{a.time}</Text></View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const MySpace = () => {
    const caps = getAccountCapabilities((session as any).kind || (session as any).accountKind);
    const tools = [
      { key: "settings", label: "Settings", action: () => setSettingsOpen(true) },
      { key: "music", label: "Music", action: () => go("music") },
      { key: "cinema", label: "Cinema", action: () => go("cinema") },
      { key: "chat", label: "Chat", action: () => go("chat") },
      { key: "jobs", label: "Jobs", action: () => go("jobs") },
      { key: "market", label: "Market", action: () => go("market") },
    ];
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}>
          <Text style={s.h1}>{session.name || "My Space"}</Text>
          <Text style={s.sub}>{(session as any).kind || "member"} · {session.localOnly ? "device session" : "signed in"}</Text>
        </View>
        {tools.map((t) => (
          <TouchableOpacity key={t.key} style={s.roomRow} onPress={t.action}>
            <Text style={s.roomName}>{t.label}</Text>
            <Text style={s.meta}>Open</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[s.primaryBtn, { marginHorizontal: 16, marginTop: 16 }]} onPress={() => { signOut(); show("Signed out"); }}>
          <Text style={s.primaryBtnText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const Desk = ({ name }: { name: string }) => {
    const d = DESKS.find((x) => x.id === name);
    const items = LISTINGS[name] || [];
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
        <View style={s.padH}><Text style={s.h1}>{d?.label || name}</Text><Text style={s.sub}>{d?.blurb || "Kilode system"}</Text></View>
        {items.map((item: any) => (
          <TouchableOpacity key={item.id} style={s.roomRow} onPress={() => setSelectedDeskItem(item)}>
            <View style={s.flex}><Text style={s.roomName}>{item.title}</Text><Text style={s.meta}>{item.meta}</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const body = () => {
    if (settingsOpen) return <SettingsScreen s={s} C={C} session={session} onBack={() => setSettingsOpen(false)} onSignOut={() => { signOut(); setSettingsOpen(false); show("Signed out"); }} show={show} />;
    if (selectedPost) return <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} onBack={() => setSelectedPost(null)} onLike={() => setLiked((p) => ({ ...p, [String(selectedPost.id)]: !p[String(selectedPost.id)] }))} onComment={() => setCommentTake(selectedPost)} onShare={async () => { try { await Share.share({ message: String(selectedPost.text || "") }); } catch { show("Share unavailable"); } }} />;
    if (selectedProfile) return <UserProfileScreen s={s} C={C} user={selectedProfile} isFollowing={!!following[String(selectedProfile.handle || selectedProfile.name)]} onBack={() => setSelectedProfile(null)} onToggleFollow={() => setFollowing((p) => ({ ...p, [String(selectedProfile.handle || selectedProfile.name)]: !p[String(selectedProfile.handle || selectedProfile.name)] }))} onOpenPost={(post) => { setSelectedProfile(null); setSelectedPost(post); }} />;
    if (selectedDeskItem) return <DeskDetailScreen s={s} C={C} system={DESKS.find((d) => d.id === tab)?.label || tab} item={selectedDeskItem} onBack={() => setSelectedDeskItem(null)} show={show} />;
    if (tab === "home") {
      return (
        <HomeScreen
          s={s} C={C} takes={takes.filter((t: any) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || "")))}
          tracks={tracks} news={news} rooms={rooms} homeChip={homeChip} setHomeChip={setHomeChip}
          slide={slide} setSlide={setSlide} joined={joined} setJoined={setJoined}
          refreshing={refreshing} onRefresh={onRefresh} go={go} show={show}
          setMoreOpen={setMoreOpen} setComposeOpen={setComposeOpen}
          setSelectedProfile={setSelectedProfile} setSelectedArticleId={setSelectedArticleId}
        />
      );
    }
    if (tab === "socials") return <Socials />;
    if (tab === "activity") return <ActivityView />;
    if (tab === "myspace") return <MySpace />;
    if (tab === "chat") return <ChatScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "cinema") return <CinemaScreen s={s} C={C} onBack={() => go("home")} show={show} />;
    if (tab === "music") return <MusicScreen s={s} C={C} tracks={tracks} tracksSource={tracksSource} onBack={() => go("home")} show={show} onPlay={async (track) => { const r = await playMusicTrack(track); if (!r.ok) show(r.message || "Playback unavailable."); }} />;
    if (tab === "media") return <MediaScreen s={s} C={C} articles={news.map((n: any) => ({ id: n.id, title: n.title, kicker: n.kicker, time: n.time, tone: n.tone, body: n.summary || n.description, author: n.author || "Kilode Editorial", imageUrl: n.imageUrl }))} initialArticleId={selectedArticleId} onBack={() => { setSelectedArticleId(null); go("home"); }} show={show} />;
    if (DESKS.some((d) => d.id === tab)) return <Desk name={tab} />;
    return <Text style={s.sub}>Unknown tab</Text>;
  };

  const headerTitle = settingsOpen ? "Settings" : tab === "activity" ? "Notifications" : tab === "myspace" ? "My Space" : tab === "media" ? "Media" : DESKS.find((d) => d.id === tab)?.label;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      <View style={s.flex}>{body()}</View>
      {nowPlaying ? (
        <View style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent }]} />
          <View style={s.flex}><Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text><Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist || "Kilode artist"}</Text></View>
          <TouchableOpacity onPress={() => { void toggleMusicPlayback(); }}><Text style={s.playerBtn}>{musicPlaying ? "Ⅱ" : "▶"}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { void stopMusicPlayback(); }}><Text style={s.playerBtn}>✕</Text></TouchableOpacity>
        </View>
      ) : null}
      <KilodeTabBar active={tab === "home" || tab === "socials" || tab === "activity" || tab === "myspace" ? tab : "home"} onTab={(id) => go(id)} onCreate={() => setCreateOpen(true)} isDark={isDark} />

      <Modal visible={composeOpen} transparent animationType="slide" onRequestClose={() => setComposeOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setComposeOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>New post</Text>
            <TextInput style={s.composeArea} multiline value={composeText} onChangeText={setComposeText} placeholder="What is happening in Naija?" placeholderTextColor={C.text3} />
            <TouchableOpacity
              style={[s.primaryBtn, { opacity: posting || !composeText.trim() ? 0.5 : 1 }]}
              disabled={posting || !composeText.trim()}
              onPress={async () => {
                const bodyText = composeText.trim();
                if (!bodyText) return;
                setPosting(true);
                const res = await postTake(bodyText, {
                  token: session.token && session.token !== "guest" ? session.token : undefined,
                  name: session.name || "You",
                  handle: session.handle || "you",
                  role: (session as any).kind || "member",
                });
                setPosting(false);
                if (res.ok && res.data) {
                  setTakes((prev) => {
                    const id = String(res.data.id);
                    if (prev.some((t) => String(t.id) === id)) return prev;
                    return [res.data, ...prev];
                  });
                  setComposeText("");
                  setComposeOpen(false);
                  await loadAll();
                  if (res.source === "live") show("Posted");
                  else show((res as any).message || "Saved on this device · not live");
                } else {
                  show((res as any).message || res.error || "Could not post");
                }
              }}
            >
              <Text style={s.primaryBtnText}>{posting ? "Posting…" : "Post"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={[s.sheet, { paddingBottom: 28 }]}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Create</Text>
            {CREATE.map((c) => (
              <TouchableOpacity key={c.label} style={s.roomRow} onPress={() => { setCreateOpen(false); if (c.tab === "socials") setComposeOpen(true); else go(c.tab); }}>
                <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                <View style={[s.flex, { marginLeft: 12 }]}><Text style={s.roomName}>{c.label}</Text><Text style={s.meta}>{c.sub}</Text></View>
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
            <Text style={s.sheetTitle}>More on Kilode</Text>
            {DESKS.map((d) => (
              <TouchableOpacity key={d.id} style={s.roomRow} onPress={() => go(d.id)}>
                <Text style={{ fontSize: 20 }}>{d.icon}</Text>
                <View style={[s.flex, { marginLeft: 12 }]}><Text style={s.roomName}>{d.label}</Text><Text style={s.meta}>{d.blurb}</Text></View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {commentTake ? <CommentsSheet take={commentTake} C={C} s={s} onClose={() => setCommentTake(null)} show={show} /> : null}
      {toast ? <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View> : null}
    </SafeAreaView>
  );
}

export default function KilodeRoot() {
  return (
    <AuthProvider>
      <KilodeApp />
    </AuthProvider>
  );
}
