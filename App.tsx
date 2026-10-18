import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, ROLE_GRID, CAROUSEL as CAROUSEL_FALLBACK, LISTINGS } from "./data";
import { AuthProvider, useAuth } from "./lib/auth";
import { fetchTakes, fetchRooms, fetchNews, fetchTracks, fetchActivity } from "./lib/api";
import { API_BASE } from "./lib/config";

function KilodeApp() {
  const { session, loading: authLoading, signIn, signInGuest, signOut } = useAuth();
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [boot, setBoot] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<"live" | "mock">("mock");

  const [takes, setTakes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };
  const go = (t: string) => {
    setTab(t);
    setMoreOpen(false);
    setCreateOpen(false);
    setSearchOpen(false);
  };

  const loadAll = useCallback(async () => {
    const [t, r, n, tr, a] = await Promise.all([
      fetchTakes(),
      fetchRooms(),
      fetchNews(),
      fetchTracks(),
      fetchActivity(),
    ]);
    setTakes(Array.isArray(t.data) ? t.data : []);
    setRooms(Array.isArray(r.data) ? r.data : []);
    setNews(Array.isArray(n.data) ? n.data : []);
    setTracks(Array.isArray(tr.data) ? tr.data : []);
    setActivity(Array.isArray(a.data) ? a.data : []);
    const anyLive = [t, r, n, tr].some((x) => x.source === "live");
    setSource(anyLive ? "live" : "mock");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadAll();
      if (!cancelled) setBoot(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    show("Refreshed");
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
      <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={[s.flex, s.center, { padding: 28 }]}>
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>KILODE</Text>
          </View>
          <Text style={[s.h1, { marginTop: 20, textAlign: "center" }]}>City OS for Naija</Text>
          <Text style={[s.sub, { textAlign: "center", marginBottom: 28 }]}>
            Sign in to sync with Kilode Nine · or continue as guest
          </Text>
          <TextInput
            style={{
              width: "100%",
              backgroundColor: C.input,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
              marginBottom: 10,
              fontSize: 16,
            }}
            placeholder="Handle or email"
            placeholderTextColor={C.text3}
            autoCapitalize="none"
            value={handle}
            onChangeText={setHandle}
          />
          <TextInput
            style={{
              width: "100%",
              backgroundColor: C.input,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
              marginBottom: 16,
              fontSize: 16,
            }}
            placeholder="Password"
            placeholderTextColor={C.text3}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={[s.primaryBtn, { width: "100%" }]}
            onPress={async () => {
              const r = await signIn(handle, password);
              if (!r.ok) show(r.error || "Failed");
              else show("Welcome");
            }}
          >
            <Text style={s.primaryBtnText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.ghostBtn, { width: "100%", marginTop: 12, alignItems: "center" }]}
            onPress={() => {
              signInGuest("Guest");
              show("Guest mode");
            }}
          >
            <Text style={s.ghostBtnText}>Continue as guest</Text>
          </TouchableOpacity>
          <Text style={[s.meta, { marginTop: 20, textAlign: "center" }]}>API · {API_BASE}</Text>
        </View>
        {toast ? (
          <View style={s.toast}>
            <Text style={s.toastText}>{toast}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  const Header = ({ title }: { title?: string }) => (
    <View style={s.header}>
      <View style={s.headerLeft}>
        {title ? (
          <Text style={s.headerTitle}>{title}</Text>
        ) : (
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <View style={s.headerRight}>
        <View style={[s.chip, { paddingVertical: 4, paddingHorizontal: 8 }]}>
          <Text style={[s.chipText, { fontSize: 10 }]}>{source}</Text>
        </View>
        <TouchableOpacity style={s.iconBtn} onPress={() => setSearchOpen(true)}>
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

  const rc = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />
  );

  const Home = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={s.h1}>Good morning, Lagos</Text>
        <Text style={s.sub}>City OS · data: {source} · {session.handle}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carouselRow} decelerationRate="fast" snapToInterval={316}
        onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / 316))}>
        {CAROUSEL_FALLBACK.map((c) => (
          <TouchableOpacity key={c.id} style={[s.slide, { backgroundColor: c.color }]} onPress={() => show(c.cta)}>
            <Text style={s.slideTitle}>{c.title}</Text>
            <Text style={s.slideSub}>{c.sub}</Text>
            <View style={s.slideCta}><Text style={s.slideCtaText}>{c.cta}</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.dotsRow}>{CAROUSEL_FALLBACK.map((_, i) => <View key={i} style={[s.dot, i === slide && s.dotOn]} />)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {["For you", "Trending", "Rooms", "News"].map((c, i) => (
          <TouchableOpacity key={c} style={[s.chip, homeChip === i && s.chipOn]} onPress={() => setHomeChip(i)}>
            <Text style={[s.chipText, homeChip === i && s.chipTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Explore</Text>
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
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Music · New drops</Text>
        <TouchableOpacity onPress={() => go("music")}><Text style={s.link}>Browse</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
        {tracks.map((t: any) => (
          <TouchableOpacity key={t.id} style={[s.trackCard, { backgroundColor: t.color || C.accent }]} onPress={() => { setNowPlaying(t); show(`Playing ${t.title}`); }}>
            <Text style={s.trackPlay}>▶</Text>
            <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
            <Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>News for you</Text>
      </View>
      {news.map((n: any) => (
        <TouchableOpacity key={n.id} style={s.newsCard} onPress={() => show(n.title)}>
          <View style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} />
          <View style={s.flex}>
            <Text style={s.newsKicker}>{n.kicker} · {n.time}</Text>
            <Text style={s.newsTitle} numberOfLines={2}>{n.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Rooms · {rooms.filter((r: any) => r.live).length} live</Text>
      </View>
      {rooms.map((r: any) => {
        const isJoined = !!joined[r.id];
        return (
          <TouchableOpacity key={r.id} style={s.roomRow}>
            <View style={s.roomAv}>
              <Text style={s.roomAvText}>{r.av}</Text>
              {r.live ? <View style={s.roomLive} /> : null}
            </View>
            <View style={s.flex}>
              <Text style={s.roomName}>{r.name}</Text>
              <Text style={s.meta}>{r.live ? `${r.speaking || 0} speaking · ` : ""}{r.meta}</Text>
            </View>
            <TouchableOpacity
              style={[s.joinBtn, isJoined && s.joinLive]}
              onPress={() => {
                setJoined({ ...joined, [r.id]: !isJoined });
                show(isJoined ? `Left ${r.name}` : `Joined ${r.name}`);
              }}
            >
              <Text style={[s.joinBtnText, isJoined && s.joinLiveText]}>{isJoined ? "Joined" : "Join"}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const Socials = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.composer}>
        <View style={s.composerAv}><Text style={s.avatarText}>{(session.name || "K").slice(0, 1)}</Text></View>
        <TouchableOpacity style={s.composerInput} onPress={() => setCreateOpen(true)}>
          <Text style={s.composerPlaceholder}>What's happening in Naija?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.postBtn} onPress={() => setCreateOpen(true)}>
          <Text style={s.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>
      {takes.map((t: any) => (
        <View key={t.id} style={s.postCard}>
          <View style={s.postTop}>
            <View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View>
            <View style={s.flex}>
              <View style={s.row}>
                <Text style={s.postName}>{t.name}</Text>
                {t.verified ? <Text style={s.verified}>✓</Text> : null}
              </View>
              <Text style={s.meta}>@{t.handle} · {t.time} · {t.role}</Text>
            </View>
            <TouchableOpacity style={s.followBtn} onPress={() => show(`Following ${t.name}`)}>
              <Text style={s.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.postBody}>{t.text}</Text>
          <View style={s.postActions}>
            <TouchableOpacity style={s.action} onPress={() => setLiked({ ...liked, [t.id]: !liked[t.id] })}>
              <Text style={[s.actionText, liked[t.id] && { color: C.danger }]}>
                {liked[t.id] ? "♥" : "♡"} {(t.likes || 0) + (liked[t.id] ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={() => show("Comments")}>
              <Text style={s.actionText}>💬 {t.comments || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={() => show("Share")}>
              <Text style={s.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const ActivityView = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={s.h1}>Activity</Text>
        <Text style={s.sub}>Chronological · no algorithm</Text>
      </View>
      {activity.map((a: any) => (
        <TouchableOpacity key={a.id} style={[s.activityRow, a.unread && s.activityUnread]} onPress={() => go(a.lane || "home")}>
          <Text style={s.activityIcon}>{a.icon}</Text>
          <View style={s.flex}>
            <Text style={s.activityText}>{a.text}</Text>
            <Text style={s.meta}>{a.time} · {a.lane}</Text>
          </View>
          {a.unread ? <View style={s.unreadDot} /> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const MySpace = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.profileHead}>
        <View style={s.profileAv}>
          <Text style={s.profileAvText}>{(session.name || "K").slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={s.h1}>{session.name}</Text>
        <Text style={s.sub}>@{session.handle} · {session.kind}</Text>
        <View style={s.rowGap}>
          <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => show("Edit profile")}>
            <Text style={s.primaryBtnText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.ghostBtn} onPress={() => { signOut(); show("Signed out"); }}>
            <Text style={s.ghostBtnText}>Sign out</Text>
          </TouchableOpacity>
        </View>
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
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>{items.length ? `${items.length} listings` : "No listings yet"}</Text>
        </View>
        {items.map((item) => (
          <TouchableOpacity key={item.id} style={s.roomRow} onPress={() => show(item.title)}>
            <View style={s.flex}>
              <Text style={s.roomName}>{item.title}</Text>
              <Text style={s.meta}>{item.meta}</Text>
            </View>
            {item.price ? <Text style={[s.chipText, { fontWeight: "700", color: C.accent }]}>{item.price}</Text> : null}
            {item.tag ? (
              <View style={[s.chip, { marginLeft: 8, paddingVertical: 4 }]}>
                <Text style={[s.chipText, { fontSize: 10 }]}>{item.tag}</Text>
              </View>
            ) : null}
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
    if (DESKS.some((d) => d.id === tab)) return <Desk name={tab} />;
    return <Home />;
  };

  const headerTitle =
    tab === "activity" ? "Activity" : tab === "myspace" ? "My Space" : DESKS.find((d) => d.id === tab)?.label;

  const searchHits = searchQ.trim()
    ? [
        ...takes.filter((t) => `${t.name} ${t.text}`.toLowerCase().includes(searchQ.toLowerCase())).map((t) => ({ type: "Take", title: t.name, sub: t.text })),
        ...rooms.filter((r) => r.name.toLowerCase().includes(searchQ.toLowerCase())).map((r) => ({ type: "Room", title: r.name, sub: r.meta })),
        ...DESKS.filter((d) => d.label.toLowerCase().includes(searchQ.toLowerCase())).map((d) => ({ type: "Desk", title: d.label, sub: d.blurb })),
      ].slice(0, 12)
    : [];

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      <View style={s.flex}>{body()}</View>
      {nowPlaying ? (
        <View style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color || C.accent }]} />
          <View style={s.flex}>
            <Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text>
            <Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => setNowPlaying(null)}><Text style={s.playerBtn}>✕</Text></TouchableOpacity>
        </View>
      ) : null}
      <View style={s.dock}>
        {([["home", "Home", "⌂"], ["socials", "Socials", "◫"]] as const).map(([id, label, icon]) => (
          <TouchableOpacity key={id} style={s.dockBtn} onPress={() => go(id)}>
            <Text style={[s.dockIcon, tab === id && { color: C.accent }]}>{icon}</Text>
            <Text style={[s.dockLabel, tab === id && s.dockLabelOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.moreBtn} onPress={() => setMoreOpen(true)}>
          <Text style={s.moreBtnText}>+</Text>
        </TouchableOpacity>
        {([["activity", "Activity", "◐"], ["myspace", "My Space", "○"]] as const).map(([id, label, icon]) => (
          <TouchableOpacity key={id} style={s.dockBtn} onPress={() => go(id)}>
            <Text style={[s.dockIcon, tab === id && { color: C.accent }]}>{icon}</Text>
            <Text style={[s.dockLabel, tab === id && s.dockLabelOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={searchOpen} animationType="slide" onRequestClose={() => setSearchOpen(false)}>
        <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
          <View style={[s.header, { gap: 10 }]}>
            <TextInput
              autoFocus
              style={{
                flex: 1,
                backgroundColor: C.input,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                color: C.text,
                borderWidth: 1,
                borderColor: C.border,
              }}
              placeholder="Search takes, rooms, desks…"
              placeholderTextColor={C.text3}
              value={searchQ}
              onChangeText={setSearchQ}
            />
            <TouchableOpacity onPress={() => setSearchOpen(false)}>
              <Text style={s.link}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.scrollPad}>
            {searchHits.map((h, i) => (
              <TouchableOpacity key={i} style={s.roomRow} onPress={() => { show(h.title); setSearchOpen(false); }}>
                <View style={s.flex}>
                  <Text style={s.meta}>{h.type}</Text>
                  <Text style={s.roomName}>{h.title}</Text>
                  <Text style={s.meta} numberOfLines={1}>{h.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {searchQ && !searchHits.length ? (
              <Text style={[s.sub, { textAlign: "center", marginTop: 40 }]}>No results</Text>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>More on Kilode</Text>
              <TouchableOpacity onPress={() => setMoreOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={s.deskGrid}>
              {DESKS.map((d) => (
                <TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}>
                  <Text style={{ fontSize: 22 }}>{d.icon}</Text>
                  <Text style={s.deskGridLabel}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>Create</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}><Text style={s.sheetClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={s.deskGrid}>
              {CREATE.map((o) => (
                <TouchableOpacity key={o.label} style={s.deskGridItem} onPress={() => { go(o.tab); show(o.label); }}>
                  <Text style={{ fontSize: 22 }}>{o.icon}</Text>
                  <Text style={s.deskGridLabel}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {toast ? (
        <View style={s.toast}>
          <Text style={s.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <KilodeApp />
    </AuthProvider>
  );
}
