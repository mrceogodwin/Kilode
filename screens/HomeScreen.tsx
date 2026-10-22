import React from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from "react-native";
import { CAROUSEL as CAROUSEL_FALLBACK, ROLE_GRID, STORIES } from "../data";
import { playMusicTrack } from "../lib/musicPlayer";

type Props = {
  s: any;
  C: any;
  takes: any[];
  tracks: any[];
  news: any[];
  rooms: any[];
  homeChip: number;
  setHomeChip: (n: number) => void;
  slide: number;
  setSlide: (n: number) => void;
  joined: Record<string, boolean>;
  setJoined: (j: Record<string, boolean>) => void;
  refreshing: boolean;
  onRefresh: () => void;
  go: (t: string) => void;
  show: (m: string) => void;
  setMoreOpen: (v: boolean) => void;
  setComposeOpen: (v: boolean) => void;
  setSelectedProfile: (p: any) => void;
  setSelectedArticleId: (id: string | null) => void;
};

export function HomeScreen({
  s, C, takes, tracks, news, rooms, homeChip, setHomeChip, slide, setSlide,
  joined, setJoined, refreshing, onRefresh, go, show, setMoreOpen, setComposeOpen,
  setSelectedProfile, setSelectedArticleId,
}: Props) {
  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={s.h1}>For you</Text>
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
              {tracks.map((t: any, i: number) => (
                <TouchableOpacity key={t.id} style={[s.trackCard, { backgroundColor: t.color || C.accent }]} onPress={async () => {
                  const result = await playMusicTrack(t, { queue: tracks, index: i });
                  if (!result.ok) show(result.message || "Playback unavailable.");
                  else show(`Playing ${t.title}`);
                }}>
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
}
