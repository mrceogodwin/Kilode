import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  useColorScheme,
} from "react-native";
import { palettes, makeStyles } from "./themeStyles";
import { DESKS, CREATE, TAKES, ACTIVITY, ROOMS, TRACKS, NEWS } from "./data";

/**
 * Kilode Premium — React Native (Expo)
 * Solid production shell. Dark-first Figma social UI + light skin.
 * Backend: Kilode Nine (Neon + Supabase). Wire APIs next.
 */
export default function App() {
  const system = useColorScheme();
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const effective = themeMode === "system" ? (system === "light" ? "light" : "dark") : themeMode;
  const C = palettes[effective];
  const isDark = effective === "dark";

  const [tab, setTab] = useState("home");
  const [homeChip, setHomeChip] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [nowPlaying, setNowPlaying] = useState<(typeof TRACKS)[number] | null>(null);

  const show = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };
  const go = (t: string) => {
    setTab(t);
    setMoreOpen(false);
    setCreateOpen(false);
  };

  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);

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
        <TouchableOpacity style={s.iconBtn} onPress={() => show("Search Kilode")} activeOpacity={0.7}>
          <Text style={s.iconBtnText}>⌕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => setThemeMode(isDark ? "light" : "dark")}
          activeOpacity={0.7}
        >
          <Text style={s.iconBtnText}>{isDark ? "☀" : "☾"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.avatar} onPress={() => go("myspace")} activeOpacity={0.8}>
          <Text style={s.avatarText}>K</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Home = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.padH}>
        <Text style={s.h1}>Good morning, Lagos</Text>
        <Text style={s.sub}>City OS · Sun 18 Oct · 26° partly cloudy</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {["For you", "Trending", "Rooms", "News"].map((c, i) => (
          <TouchableOpacity
            key={c}
            style={[s.chip, homeChip === i && s.chipOn]}
            onPress={() => setHomeChip(i)}
            activeOpacity={0.8}
          >
            <Text style={[s.chipText, homeChip === i && s.chipTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty / create state */}
      <View style={s.emptyCard}>
        <View style={s.emptyIcon}>
          <Text style={{ fontSize: 20 }}>✎</Text>
        </View>
        <Text style={s.emptyTitle}>No posts yet</Text>
        <Text style={s.emptyDesc}>Be first to share discovery in Lagos. Takes, music, jobs — your city feed starts here.</Text>
        <TouchableOpacity
          style={[s.primaryBtn, { marginTop: 16, paddingHorizontal: 22 }]}
          onPress={() => setCreateOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnText}>Create post</Text>
        </TouchableOpacity>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Rooms · {ROOMS.filter((r) => r.live).length} live · moderated</Text>
        <TouchableOpacity onPress={() => show("All rooms")}>
          <Text style={s.link}>See all</Text>
        </TouchableOpacity>
      </View>
      {ROOMS.map((r) => {
        const isJoined = !!joined[r.id];
        return (
          <TouchableOpacity key={r.id} style={s.roomRow} activeOpacity={0.75}>
            <View style={s.roomAv}>
              <Text style={s.roomAvText}>{r.av}</Text>
              {r.live ? <View style={s.roomLive} /> : null}
            </View>
            <View style={s.flex}>
              <Text style={s.roomName}>{r.name}</Text>
              <Text style={s.meta}>
                {r.live ? `${r.speaking} speaking · ` : ""}{r.meta}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.joinBtn, isJoined && s.joinLive]}
              onPress={() => {
                setJoined({ ...joined, [r.id]: !isJoined });
                show(isJoined ? `Left ${r.name}` : `Joined ${r.name}`);
              }}
            >
              <Text style={[s.joinBtnText, isJoined && s.joinLiveText]}>
                {isJoined ? "Joined" : "Join"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>News for you</Text>
        <TouchableOpacity onPress={() => setHomeChip(3)}>
          <Text style={s.link}>Open media</Text>
        </TouchableOpacity>
      </View>
      {NEWS.map((n) => (
        <TouchableOpacity key={n.id} style={s.newsCard} activeOpacity={0.8} onPress={() => show(n.title)}>
          <View style={[s.newsThumb, { backgroundColor: n.tone }]} />
          <View style={s.flex}>
            <Text style={s.newsKicker}>{n.kicker} · {n.time}</Text>
            <Text style={s.newsTitle} numberOfLines={2}>{n.title}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Music · New drops</Text>
        <TouchableOpacity onPress={() => go("music")}>
          <Text style={s.link}>Browse</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tracksRow}>
        {TRACKS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[s.trackCard, { backgroundColor: t.color }]}
            onPress={() => {
              setNowPlaying(t);
              show(`Playing ${t.title}`);
            }}
            activeOpacity={0.85}
          >
            <Text style={s.trackPlay}>▶</Text>
            <Text style={s.trackTitle} numberOfLines={1}>{t.title}</Text>
            <Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Desks</Text>
        <TouchableOpacity onPress={() => setMoreOpen(true)}>
          <Text style={s.link}>More</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.desksRow}>
        {DESKS.slice(0, 6).map((d) => (
          <TouchableOpacity key={d.id} style={s.deskItem} onPress={() => go(d.id)} activeOpacity={0.75}>
            <View style={s.deskIcon}>
              <Text style={{ fontSize: 22 }}>{d.icon}</Text>
            </View>
            <Text style={s.deskLabel}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const Socials = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.composer}>
        <View style={s.composerAv}>
          <Text style={s.avatarText}>K</Text>
        </View>
        <TouchableOpacity style={s.composerInput} onPress={() => setCreateOpen(true)} activeOpacity={0.8}>
          <Text style={s.composerPlaceholder}>What's happening in Naija?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.postBtn} onPress={() => setCreateOpen(true)}>
          <Text style={s.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {TAKES.map((t) => (
        <View key={t.id} style={s.postCard}>
          <View style={s.postTop}>
            <View style={s.postAv}>
              <Text style={s.avatarText}>{t.name.slice(0, 1)}</Text>
            </View>
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
          <View style={s.tags}>
            {t.tags.map((tag) => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={s.postActions}>
            <TouchableOpacity
              style={s.action}
              onPress={() => setLiked({ ...liked, [t.id]: !liked[t.id] })}
            >
              <Text style={[s.actionText, liked[t.id] && { color: C.danger }]}>
                {liked[t.id] ? "♥" : "♡"} {t.likes + (liked[t.id] ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={() => show("Comments")}>
              <Text style={s.actionText}>💬 {t.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={() => show("Repost")}>
              <Text style={s.actionText}>↗ {t.reposts}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.action} onPress={() => show("Share")}>
              <Text style={s.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
          <View style={s.replyBar}>
            <TouchableOpacity style={s.replyInput} onPress={() => show("Reply")} activeOpacity={0.8}>
              <Text style={s.replyPlaceholder}>Type here...</Text>
            </TouchableOpacity>
            <View style={s.reactRow}>
              {["😊", "❤️", "🔥", "⚡"].map((e) => (
                <TouchableOpacity key={e} style={s.reactPill} onPress={() => show(e)}>
                  <Text style={{ fontSize: 14 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const ActivityView = () => (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.padH}>
        <Text style={s.h1}>Activity</Text>
        <Text style={s.sub}>Chronological · no algorithm</Text>
      </View>
      {ACTIVITY.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[s.activityRow, a.unread && s.activityUnread]}
          onPress={() => go(a.lane)}
          activeOpacity={0.75}
        >
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
          <Text style={s.profileAvText}>KA</Text>
        </View>
        <Text style={s.h1}>Kelechi Anene</Text>
        <Text style={s.sub}>@kelechi · Lagos, NG · Member</Text>
        <Text style={[s.postBody, { textAlign: "center", marginTop: 8, paddingHorizontal: 24 }]}>
          Building Kilode. Product, community, and the city OS for Naija.
        </Text>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statN}>412</Text><Text style={s.statL}>Following</Text></View>
          <View style={s.stat}><Text style={s.statN}>2.1k</Text><Text style={s.statL}>Followers</Text></View>
          <View style={s.stat}><Text style={s.statN}>86</Text><Text style={s.statL}>Posts</Text></View>
        </View>
        <View style={s.rowGap}>
          <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => show("Edit profile")}>
            <Text style={s.primaryBtnText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.ghostBtn} onPress={() => setThemeMode(isDark ? "light" : "dark")}>
            <Text style={s.ghostBtnText}>{isDark ? "Light" : "Dark"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Your desks</Text>
      </View>
      <View style={s.deskList}>
        {DESKS.slice(0, 4).map((d) => (
          <TouchableOpacity key={d.id} style={s.deskListItem} onPress={() => go(d.id)} activeOpacity={0.8}>
            <Text style={{ fontSize: 22 }}>{d.icon}</Text>
            <View style={s.flex}>
              <Text style={s.roomName}>{d.label}</Text>
              <Text style={s.meta}>{d.blurb}</Text>
            </View>
            <Text style={s.meta}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const Desk = ({ name }: { name: string }) => {
    const d = DESKS.find((x) => x.id === name);
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
        <View style={s.deskHero}>
          <Text style={s.deskHeroIcon}>{d?.icon || "📦"}</Text>
          <Text style={s.h1}>{d?.label || name}</Text>
          <Text style={s.sub}>{d?.blurb || "Native desk"}</Text>
          <Text style={[s.meta, { marginTop: 10, textAlign: "center" }]}>
            Wire to Kilode Nine next · real listings & posts
          </Text>
          <TouchableOpacity
            style={[s.primaryBtn, { marginTop: 18, paddingHorizontal: 28 }]}
            onPress={() => setCreateOpen(true)}
          >
            <Text style={s.primaryBtnText}>Create in {d?.label || name}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Coming online</Text>
        </View>
        <View style={s.emptyCard}>
          <Text style={s.emptyDesc}>
            This desk will list real {d?.label?.toLowerCase() || "items"} from Kilode Nine once APIs are connected.
          </Text>
        </View>
        <TouchableOpacity style={[s.ghostBtn, { marginHorizontal: 14, alignItems: "center" }]} onPress={() => go("home")}>
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
    tab === "activity"
      ? "Activity"
      : tab === "myspace"
        ? "My Space"
        : DESKS.find((d) => d.id === tab)?.label;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <Header title={headerTitle} />
      <View style={s.flex}>{body()}</View>

      {nowPlaying ? (
        <View style={s.player}>
          <View style={[s.playerArt, { backgroundColor: nowPlaying.color }]} />
          <View style={s.flex}>
            <Text style={s.playerTitle} numberOfLines={1}>{nowPlaying.title}</Text>
            <Text style={s.playerSub} numberOfLines={1}>{nowPlaying.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => show("Pause")}>
            <Text style={s.playerBtn}>❚❚</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNowPlaying(null)}>
            <Text style={s.playerBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={s.dock}>
        {([["home", "Home", "⌂"], ["socials", "Socials", "◫"]] as const).map(([id, label, icon]) => (
          <TouchableOpacity key={id} style={s.dockBtn} onPress={() => go(id)} activeOpacity={0.7}>
            <Text style={[s.dockIcon, tab === id && { color: C.accent }]}>{icon}</Text>
            <Text style={[s.dockLabel, tab === id && s.dockLabelOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.moreBtn} onPress={() => setMoreOpen(true)} activeOpacity={0.85}>
          <Text style={s.moreBtnText}>+</Text>
        </TouchableOpacity>
        {([["activity", "Activity", "◐"], ["myspace", "My Space", "○"]] as const).map(([id, label, icon]) => (
          <TouchableOpacity key={id} style={s.dockBtn} onPress={() => go(id)} activeOpacity={0.7}>
            <Text style={[s.dockIcon, tab === id && { color: C.accent }]}>{icon}</Text>
            <Text style={[s.dockLabel, tab === id && s.dockLabelOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>More on Kilode</Text>
              <TouchableOpacity onPress={() => setMoreOpen(false)}>
                <Text style={s.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={s.createRow}
              onPress={() => {
                setMoreOpen(false);
                setCreateOpen(true);
              }}
            >
              <Text style={{ fontSize: 20 }}>✏️</Text>
              <View style={s.flex}>
                <Text style={s.roomName}>Create</Text>
                <Text style={s.meta}>Post, track, film, job, ad…</Text>
              </View>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.deskGrid}>
                {DESKS.map((d) => (
                  <TouchableOpacity key={d.id} style={s.deskGridItem} onPress={() => go(d.id)}>
                    <Text style={{ fontSize: 22 }}>{d.icon}</Text>
                    <Text style={s.deskGridLabel}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
              <TouchableOpacity onPress={() => setCreateOpen(false)}>
                <Text style={s.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={s.deskGrid}>
              {CREATE.map((o) => (
                <TouchableOpacity
                  key={o.label}
                  style={s.deskGridItem}
                  onPress={() => {
                    go(o.tab);
                    show(o.label);
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{o.icon}</Text>
                  <Text style={s.deskGridLabel}>{o.label}</Text>
                  <Text style={s.meta}>{o.sub}</Text>
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
