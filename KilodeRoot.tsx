import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal,
  useColorScheme, TextInput, ActivityIndicator, RefreshControl, Image, Share,
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
  const [activity, setActivity] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDeskItem, setSelectedDeskItem] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };
  const go = (t: string) => {
    setTab(t); setMoreOpen(false); setCreateOpen(false); setComposeOpen(false); setSettingsOpen(false); setSelectedDeskItem(null); setSelectedProfile(null); setSelectedPost(null);
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
    (async () => {
      const b = await getBlockedUsers();
      if (!cancelled) setBlocked(b);
      await loadAll();
      if (!cancelled) setBoot(false);
    })();
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
              <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => { go("socials"); setSelectedProfile(t); }}>
                <View style={s.roomAv}><Text style={s.roomAvText}>{(t.name || "?").slice(0, 1)}</Text></View>
                <View style={s.flex}><Text style={s.roomName} numberOfLines={1}>{t.name}</Text><Text style={s.meta} numberOfLines={2}>{t.text}</Text></View>
                <Text style={[s.meta, { fontWeight: "700", color: C.accent }]}>♥ {t.likes || 0}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
              {tracks.map((t: any) => (
                <TouchableOpacity key={t.id} style={[s.trackCard, { backgroundColor: t.color || C.accent }]} onPress={() => { setNowPlaying(t); show(`Playing ${t.title}`); }}>
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
            <TouchableOpacity key={n.id} style={s.newsCard} onPress={() => { setSelectedArticleId(String(n.id)); go("media"); }}>
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
      <View style={s.padH}>
        <Text style={s.h1}>Socials</Text>
        <Text style={s.sub}>Your people, creators and communities in one place.</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 14 }}>
        {([
          { id: "feed", label: "Feed" },
          { id: "creators", label: "Creators" },
          { id: "communities", label: "Communities" },
        ] as const).map((item) => {
          const active = socialSection === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSocialSection(item.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: 38, paddingHorizontal: 8, borderRadius: 13, borderWidth: 1, borderColor: active ? C.accent : C.border, backgroundColor: active ? C.accent + "20" : C.card }}
            >
              <Text style={{ color: active ? C.accent : C.text2, fontSize: 12, fontWeight: active ? "800" : "600" }}>{item.label}</Text>
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
            onShare={async () => { try { await Share.share({ message: `${t.name} (@${t.handle}) on Kilode:\n\n${t.text}` }); } catch { show("Could not open share options."); } }}
            onReport={async () => { await submitReport("post", String(t.id), "other"); show("Reported · under review"); }}
            onBlock={async () => {
              const h = String(t.handle || t.name);
              await blockUser(h);
              setBlocked((prev) => (prev.includes(h) ? prev : [...prev, h]));
              show(`Blocked @${h}`);
            }}
          />
        </View>
      ))}

          <View style={{ height: 20 }} />
        </>
      ) : socialSection === "creators" ? (
        <>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={s.sectionTitle}>Discover creators</Text>
            <Text style={s.sub}>Artists, writers, publishers and people making things on Kilode.</Text>
          </View>
          {takes
            .filter((t: any) => /artist|writer|creator|brand|publisher/i.test(String(t.role || "")))
            .filter((t: any) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || "")))
            .filter((t: any, index: number, list: any[]) => list.findIndex((candidate: any) => String(candidate.handle || candidate.name) === String(t.handle || t.name)) === index)
            .map((t: any) => (
              <View key={String(t.handle || t.name)} style={[s.postCard, { paddingVertical: 13 }]}>
                <View style={s.postTop}>
                  <TouchableOpacity onPress={() => setSelectedProfile(t)} accessibilityRole="button" accessibilityLabel={`View ${t.name}'s profile`}>
                    <View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.flex} onPress={() => setSelectedProfile(t)} accessibilityRole="button">
                    <View style={s.row}>
                      <Text style={s.postName} numberOfLines={1}>{t.name}</Text>
                      {t.verified ? <Text style={s.verified}>✓</Text> : null}
                    </View>
                    <Text style={s.meta} numberOfLines={1}>@{t.handle} · {t.role}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.followBtn}
                    onPress={() => setFollowing((prev) => ({ ...prev, [String(t.handle || t.name)]: !prev[String(t.handle || t.name)] }))}
                    accessibilityRole="button"
                    accessibilityLabel={following[String(t.handle || t.name)] ? `Unfollow ${t.name}` : `Follow ${t.name}`}
                  >
                    <Text style={s.followBtnText}>{following[String(t.handle || t.name)] ? "Following" : "Follow"}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.postBody} numberOfLines={2}>{t.text}</Text>
              </View>
            ))}
          <View style={{ height: 20 }} />
        </>
      ) : (
        <>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={s.sectionTitle}>Communities</Text>
            <Text style={s.sub}>Join conversations around interests, culture and work.</Text>
          </View>
          {rooms.map((room: any) => (
            <View key={room.id} style={[s.roomRow, { marginHorizontal: 16, marginBottom: 10 }]}>
              <View style={s.postAv}><Text style={s.avatarText}>{room.av || String(room.name || "K").slice(0, 2).toUpperCase()}</Text></View>
              <View style={[s.flex, { paddingHorizontal: 10 }]}>
                <Text style={s.roomName}>{room.name}</Text>
                <Text style={s.meta}>{room.meta}{room.live ? " · Active" : ""}</Text>
              </View>
              <TouchableOpacity
                style={s.joinBtn}
                onPress={() => setJoined((prev) => ({ ...prev, [String(room.id)]: !prev[String(room.id)] }))}
                accessibilityRole="button"
              >
                <Text style={s.joinBtnText}>{joined[String(room.id)] ? "Joined" : "Join"}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </>
      )}
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
    if (selectedPost) return <PostDetailScreen s={s} C={C} post={selectedPost} liked={!!liked[String(selectedPost.id)]} following={!!following[String(selectedPost.handle || selectedPost.name)]} onBack={() => setSelectedPost(null)} onLike={() => setLiked((prev) => ({ ...prev, [String(selectedPost.id)]: !prev[String(selectedPost.id)] }))} onComment={() => setCommentTake(selectedPost)} onFollow={() => setFollowing((prev) => ({ ...prev, [String(selectedPost.handle || selectedPost.name)]: !prev[String(selectedPost.handle || selectedPost.name)] }))} onReport={async () => { await submitReport("post", String(selectedPost.id), "other"); show("Report saved for review."); }} onBlock={async () => { const h = String(selectedPost.handle || selectedPost.name); await blockUser(h); setBlocked((prev) => prev.includes(h) ? prev : [...prev, h]); setSelectedPost(null); show("Blocked @" + h); }} show={show} />;
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
