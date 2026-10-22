import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { loadSavedTracks, loadRecentTracks, toggleSavedTrack, type LibraryTrack } from "../lib/musicLibrary";
import { setMusicQueue } from "../lib/musicPlayer";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  tracks?: any[];
  tracksSource?: "live" | "mock" | "error";
  onPlay: (track: any) => Promise<void> | void;
  onOpenTrack?: (track: any) => void;
  onOpenArtist?: (name: string) => void;
};

const PREVIEW_RANKS = [
  { title: "Hunter of Africa", artist: "Mudino", genre: "Afrobeats" },
  { title: "We Want a Party", artist: "Mudino", genre: "Afrobeats" },
  { title: "Calm Down", artist: "Rema", genre: "Afrobeats" },
  { title: "Water & Light", artist: "Ayo Blue", genre: "R&B" },
  { title: "Ojuelegba Nights", artist: "Simi Sola", genre: "Afrobeats" },
  { title: "Last Last", artist: "Burna Boy", genre: "Afrobeats" },
  { title: "Essence", artist: "Wizkid", genre: "Afrobeats" },
  { title: "Danfo Dreams", artist: "Kemi Wave", genre: "Amapiano" },
  { title: "Joro", artist: "Wizkid", genre: "Afrobeats" },
  { title: "Balogun Bounce", artist: "Market Band", genre: "Street" },
];

const GENRES = ["Afrobeats", "Amapiano", "R&B", "Hip Hop", "Gospel", "Street", "Highlife"];
const TABS = ["Discover", "Charts", "Artists", "Library", "Genres"] as const;

