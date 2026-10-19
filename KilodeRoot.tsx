import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal, Share,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, ROLE_GRID, CAROUSEL as CAROUSEL_FALLBACK, LISTINGS, STORIES } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity, postTake } from "./lib/api";
import { ChatScreen } from "./screens/Chat";
import { CinemaScreen } from "./screens/Cinema";
import { MusicScreen } from "./screens/Music";
import { AuthScreen } from "./screens/Auth";
import { CommentsSheet } from "./screens/Comments";
import { KilodeTabBar } from "./components/ui";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signUp, signInGuest, signOut } = useAuth();
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("light");
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
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayHandle, setDisplayHandle] = useState("");
  const [displayBio, setDisplayBio] = useState("");
  const [profileName, setProfileName] = useState(session?.name || "");
  const [profileHandle, setProfileHandle] = useState(session?.handle || "");
  const [profileBio, setProfileBio] = useState("");

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false);
  };

  const loadAll = useCallback(async () => {
    const [t, r, n, tr, a] = await Promise.all([fetchTakes(), fetchRooms(), fetchNews(), fetchTracks(), fetchActivity()]);
    setTakes(Array.isArray(t.data) ? t.data : []);
    setRooms(Array.isArray(r.data) ? r.data : []);
    setNews(Array.isArray(n.data) ? n.data : []);
    setTracks(Array.isArray(tr.data) ? tr.data : []);
    setActivity(Array.isArray(a.data) ? a.data : []);
    const sources = [t, r, n, tr].map((x) => x.source);
    if (sources.some((s) => s === "live")) setSource("live");
    else if (sources.every((s) => s === "error")) setSource("error");
    else setSource("mock");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => { await loadAll(); if (!cancelled) setBoot(false); })();
    return () => { cancelled = true; };
  }, [loadAll]);

  const onRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); show(source === "error" ? "Backend offline · seed" : "Refreshed"); };

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
        onGoogle={() => { signInGuest("Google User"); show("Google sign-in · client IDs not configured"); }}
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
        <Text style={s.h1}>Good morning</Text>
        <Text style={s.sub}>{session.handle} · {session.kind}</Text>
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
            <View style={s.storyRing}><View style={s.storyInner}><Text style={{ color: C.text, fontWeight: "700" }}>{st.av}</Text></View></View>
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
          <View style={s.sectionHead}><Text style={s.sectionTitle}>Explore</Text><TouchableOpacity onPress={() => setMoreOpen(true)}><Text style={s.link}>More</Text></TouchableOpacity></View>
          <View style={s.grid4}>{ROLE_GRID.map((r) => (<TouchableOpacity key={r.id} style={s.gridCell} onPress={() => go(r.id)}><Text style={s.gridIcon}>{r.icon}</Text><Text style={s.gridLabel}>{r.label}</Text></TouchableOpacity>))}</View>
        </>
      )}
      {(homeChip === 0 || homeChip === 1) && (
        <>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>{homeChip === 1 ? "Trending takes" : "Music · New drops"}</Text><TouchableOpacity onPress={() => go(homeChip === 1 ? "socials" : "music")}><Text style={s.link}>{homeChip === 1 ? "Socials" : "Browse"}</Text></TouchableOpacity></View>
          {homeChip === 1 ? (
            takes.slice().sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0)).slice(0, 5).map((t: any) => (
              <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => go("socials")}>
                <View style={s.roomAv}><Text style={s.roomAvText}>{(t.name || "?").slice(0, 1)}</Text></View>
                <View style={s.flex}><Text style={s.roomName} numberOfLines={1}>{t.name}</Text><Text style={s.meta} numberOfLines={2}>{t.text}</Text></View>
                <Text style={[s.meta, { fontWeight: "700", color: C.accent }]}>♥ {t.likes || 0}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
              {tracks.map((t: any) => (
                <TouchableOpacity key={t.id} style={[s.trackCard, { backgroundColor: t.color || C.accent }]} onPress={() => { setNowPlaying(t); show(`Selected ${t.title}. Audio playback is not connected in this preview yet.`); }}>
                  <Text style={s.trackPlay}>▶</Text><Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text><Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
      {(homeChip === 0 || homeChip === 3) && (
        <>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>News for you</Text></View>
          {news.map((n: any) => (
            <TouchableOpacity key={n.id} style={s.newsCard} onPress={() => setDetailItem({ ...n, description: n.summary || n.description || "Full article content will appear here when the media service is connected." })}>
              <View style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} />
              <View style={s.flex}><Text style={s.newsKicker}>{n.kicker} · {n.time}</Text><Text style={s.newsTitle} numberOfLines={2}>{n.title}</Text></View>
            </TouchableOpacity>
          ))}
        </>
      )}
      {(homeChip === 0 || homeChip === 2) && (
        <>
          <View style={s.sectionHead}><Text style={s.sectionTitle}>Rooms · {rooms.filter((r: any) => r.live).length} live</Text></View>
          {rooms.map((r: any) => {
            const isJoined = !!joined[r.id];
            return (
              <TouchableOpacity key={r.id} style={s.roomRow}>
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
      {takes.map((t: any) => (
        <View key={t.id} style={s.postCard}>
          <View style={s.postTop}>
            <View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View>
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
          <View style={s.postActions}>
            <TouchableOpacity style={s.action} onPress={() => setLiked({ ...liked, [t.id]: !liked[t.id] })}>
              <Text style={[s.actionText, liked[t.id] && { color: C.danger }]}>{liked[t.id] ? "♥" : "♡"} {(t.likes || 0) + (liked[t.id] ? 1 : 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={() => setCommentTake(t)}><Text style={s.actionText}>💬 {t.comments || 0}</Text></TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={async () => { try { await Share.share({ message: `${t.name}: ${t.text}` }); } catch { show("Could not open share sheet"); } }}><Text style={s.actionText}>Share</Text></TouchableOpacity>
          </View>
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
          <TouchableOpacity key={item.id} style={s.roomRow} onPress={() => setDetailItem({ ...item, description: item.tag ? `${item.tag} · ${item.meta}` : item.meta, section: d?.label || name })}>
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

  const headerTitle = tab === "activity" ? "Notifications" : tab === "myspace" ? "My Space" : DESKS.find((d) => d.id === tab)?.label;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      <View style={s.flex}>{body()}</View>
      {nowPlaying ? (
        <View style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent }]} />
          <View style={s.flex}><Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text><Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}</Text></View>
          <TouchableOpacity onPress={() => setNowPlaying(null)}><Text style={s.playerBtn}>✕</Text></TouchableOpacity>
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


      <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setEditOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>Edit profile</Text><TouchableOpacity onPress={() => setEditOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            <Text style={[s.meta, { marginBottom: 6 }]}>Display name</Text>
            <TextInput value={profileName} onChangeText={setProfileName} placeholder="Your name" placeholderTextColor={C.text3} style={{ backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, color: C.text, marginBottom: 12 }} />
            <Text style={[s.meta, { marginBottom: 6 }]}>Username</Text>
            <TextInput value={profileHandle} onChangeText={setProfileHandle} autoCapitalize="none" placeholder="username" placeholderTextColor={C.text3} style={{ backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, color: C.text, marginBottom: 12 }} />
            <Text style={[s.meta, { marginBottom: 6 }]}>Bio</Text>
            <TextInput value={profileBio} onChangeText={setProfileBio} placeholder="A little about you" placeholderTextColor={C.text3} multiline style={{ minHeight: 76, backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, color: C.text, marginBottom: 14, textAlignVertical: "top" }} />
            <TouchableOpacity style={s.primaryBtn} onPress={() => { setDisplayName(profileName.trim() || session.name || ""); setDisplayHandle(profileHandle.trim().replace(/^@/, "") || session.handle || ""); setDisplayBio(profileBio.trim()); setEditOpen(false); show("Profile updated on this device. Account sync is not connected yet."); }}><Text style={s.primaryBtnText}>Save changes</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!detailItem} transparent animationType="slide" onRequestClose={() => setDetailItem(null)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setDetailItem(null)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}><Text style={s.sheetTitle}>{detailItem?.title || "Details"}</Text><TouchableOpacity onPress={() => setDetailItem(null)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity></View>
            {detailItem?.section ? <Text style={[s.newsKicker, { marginBottom: 8 }]}>{detailItem.section}</Text> : null}
            {detailItem?.price ? <Text style={[s.h1, { marginBottom: 8 }]}>{detailItem.price}</Text> : null}
            <Text style={[s.sub, { marginBottom: 8 }]}>{detailItem?.meta || detailItem?.kicker || "Kilode"}</Text>
            <Text style={{ color: C.text, fontSize: 15, lineHeight: 23 }}>{detailItem?.description || detailItem?.synopsis || "More details will appear here as this Kilode service is connected."}</Text>
            <TouchableOpacity style={[s.primaryBtn, { marginTop: 18 }]} onPress={() => { show("Action is not connected to a live service yet."); setDetailItem(null); }}><Text style={s.primaryBtnText}>Close details</Text></TouchableOpacity>
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