export function MusicScreen({
  s, C, onBack, show, onPlay, tracks: remoteTracks, tracksSource, onOpenTrack, onOpenArtist,
}: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Discover");
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [chartSize, setChartSize] = useState<50 | 100>(100);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [saved, setSaved] = useState<LibraryTrack[]>([]);
  const [recent, setRecent] = useState<LibraryTrack[]>([]);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const hasLiveTracks = tracksSource === "live";
  const baseTracks = hasLiveTracks && remoteTracks?.length ? remoteTracks : TRACKS || [];

  const catalogue = useMemo(() => {
    const fromApi = baseTracks.map((t: any, i: number) => ({
      id: String(t.id ?? `t-${i}`),
      title: t.title || "Track",
      artist: t.artist || t.artist_name || "Artist",
      color: t.color || C.elevated,
      audioUrl: t.audioUrl || t.audio_url || t.previewUrl || t.preview_url,
      genre: t.genre || PREVIEW_RANKS.find((r) => r.title === t.title)?.genre || "Afrobeats",
      raw: t,
    }));
    return PREVIEW_RANKS.map((r, i) => {
      const hit = fromApi.find(
        (t) => String(t.title).toLowerCase() === r.title.toLowerCase() || String(t.artist).toLowerCase() === r.artist.toLowerCase()
      );
      return {
        rank: i + 1,
        id: hit?.id || `rank-${i + 1}`,
        title: hit?.title || r.title,
        artist: hit?.artist || r.artist,
        color: hit?.color || C.elevated,
        audioUrl: hit?.audioUrl,
        genre: hit?.genre || r.genre,
        raw: hit?.raw || { id: `rank-${i + 1}`, title: r.title, artist: r.artist, color: C.elevated, genre: r.genre },
      };
    });
  }, [baseTracks, C.elevated]);

  const refreshLibrary = useCallback(async () => {
    const [sList, rList] = await Promise.all([loadSavedTracks(), loadRecentTracks()]);
    setSaved(sList);
    setRecent(rList);
    const map: Record<string, boolean> = {};
    sList.forEach((t) => { map[String(t.id)] = true; });
    setSavedIds(map);
  }, []);

  useEffect(() => { void refreshLibrary(); }, [refreshLibrary]);

  const filtered = useMemo(() => {
    let rows = catalogue;
    if (genreFilter) rows = rows.filter((t) => String(t.genre).toLowerCase() === genreFilter.toLowerCase());
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      rows = rows.filter((t) => t.title.toLowerCase().includes(needle) || t.artist.toLowerCase().includes(needle) || String(t.genre).toLowerCase().includes(needle));
    }
    return rows;
  }, [catalogue, genreFilter, q]);

  const chartRows = useMemo(() => filtered.slice(0, chartSize), [filtered, chartSize]);

  const artists = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; genre: string; color: string; count: number }[] = [];
    catalogue.forEach((t) => {
      const k = t.artist.toLowerCase();
      if (seen.has(k)) {
        const hit = list.find((a) => a.name.toLowerCase() === k);
        if (hit) hit.count += 1;
        return;
      }
      seen.add(k);
      list.push({ name: t.artist, genre: t.genre, color: t.color, count: 1 });
    });
    return list;
  }, [catalogue]);

  const openTrack = (track: any) => {
    const payload = track.raw || track;
    setMusicQueue(filtered.map((t) => t.raw || t), Math.max(0, filtered.findIndex((t) => String(t.id) === String(track.id))));
    if (onOpenTrack) onOpenTrack(payload);
    else void onPlay(payload);
  };

  const playTrack = async (track: any) => {
    const payload = track.raw || track;
    setMusicQueue(filtered.map((t) => t.raw || t), Math.max(0, filtered.findIndex((t) => String(t.id) === String(track.id))));
    await onPlay(payload);
    await refreshLibrary();
  };

  const toggleSave = async (track: any) => {
    const result = await toggleSavedTrack({
      id: String(track.id), title: track.title, artist: track.artist, color: track.color, audioUrl: track.audioUrl, genre: track.genre,
    });
    setSaved(result.list);
    setSavedIds((prev) => ({ ...prev, [String(track.id)]: result.saved }));
    show(result.saved ? "Saved to Library (this device)" : "Removed from Library");
  };

  const chip = (label: string, active: boolean, onPress: () => void, icon?: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity key={label} onPress={onPress} activeOpacity={0.85} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: active ? C.accent + "22" : C.card, borderWidth: 1, borderColor: active ? C.accent : C.border }}>
      {icon ? <Ionicons name={icon} size={14} color={active ? C.accent : C.text2} /> : null}
      <Text style={{ color: active ? C.accent : C.text, fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );

  const trackRow = (t: any, showRank?: boolean) => (
    <TouchableOpacity key={t.id + String(t.rank || "")} onPress={() => openTrack(t)} activeOpacity={0.88} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 }}>
      {showRank ? <Text style={{ width: 22, color: C.text3, fontWeight: "700", fontSize: 13 }}>{t.rank}</Text> : null}
      <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="musical-note" size={18} color={C.text2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>{t.title}</Text>
        <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{t.artist} · {t.genre}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleSave(t)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name={savedIds[String(t.id)] ? "heart" : "heart-outline"} size={18} color={savedIds[String(t.id)] ? "#FF4965" : C.text3} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => playTrack(t)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="play" size={14} color="#111" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="chevron-back" size={18} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 15 }}>Home</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => show("Artist upload studio opens when dedicated storage + artist account are connected.")} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="cloud-upload-outline" size={18} color={C.text} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <Text style={{ color: C.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>Music</Text>
        <Text style={{ color: C.text3, fontSize: 12, marginTop: 4 }}>{hasLiveTracks ? "Live catalogue connected" : "Preview catalogue · ranks are not live listening charts"}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {TABS.map((t) => chip(t, tab === t, () => setTab(t)))}
        {chip("Search", searchOpen, () => setSearchOpen((v) => !v), "search")}
      </ScrollView>

      {searchOpen ? (
        <View style={{ marginHorizontal: 16, marginTop: 12, height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="search" size={16} color={C.text3} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search tracks, artists, genres" placeholderTextColor={C.text3} style={{ flex: 1, color: C.text, fontSize: 14 }} autoFocus />
        </View>
      ) : null}

      {tab === "Discover" && (
        <>
          <View style={{ paddingHorizontal: 16, marginTop: 18 }}><Text style={{ color: C.text, fontSize: 17, fontWeight: "800" }}>More to Explore</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
            {[
              { title: "Explore Tracks", sub: "Find your next repeat", action: () => setTab("Charts") },
              { title: "Fresh Releases", sub: "Singles, EPs & albums", action: () => setTab("Charts") },
              { title: "Meet the Artists", sub: "Discover artists on Kilode", action: () => setTab("Artists") },
              { title: "Your Library", sub: "Saved on this device", action: () => setTab("Library") },
            ].map((card) => (
              <TouchableOpacity key={card.title} onPress={card.action} style={{ width: 148, minHeight: 110, padding: 14, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
                <Ionicons name="musical-notes-outline" size={22} color={C.accent} />
                <Text style={{ color: C.text, fontWeight: "800", fontSize: 14, marginTop: 12 }}>{card.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 4 }}>{card.sub}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "800", flex: 1 }}>Popular in the catalogue</Text>
            <TouchableOpacity onPress={() => setTab("Charts")}><Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>Top 100</Text></TouchableOpacity>
          </View>
          {filtered.slice(0, 8).map((t) => trackRow(t, true))}
        </>
      )}

      {tab === "Charts" && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
            {chip("Top 100", chartSize === 100, () => setChartSize(100), "bar-chart-outline")}
            {chip("Top 50", chartSize === 50, () => setChartSize(50), "trending-up")}
          </ScrollView>
          <Text style={{ color: C.text3, fontSize: 11, marginHorizontal: 16, marginTop: 10 }}>Preview ranks for layout only. Live weekly charts require dedicated play-event aggregation.</Text>
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}><Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>Kilode Top {chartSize}</Text></View>
          {chartRows.map((t) => trackRow(t, true))}
        </>
      )}

      {tab === "Artists" && (
        <>
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}><Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>Artists in catalogue</Text></View>
          {artists.map((a) => (
            <TouchableOpacity key={a.name} onPress={() => (onOpenArtist ? onOpenArtist(a.name) : show(a.name))} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: a.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>{a.name.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "700" }}>{a.name}</Text>
                <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>{a.genre} · {a.count} tracks</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.text3} />
            </TouchableOpacity>
          ))}
        </>
      )}

      {tab === "Library" && (
        <>
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>Saved on this device</Text>
            <Text style={{ color: C.text3, fontSize: 11, marginTop: 4 }}>Local library only — not cloud purchases or entitlements.</Text>
          </View>
          {saved.length === 0 ? (
            <View style={{ margin: 16, padding: 16, borderRadius: 14, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ color: C.text2, fontSize: 13 }}>No saved tracks yet. Tap the heart on any track.</Text>
            </View>
          ) : saved.map((t) => trackRow(t))}
          <View style={{ paddingHorizontal: 16, marginTop: 18 }}><Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>Recently played</Text></View>
          {recent.length === 0 ? (
            <Text style={{ color: C.text3, fontSize: 12, marginHorizontal: 16, marginTop: 8 }}>Play a track to build history on this device.</Text>
          ) : recent.map((t) => trackRow(t))}
        </>
      )}

      {tab === "Genres" && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
            {chip("All", !genreFilter, () => setGenreFilter(null))}
            {GENRES.map((g) => chip(g, genreFilter === g, () => setGenreFilter(g)))}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}><Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>{genreFilter || "All genres"}</Text></View>
          {filtered.map((t) => trackRow(t))}
        </>
      )}

      <TouchableOpacity onPress={() => show("Personalised shelves need listening history on the dedicated backend.")} style={{ marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="sparkles" size={18} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>Tailored to You</Text>
          <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>Adapts to saves and plays on this device</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={C.text3} />
      </TouchableOpacity>
    </ScrollView>
  );
}
