import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { createArtistSupportPage, createMusicReleaseDraft, isFollowingArtist, listArtistProfiles, listOwnMusicReleases, listOwnSupportPages, submitMusicReleaseForReview, toggleArtistFollow, uploadMusicReleaseAudio } from "../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { TRACKS } from "../data";
import { can } from "../lib/permissions";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  onPlay: (track: any) => void;
  onOpenTrack?: (track: any) => void;
  onOpenArtist?: (artist: any) => void;
  accountKind?: string;
  userId?: string;
  tracks?: any[];
};

const TABS = ["Home", "Discover", "Charts", "Artists"] as const;

const FEATURED = {
  name: "Ayra Starr",
  meta: "R&B · Afrobeats · Featured artist",
  imageUrl: "https://images.unsplash.com/photo-1516280440614-6697288d5b28?w=800&q=80",
};

const TOP100_CATEGORIES = ["All", "Nigeria", "Afrobeats", "Hip Hop", "R&B", "Amapiano", "Emerging"];

const PLAYLIST_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "tailored", label: "Tailored to you" },
  { id: "naija", label: "Naija sounds" },
  { id: "mood", label: "Moods" },
  { id: "genre", label: "By genre" },
  { id: "new", label: "New & rising" },
  { id: "focus", label: "Focus & chill" },
  { id: "community", label: "Kilode community" },
];

const EDITORIAL_PLAYLISTS = [
  { title: "Tailored to You", subtitle: "Shaped by your listening on this device", icon: "sparkles-outline", category: "tailored" },
  { title: "Naija Now", subtitle: "Nigerian sounds from the available catalogue", icon: "headset-outline", category: "naija" },
  { title: "Late Night Rotation", subtitle: "A calmer after-hours selection", icon: "moon-outline", category: "mood" },
  { title: "New & Noted", subtitle: "Recent releases when catalogue dates are available", icon: "albums-outline", category: "new" },
  { title: "The Discovery List", subtitle: "Find artists and tracks you have not played yet", icon: "compass-outline", category: "community" },
  { title: "Focus Mode", subtitle: "A lighter background-listening selection", icon: "headset-outline", category: "focus" },
  { title: "Afrobeats Essentials", subtitle: "Explore tracks tagged Afrobeats", icon: "musical-notes-outline", category: "genre" },
];

const GENRES = [
  { id: "afro", label: "Afrobeats", color: "#E5C158" },
  { id: "hip", label: "Hip Hop", color: "#3B82F6" },
  { id: "rnb", label: "R&B", color: "#A855F7" },
  { id: "amapiano", label: "Amapiano", color: "#10B981" },
];

export function MusicScreen({ s, C, onBack, show, onPlay, onOpenTrack, onOpenArtist, accountKind, userId, tracks: tracksProp }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Home");
  const [destination, setDestination] = useState<string | null>(null);
  const [destinationHistory, setDestinationHistory] = useState<string[]>([]);
  const [musicQuery, setMusicQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [playlistCategory, setPlaylistCategory] = useState("all");
  const [savedTrackIds, setSavedTrackIds] = useState<Record<string, boolean>>({});
  const [savedPlaylistIds, setSavedPlaylistIds] = useState<Record<string, boolean>>({});
  const [recentTrackIds, setRecentTrackIds] = useState<string[]>([]);
  const [loadedLibraryStorageKey, setLoadedLibraryStorageKey] = useState<string | null>(null);
  const libraryStorageKey = `kilode.music.library.v1.${userId || "guest"}`;


  const [artistProfiles, setArtistProfiles] = useState<any[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [artistCatalogueError, setArtistCatalogueError] = useState("");
  const [followedArtists, setFollowedArtists] = useState<Record<string, boolean>>({});
  const [busyArtistId, setBusyArtistId] = useState<string | null>(null);
  const [draftOpen, setDraftOpen] = useState(false);
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseType, setReleaseType] = useState<"single" | "ep" | "album">("single");
  const [savingDraft, setSavingDraft] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<{ uri: string; name: string; mimeType?: string | null; size?: number | null } | null>(null);
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null);
  const [myReleases, setMyReleases] = useState<any[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(false);
  const [submittingReleaseId, setSubmittingReleaseId] = useState<string | null>(null);
  const [releaseRefreshKey, setReleaseRefreshKey] = useState(0);
  const [supportPages, setSupportPages] = useState<any[]>([]);
  const [loadingSupportPages, setLoadingSupportPages] = useState(false);
  const [creatingSupportPage, setCreatingSupportPage] = useState(false);
  const tracks = tracksProp ?? TRACKS;
  const canList = can(accountKind, "music_list");

  useEffect(() => {
    let active = true;
    setLoadedLibraryStorageKey(null);
    AsyncStorage.getItem(libraryStorageKey).then((raw) => {
      if (!active) return;
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setSavedTrackIds(saved.savedTrackIds && typeof saved.savedTrackIds === "object" && !Array.isArray(saved.savedTrackIds) ? saved.savedTrackIds : {});
          setSavedPlaylistIds(saved.savedPlaylistIds && typeof saved.savedPlaylistIds === "object" && !Array.isArray(saved.savedPlaylistIds) ? saved.savedPlaylistIds : {});
          setRecentTrackIds(Array.isArray(saved.recentTrackIds) ? saved.recentTrackIds.filter((id: unknown) => typeof id === "string").slice(0, 30) : []);
        } catch {
          setSavedTrackIds({});
          setSavedPlaylistIds({});
          setRecentTrackIds([]);
        }
      } else {
        setSavedTrackIds({});
        setSavedPlaylistIds({});
        setRecentTrackIds([]);
      }
      setLoadedLibraryStorageKey(libraryStorageKey);
    }).catch(() => {
      // Never carry another account's in-memory library into this account if storage fails.
      if (!active) return;
      setSavedTrackIds({});
      setSavedPlaylistIds({});
      setRecentTrackIds([]);
      setLoadedLibraryStorageKey(libraryStorageKey);
    });
    return () => { active = false; };
  }, [libraryStorageKey]);

  useEffect(() => {
    if (loadedLibraryStorageKey !== libraryStorageKey) return;
    AsyncStorage.setItem(libraryStorageKey, JSON.stringify({ savedTrackIds, savedPlaylistIds, recentTrackIds })).catch(() => {
      show("Couldn't save your Music library on this device.");
    });
  }, [loadedLibraryStorageKey, libraryStorageKey, savedTrackIds, savedPlaylistIds, recentTrackIds]);

  useEffect(() => {
    let active = true;
    if (!userId || !canList) {
      setMyReleases([]);
      setLoadingReleases(false);
      return () => { active = false; };
    }
    setLoadingReleases(true);
    listOwnMusicReleases(userId).then((result) => {
      if (!active) return;
      setMyReleases(result.ok ? result.data : []);
      setLoadingReleases(false);
    }).catch(() => {
      if (active) { setMyReleases([]); setLoadingReleases(false); }
    });
    return () => { active = false; };
  }, [userId, canList, releaseRefreshKey]);

  useEffect(() => {
    let active = true;
    if (!userId || !canList) {
      setSupportPages([]);
      setLoadingSupportPages(false);
      return () => { active = false; };
    }
    setLoadingSupportPages(true);
    listOwnSupportPages(userId).then((result) => {
      if (!active) return;
      setSupportPages(result.ok ? result.data : []);
      setLoadingSupportPages(false);
    }).catch(() => {
      if (active) { setSupportPages([]); setLoadingSupportPages(false); }
    });
    return () => { active = false; };
  }, [userId, canList]);

  useEffect(() => {
    let active = true;
    if (tab !== "Home" && tab !== "Discover" && tab !== "Artists") return () => { active = false; };
    setLoadingArtists(true);
    setArtistCatalogueError("");
    listArtistProfiles().then(async (result) => {
      if (!active) return;
      if (!result.ok) {
        setArtistProfiles([]);
        setArtistCatalogueError(result.error || "Artist catalogue is unavailable.");
        setLoadingArtists(false);
        return;
      }
      setArtistProfiles(result.data);
      if (userId && result.data.length) {
        const followResults = await Promise.all(result.data.map((artist) => isFollowingArtist(userId, artist.id)));
        if (!active) return;
        const next: Record<string, boolean> = {};
        result.data.forEach((artist, index) => {
          if (followResults[index].ok) next[artist.id] = followResults[index].following;
        });
        setFollowedArtists(next);
      } else {
        setFollowedArtists({});
      }
      setLoadingArtists(false);
    }).catch(() => {
      if (active) {
        setArtistProfiles([]);
        setArtistCatalogueError("Could not load the artist catalogue. Please try again.");
        setLoadingArtists(false);
      }
    });
    return () => { active = false; };
  }, [tab, userId]);

  const openTrack = (t: any) => {
    setRecentTrackIds((current) => [String(t.id ?? t.title), ...current.filter((id) => id !== String(t.id ?? t.title))].slice(0, 30));
    if (onOpenTrack) onOpenTrack(t);
    else {
      onPlay(t);
      show(`Playing ${t.title} · full stream when Music API is live`);
    }
  };

  const openMusicDestination = (name: string, genre?: string) => {
    if (destination && destination !== name) setDestinationHistory((history) => [...history, destination]);
    setDestination(name);
    setSelectedGenre(genre ?? null);
    setMusicQuery("");
  };

  const goBackMusicDestination = () => {
    if (destinationHistory.length) {
      setDestination(destinationHistory[destinationHistory.length - 1]);
      setDestinationHistory(destinationHistory.slice(0, -1));
      return;
    }
    setDestination(null);
    setDestinationHistory([]);
  };

  const catalogueTracks = tracks.filter((track: any) => {
    const query = musicQuery.trim().toLowerCase();
    const trackTags = [track.genre, track.genres, track.region, track.country, track.origin, track.mood].map((value) => String(value || "")).join(" ").toLowerCase();
    const genreMatch = !selectedGenre
      || (selectedGenre === "Nigeria" ? /nigeria|naija|nigerian/i.test(trackTags) : false)
      || (selectedGenre === "Emerging" ? Boolean(track.is_emerging || track.emerging) : false)
      || trackTags.includes(selectedGenre.toLowerCase());
    const queryMatch = !query || [track.title, track.artist, track.album, track.genre].some((value) => String(value || "").toLowerCase().includes(query));
    return genreMatch && queryMatch;
  });

  const locallyKnownTracks = [...recentTrackIds, ...Object.keys(savedTrackIds).filter((id) => savedTrackIds[id])]
    .map((id) => tracks.find((track: any) => String(track.id ?? track.title) === id))
    .filter(Boolean) as any[];
  const preferredGenres = locallyKnownTracks.reduce((counts: Record<string, number>, track: any) => {
    const raw = track.genre ?? track.genres;
    const genres = (Array.isArray(raw) ? raw : String(raw || "").split(/[,/|]/)).map((genre: any) => String(genre).trim().toLowerCase()).filter(Boolean);
    genres.forEach((genre: string) => { counts[genre] = (counts[genre] || 0) + 1; });
    return counts;
  }, {});
  const topPreferredGenre = Object.entries(preferredGenres).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const tailoredTracks = [...catalogueTracks].sort((a: any, b: any) => {
    const score = (track: any) => {
      const id = String(track.id ?? track.title);
      const genre = String(track.genre ?? track.genres ?? "").toLowerCase();
      return (recentTrackIds.includes(id) ? 4 : 0)
        + (savedTrackIds[id] ? 3 : 0)
        + (topPreferredGenre && genre.includes(topPreferredGenre) ? 2 : 0)
        + (track.is_emerging || track.emerging ? 1 : 0);
    };
    return score(b) - score(a);
  });
  const destinationName = destination ?? "";
  const destinationTracks = destination === "Library"
    ? catalogueTracks.filter((track: any) => savedTrackIds[String(track.id ?? track.title)])
    : destination === "Recently Played"
      ? recentTrackIds.map((id) => catalogueTracks.find((track: any) => String(track.id ?? track.title) === id)).filter(Boolean)
      : destinationName.startsWith("Album · ")
        ? catalogueTracks.filter((track: any) => String(track.album || "").toLowerCase() === destinationName.slice(8).toLowerCase())
        : destinationName.startsWith("Release · ")
          ? catalogueTracks.filter((track: any) => String(track.release_title || track.release || track.album || "").toLowerCase() === destinationName.slice(10).toLowerCase())
          : destination === "Albums" || destination === "Releases"
            ? catalogueTracks.filter((track: any) => track.album || track.release_type || track.release_title)
            : destination === "Tailored to You"
          ? tailoredTracks
          : destination === "Top 100"
            ? [...catalogueTracks].sort((a: any, b: any) => Number(b.play_count ?? b.plays ?? b.stream_count ?? 0) - Number(a.play_count ?? a.plays ?? a.stream_count ?? 0)).slice(0, 100)
            : destination === "The Discovery List"
              ? catalogueTracks.filter((track: any) => !recentTrackIds.includes(String(track.id ?? track.title)))
              : destination === "New & Noted"
                ? [...catalogueTracks].sort((a: any, b: any) => new Date(b.release_date ?? b.created_at ?? 0).getTime() - new Date(a.release_date ?? a.created_at ?? 0).getTime())
                : destination === "Afrobeats Essentials"
                  ? catalogueTracks.filter((track: any) => String(track.genre ?? track.genres ?? "").toLowerCase().includes("afro"))
                  : destination === "Focus Mode"
                    ? catalogueTracks.filter((track: any) => /r&b|ambient|acoustic|chill|lo.?fi|instrumental/i.test(String(track.genre ?? track.genres ?? track.mood ?? "")))
                    : destination === "Naija Now"
                      ? catalogueTracks.filter((track: any) => /afro|naija|nigerian|amapiano/i.test(String(track.genre ?? track.genres ?? track.region ?? "")))
                      : catalogueTracks;
  const hasVerifiedChartSignals = destination === "Top 100" && destinationTracks.some((track: any) => Number.isFinite(Number(track.play_count ?? track.plays ?? track.stream_count)) && Number(track.play_count ?? track.plays ?? track.stream_count) > 0);
  const albumGroups = Array.from(new Map(catalogueTracks.filter((track: any) => track.album).map((track: any) => [String(track.album), track])).entries()).map(([album, track]: any) => ({ title: String(album), artist: String(track.artist || track.artist_name || "Unknown artist"), artwork: track.imageUrl || track.cover_url || track.artwork_url, trackCount: catalogueTracks.filter((item: any) => String(item.album) === String(album)).length }));
  const releaseGroups = Array.from(new Map(catalogueTracks.filter((track: any) => track.release_title || track.release || track.album).map((track: any) => [String(track.release_title || track.release || track.album), track])).entries()).map(([title, track]: any) => ({ title: String(title), artist: String(track.artist || track.artist_name || "Unknown artist"), artwork: track.imageUrl || track.cover_url || track.artwork_url, type: String(track.release_type || "release"), trackCount: catalogueTracks.filter((item: any) => String(item.release_title || item.release || item.album) === String(title)).length }));
  const activeAlbumTitle = destinationName.startsWith("Album · ") ? destinationName.slice(8) : null;
  const activeReleaseTitle = destinationName.startsWith("Release · ") ? destinationName.slice(10) : null;
  const activeAlbum = activeAlbumTitle ? albumGroups.find((item) => item.title === activeAlbumTitle) : undefined;
  const activeRelease = activeReleaseTitle ? releaseGroups.find((item) => item.title === activeReleaseTitle) : undefined;
  const playlistItems = EDITORIAL_PLAYLISTS.filter((playlist) => playlistCategory === "all" || playlist.category === playlistCategory);
  const activePlaylist = EDITORIAL_PLAYLISTS.find((playlist) => playlist.title === destination);
  const activePlaylistTracks = activePlaylist?.category === "tailored"
    ? tailoredTracks
    : activePlaylist?.category === "community"
      ? catalogueTracks.filter((track: any) => !recentTrackIds.includes(String(track.id ?? track.title)))
      : activePlaylist?.category === "new"
        ? [...catalogueTracks].sort((a: any, b: any) => new Date(b.release_date ?? b.created_at ?? 0).getTime() - new Date(a.release_date ?? a.created_at ?? 0).getTime())
        : activePlaylist?.category === "genre"
          ? catalogueTracks.filter((track: any) => String(track.genre ?? track.genres ?? "").toLowerCase().includes("afro"))
          : activePlaylist?.category === "focus"
            ? catalogueTracks.filter((track: any) => /r&b|ambient|acoustic|chill|lo.?fi|instrumental/i.test(String(track.genre ?? track.genres ?? track.mood ?? "")))
            : activePlaylist?.category === "naija"
              ? catalogueTracks.filter((track: any) => /afro|naija|nigerian|amapiano/i.test(String(track.genre ?? track.genres ?? track.region ?? "")))
              : activePlaylist?.category === "mood"
                ? catalogueTracks.filter((track: any) => /r&b|chill|soul|slow|ambient/i.test(String(track.genre ?? track.genres ?? track.mood ?? "")))
                : catalogueTracks;


  return (
    <>
    <Modal visible={Boolean(destination)} animationType="slide" presentationStyle="pageSheet" onRequestClose={goBackMusicDestination}>
      <View style={{ flex: 1, backgroundColor: C.bg || C.background || "#111114" }}>
        <View style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.border }}>
          <TouchableOpacity onPress={goBackMusicDestination} accessibilityRole="button" accessibilityLabel={destinationHistory.length ? "Go back" : "Back to Music"} style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: C.elevated }}>
            <Ionicons name="chevron-back" size={21} color={C.text} />
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 19, fontWeight: "800", flex: 1, marginLeft: 10 }}>{destination}</Text>
          <TouchableOpacity onPress={() => openMusicDestination("Search")} accessibilityLabel="Search music">
            <Ionicons name="search-outline" size={21} color={C.text} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {destination === "Search" ? (
            <TextInput value={musicQuery} onChangeText={setMusicQuery} autoFocus placeholder="Tracks, artists, albums…" placeholderTextColor={C.text3} style={{ color: C.text, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16 }} />
          ) : null}
          {destination === "Genres" ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 18 }}>
              {GENRES.map((genre) => (
                <TouchableOpacity key={genre.id} onPress={() => openMusicDestination(genre.label, genre.label)} style={{ width: "48%", minHeight: 76, borderRadius: 14, padding: 13, justifyContent: "flex-end", backgroundColor: genre.color }}>
                  <Ionicons name="musical-notes" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, marginTop: 8 }}>{genre.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {destination === "Playlists" ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingBottom: 14 }}>
                {PLAYLIST_CATEGORIES.map((category) => (
                  <TouchableOpacity key={category.id} onPress={() => setPlaylistCategory(category.id)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: playlistCategory === category.id ? C.accent : C.card, borderWidth: 1, borderColor: playlistCategory === category.id ? C.accent : C.border }}>
                    <Text style={{ color: playlistCategory === category.id ? "#111" : C.text2, fontSize: 11, fontWeight: "700" }}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={{ gap: 10, marginBottom: 18 }}>
                {playlistItems.map((playlist) => (
                  <TouchableOpacity key={playlist.title} onPress={() => openMusicDestination(playlist.title)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: C.card, borderRadius: 13, borderWidth: 1, borderColor: C.border }}>
                    <View style={{ width: 52, height: 52, borderRadius: 9, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name={playlist.icon as any} size={24} color={C.accent} /></View>
                    <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>{playlist.title}</Text><Text style={{ color: C.text3, fontSize: 12, marginTop: 4 }}>{playlist.subtitle}</Text><Text style={{ color: C.text3, fontSize: 10, marginTop: 4 }}>{playlist.category === "tailored" ? "Uses your on-device listening history and saved tracks" : "Editorial category · live catalogue dependent"}</Text></View>
                    <Ionicons name="chevron-forward" size={18} color={C.text3} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
          {destination === "Library" ? (
            <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginBottom: 14 }}>Your saved tracks on this device are shown here. Account-synced library and purchases require the connected Music backend.</Text>
          ) : null}
          {destination === "Library" && Object.keys(savedPlaylistIds).some((id) => savedPlaylistIds[id]) ? (
            <View style={{ marginBottom: 18 }}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginBottom: 10 }}>Saved playlists</Text>
              {EDITORIAL_PLAYLISTS.filter((playlist) => savedPlaylistIds[playlist.title]).map((playlist) => (
                <TouchableOpacity key={playlist.title} onPress={() => openMusicDestination(playlist.title)} style={{ flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  <View style={{ width: 44, height: 44, borderRadius: 9, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name={playlist.icon as any} size={21} color={C.accent} /></View>
                  <View style={{ flex: 1 }}><Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>{playlist.title}</Text><Text style={{ color: C.text3, fontSize: 11, marginTop: 3 }}>Saved on this device</Text></View>
                  <Ionicons name="chevron-forward" size={17} color={C.text3} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {destination === "Albums" ? (
            <View style={{ gap: 10, marginBottom: 16 }}>
              {albumGroups.map((album) => (
                <TouchableOpacity key={album.title} onPress={() => openMusicDestination("Album · " + album.title)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
                  {album.artwork ? <Image source={{ uri: album.artwork }} style={{ width: 58, height: 58, borderRadius: 9, backgroundColor: C.elevated }} /> : <View style={{ width: 58, height: 58, borderRadius: 9, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="disc-outline" size={24} color={C.accent} /></View>}
                  <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>{album.title}</Text><Text numberOfLines={1} style={{ color: C.text3, fontSize: 12, marginTop: 4 }}>{album.artist}</Text><Text style={{ color: C.text3, fontSize: 10, marginTop: 4 }}>{album.trackCount} tracks</Text></View>
                  <Ionicons name="chevron-forward" size={18} color={C.text3} />
                </TouchableOpacity>
              ))}
              {!albumGroups.length ? <Text style={{ color: C.text3, fontSize: 12, paddingVertical: 24, textAlign: "center" }}>Albums will appear here when album metadata is available in the catalogue.</Text> : null}
            </View>
          ) : null}
          {destination === "Releases" ? (
            <View style={{ gap: 10, marginBottom: 16 }}>
              {releaseGroups.map((release) => (
                <TouchableOpacity key={release.title} onPress={() => openMusicDestination("Release · " + release.title)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
                  {release.artwork ? <Image source={{ uri: release.artwork }} style={{ width: 58, height: 58, borderRadius: 9, backgroundColor: C.elevated }} /> : <View style={{ width: 58, height: 58, borderRadius: 9, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="albums-outline" size={24} color={C.accent} /></View>}
                  <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>{release.title}</Text><Text numberOfLines={1} style={{ color: C.text3, fontSize: 12, marginTop: 4 }}>{release.artist}</Text><Text style={{ color: C.text3, fontSize: 10, marginTop: 4 }}>{release.type.toUpperCase()} · {release.trackCount} tracks</Text></View>
                  <Ionicons name="chevron-forward" size={18} color={C.text3} />
                </TouchableOpacity>
              ))}
              {!releaseGroups.length ? <Text style={{ color: C.text3, fontSize: 12, paddingVertical: 24, textAlign: "center" }}>Releases will appear here when release metadata is available in the catalogue.</Text> : null}
            </View>
          ) : null}
          {activeAlbum || activeRelease ? (
            <View style={{ marginBottom: 18, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
              <View style={{ alignItems: "center", marginBottom: 14 }}>
                {(activeAlbum?.artwork || activeRelease?.artwork) ? <Image source={{ uri: (activeAlbum?.artwork || activeRelease?.artwork) as string }} style={{ width: 184, height: 184, borderRadius: 13, backgroundColor: C.elevated }} /> : <View style={{ width: 184, height: 184, borderRadius: 13, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="disc-outline" size={54} color={C.accent} /></View>}
              </View>
              <Text style={{ color: C.text3, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>{activeAlbum ? "ALBUM" : "RELEASE"}</Text>
              <Text style={{ color: C.text, fontSize: 23, fontWeight: "900", marginTop: 4 }}>{activeAlbum?.title || activeRelease?.title}</Text>
              <Text style={{ color: C.text2, fontSize: 13, marginTop: 5 }}>{activeAlbum?.artist || activeRelease?.artist}</Text>
              <Text style={{ color: C.text3, fontSize: 11, marginTop: 6 }}>{activeAlbum?.trackCount || activeRelease?.trackCount || 0} tracks · Catalogue metadata</Text>
              <TouchableOpacity onPress={() => destinationTracks[0] ? openTrack(destinationTracks[0]) : show("No tracks are available for this release yet.")} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 12, borderRadius: 11, backgroundColor: C.accent, marginTop: 14 }}>
                <Ionicons name="play" size={17} color="#111" /><Text style={{ color: "#111", fontSize: 12, fontWeight: "800" }}>Play {activeAlbum ? "album" : "release"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {destination === "Push Link" ? (
            <View style={{ padding: 16, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
              <Ionicons name="megaphone-outline" size={26} color={C.accent} />
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 16, marginTop: 10 }}>Promote music across Kilode</Text>
              <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginTop: 7 }}>Create a campaign for an eligible track or release, choose placements and a budget, and review verified results. Campaign payments and activation are not connected yet.</Text>
              <TouchableOpacity onPress={() => show(canList ? "Artist campaign setup requires the trusted Push Link payment and activation workflow." : "Push Link campaign creation is available to eligible artist accounts.")} style={{ alignSelf: "flex-start", marginTop: 13, backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}><Text style={{ color: "#111", fontWeight: "800", fontSize: 12 }}>Explore promotion</Text></TouchableOpacity>
            </View>
          ) : null}
          {destination === "Top 100" ? (
            <>
              <View style={{ backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: C.text, fontWeight: "800", fontSize: 13 }}>Kilode Top 100</Text>
                <Text style={{ color: C.text3, fontSize: 11, lineHeight: 17, marginTop: 4 }}>{hasVerifiedChartSignals ? "Ranked using available play-count signals. Official chart rules and verified listening aggregation still need backend enforcement." : "Until verified member listening data is connected, this is a catalogue preview—not an official popularity ranking."}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingBottom: 14 }}>
                {TOP100_CATEGORIES.map((category) => (
                  <TouchableOpacity key={category} onPress={() => setSelectedGenre(category === "All" ? null : category)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: (selectedGenre || "All") === category ? C.accent : C.card, borderWidth: 1, borderColor: (selectedGenre || "All") === category ? C.accent : C.border }}>
                    <Text style={{ color: (selectedGenre || "All") === category ? "#111" : C.text2, fontSize: 11, fontWeight: "700" }}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}
          {destination === "Tailored to You" ? (
            <View style={{ backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 14 }}>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 13 }}>{topPreferredGenre ? `A little more ${topPreferredGenre}` : "Your listening, your mix"}</Text>
              <Text style={{ color: C.text3, fontSize: 11, lineHeight: 17, marginTop: 4 }}>{locallyKnownTracks.length ? "Ordered using your recent plays, saved tracks and genre signals on this device." : "Play or save a few tracks and this mix can start learning your taste on this device."} Member-wide trends and account-synced recommendations will need privacy-safe aggregated backend data.</Text>
            </View>
          ) : null}
          {activePlaylist ? (
            <View style={{ marginBottom: 18 }}>
              <View style={{ minHeight: 170, borderRadius: 18, padding: 18, justifyContent: "space-between", backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name={activePlaylist.icon as any} size={25} color={C.accent} /></View>
                  <Text style={{ color: C.text3, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>KILODE PLAYLIST</Text>
                </View>
                <View>
                  <Text style={{ color: C.text, fontSize: 24, fontWeight: "900", letterSpacing: -0.6 }}>{activePlaylist.title}</Text>
                  <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18, marginTop: 5 }}>{activePlaylist.subtitle}</Text>
                  <Text style={{ color: C.text3, fontSize: 10, marginTop: 7 }}>{activePlaylistTracks.length} available tracks · {activePlaylist.category === "tailored" ? "Personalised on this device" : "Catalogue-based collection"}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 9, marginTop: 12 }}>
                <TouchableOpacity onPress={() => activePlaylistTracks[0] ? openTrack(activePlaylistTracks[0]) : show("No tracks are available for this playlist yet.")} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 12, borderRadius: 11, backgroundColor: C.accent }}>
                  <Ionicons name="play" size={17} color="#111" /><Text style={{ color: "#111", fontSize: 12, fontWeight: "800" }}>Play collection</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSavedPlaylistIds((current) => { const next = { ...current, [activePlaylist.title]: !current[activePlaylist.title] }; if (!next[activePlaylist.title]) delete next[activePlaylist.title]; return next; })} accessibilityRole="button" accessibilityLabel={savedPlaylistIds[activePlaylist.title] ? "Unsave playlist" : "Save playlist"} style={{ width: 48, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
                  <Ionicons name={savedPlaylistIds[activePlaylist.title] ? "bookmark" : "bookmark-outline"} size={20} color={savedPlaylistIds[activePlaylist.title] ? C.accent : C.text} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: C.text3, fontSize: 11, lineHeight: 17, marginTop: 10 }}>This collection uses the catalogue currently available to the app. Saving is stored on this device; shared editorial management and member-wide trend signals need backend support.</Text>
            </View>
          ) : null}
          {destination !== "Genres" && destination !== "Playlists" && destination !== "Push Link" ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", flex: 1 }}>{activePlaylist ? "Tracklist" : destination === "Library" ? "Saved tracks" : destination === "Recently Played" ? "Recently played" : destination === "Albums" || destination === "Releases" ? "Available releases" : selectedGenre || destination}</Text>
                <Text style={{ color: C.text3, fontSize: 11 }}>{(activePlaylist ? activePlaylistTracks : destinationTracks).length} items</Text>
              </View>
              {(activePlaylist ? activePlaylistTracks : destinationTracks).map((track: any, index: number) => {
                const id = String(track.id ?? track.title);
                const title = String(track.title || "Untitled track");
                const artistName = String(track.artist || track.artist_name || "Unknown artist");
                const artwork = track.imageUrl || track.cover_url || track.artwork_url;
                return (
                  <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border }}>
                    {artwork ? <Image source={{ uri: artwork }} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: C.elevated }} /> : <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="musical-notes-outline" size={19} color={C.text3} /></View>}
                    <TouchableOpacity onPress={() => openTrack(track)} style={{ flex: 1 }} accessibilityRole="button">
                      <Text numberOfLines={1} style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>{title}</Text>
                      <Text numberOfLines={1} style={{ color: C.text3, fontSize: 11, marginTop: 4 }}>{artistName}{track.album ? " · " + track.album : ""}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSavedTrackIds((current) => { const next = { ...current, [id]: !current[id] }; if (!next[id]) delete next[id]; return next; })} accessibilityRole="button" accessibilityLabel={savedTrackIds[id] ? "Remove saved track" : "Save track"} style={{ padding: 7 }}>
                      <Ionicons name={savedTrackIds[id] ? "heart" : "heart-outline"} size={19} color={savedTrackIds[id] ? C.accent : C.text3} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openTrack(track)} accessibilityRole="button" accessibilityLabel={"Play " + title} style={{ padding: 4 }}>
                      <Ionicons name="play-circle" size={25} color={C.accent} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              {!(activePlaylist ? activePlaylistTracks : destinationTracks).length ? <View style={{ alignItems: "center", paddingVertical: 30 }}><Ionicons name="musical-notes-outline" size={32} color={C.text3} /><Text style={{ color: C.text, fontWeight: "700", marginTop: 10 }}>{activePlaylist ? "No tracks for this collection yet" : destination === "Library" ? "No saved tracks yet" : destination === "Recently Played" ? "Nothing played yet" : "No matching music yet"}</Text><Text style={{ color: C.text3, fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 }}>{activePlaylist ? "This collection will fill in as matching tracks become available in the connected catalogue." : "When music is available in the connected catalogue, it will appear here."}</Text></View> : null}
            </>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
    <Modal visible={draftOpen} animationType="slide" transparent onRequestClose={() => setDraftOpen(false)}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.58)" }}>
        <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: C.text, fontSize: 20, fontWeight: "800", flex: 1 }}>New release</Text>
            <TouchableOpacity onPress={() => setDraftOpen(false)} accessibilityLabel="Close release form"><Ionicons name="close" size={24} color={C.text2} /></TouchableOpacity>
          </View>
          <Text style={{ color: C.text2, fontSize: 13, lineHeight: 19, marginBottom: 16 }}>Start a private draft. Your music will not appear publicly until the release is submitted, reviewed and published.</Text>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: "700", marginBottom: 7 }}>Release title</Text>
          <TextInput value={releaseTitle} onChangeText={setReleaseTitle} placeholder="Enter release title" placeholderTextColor={C.text3} maxLength={120} style={{ color: C.text, backgroundColor: C.elevated, borderColor: C.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 14 }} />
          <TouchableOpacity
            onPress={async () => {
              const picked = await DocumentPicker.getDocumentAsync({
                type: ["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/x-wav", "audio/flac", "audio/ogg"],
                copyToCacheDirectory: true,
                multiple: false,
              });
              if (picked.canceled || !picked.assets?.[0]) return;
              const file = picked.assets[0];
              if (file.size && file.size > 100 * 1024 * 1024) {
                show("Audio files must be 100 MB or smaller.");
                return;
              }
              setSelectedAudio({ uri: file.uri, name: file.name, mimeType: file.mimeType, size: file.size });
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated, marginBottom: 14 }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={C.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>{selectedAudio ? "Audio selected" : "Choose audio file"}</Text>
              <Text numberOfLines={1} style={{ color: C.text3, fontSize: 11, marginTop: 3 }}>{selectedAudio ? selectedAudio.name : "MP3, M4A, AAC, WAV, FLAC or OGG · up to 100 MB"}</Text>
            </View>
            {selectedAudio ? <Ionicons name="checkmark-circle" size={19} color={C.accent} /> : null}
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>Release type</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
            {(["single", "ep", "album"] as const).map((kind) => (
              <TouchableOpacity key={kind} onPress={() => setReleaseType(kind)} style={{ flex: 1, borderRadius: 11, paddingVertical: 11, alignItems: "center", backgroundColor: releaseType === kind ? C.accentSoft : C.elevated, borderWidth: 1, borderColor: releaseType === kind ? C.accent : C.border }}>
                <Text style={{ color: releaseType === kind ? C.accent : C.text2, fontSize: 13, fontWeight: "700", textTransform: "capitalize" }}>{kind}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity disabled={savingDraft} onPress={async () => {
            if (!userId) { show("Sign in to your live Artist account to save a release draft."); return; }
            if (!editingReleaseId && !releaseTitle.trim()) {
              show("Enter a release title first.");
              return;
            }
            if (editingReleaseId && !selectedAudio) {
              show("Choose the audio file you want to upload.");
              return;
            }
            setSavingDraft(true);
            let releaseId = editingReleaseId;
            if (!releaseId) {
              const result = await createMusicReleaseDraft(userId, { title: releaseTitle, releaseType });
              if (!result.ok || !result.id) {
                setSavingDraft(false);
                show(result.error || "Could not save release draft.");
                return;
              }
              releaseId = result.id;
              setEditingReleaseId(releaseId);
            }
            if (selectedAudio) {
              const upload = await uploadMusicReleaseAudio(userId, releaseId, selectedAudio);
              if (!upload.ok) {
                setSavingDraft(false);
                setReleaseRefreshKey((key) => key + 1);
                show(`Draft saved. Audio upload failed: ${upload.error || "Choose the file again and retry"}`);
                return;
              }
            }
            setSavingDraft(false);
            setReleaseTitle("");
            setReleaseType("single");
            setSelectedAudio(null);
            setEditingReleaseId(null);
            setDraftOpen(false);
            setReleaseRefreshKey((key) => key + 1);
            show(selectedAudio ? "Private release draft and audio saved. It is not public until reviewed and published." : "Release draft saved privately. You can attach audio later.");
          }} style={{ backgroundColor: C.accent, borderRadius: 13, paddingVertical: 14, alignItems: "center", opacity: savingDraft ? 0.7 : 1 }}>
            {savingDraft ? <ActivityIndicator color="#111" /> : <Text style={{ color: "#111", fontWeight: "800", fontSize: 15 }}>{editingReleaseId ? "Retry audio upload" : "Save private draft"}</Text>}
          </TouchableOpacity>
          <Text style={{ color: C.text3, fontSize: 11, lineHeight: 16, marginTop: 10 }}>Audio is uploaded to private storage. If upload fails, choose the file again and retry without creating another release. Public streaming and publishing require the trusted review workflow.</Text>
        </View>
      </View>
    </Modal>
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button">
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (!canList) { show("Music uploads are available to Artist accounts."); return; }
            setReleaseTitle("");
            setReleaseType("single");
            setSelectedAudio(null);
            setEditingReleaseId(null);
            setDraftOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Create music release draft"
        >
          <Ionicons name="add-circle-outline" size={22} color={canList ? C.accent : C.text3} />
        </TouchableOpacity>
      </View>

      {canList ? (
        <TouchableOpacity
          onPress={() => setDraftOpen(true)}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: C.accentSoft,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: 999,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 14 }}>Drop a track</Text>
        </TouchableOpacity>
      ) : null}

      {canList ? (
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", flex: 1 }}>Your releases</Text>
            {loadingReleases ? <ActivityIndicator size="small" color={C.accent} /> : null}
          </View>
          {myReleases.length ? myReleases.map((release) => (
            <View key={release.id} style={{ flexDirection: "row", alignItems: "center", gap: 11, padding: 12, marginBottom: 8, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
              <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-notes-outline" size={20} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }} numberOfLines={1}>{release.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 3, textTransform: "capitalize" }}>{release.release_type} · {release.status}</Text>
                <Text style={{ color: release.audio_path ? C.accent : C.text3, fontSize: 10, marginTop: 3 }}>{release.audio_path ? "Audio attached privately" : "Audio not attached"}</Text>
                {release.status === "draft" && !release.audio_path ? (
                  <TouchableOpacity
                    onPress={() => {
                      setReleaseTitle(release.title || "");
                      setReleaseType(release.release_type === "ep" || release.release_type === "album" ? release.release_type : "single");
                      setSelectedAudio(null);
                      setEditingReleaseId(release.id);
                      setDraftOpen(true);
                    }}
                    style={{ alignSelf: "flex-start", marginTop: 7, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.accentSoft }}
                    accessibilityRole="button"
                    accessibilityLabel={`Attach audio to ${release.title || "release"}`}
                  >
                    <Text style={{ color: C.accent, fontWeight: "700", fontSize: 11 }}>Add audio</Text>
                  </TouchableOpacity>
                ) : null}
                {release.status === "draft" && release.audio_path ? (
                  <TouchableOpacity
                    disabled={submittingReleaseId === release.id}
                    onPress={async () => {
                      if (!userId) { show("Sign in to submit your release."); return; }
                      setSubmittingReleaseId(release.id);
                      const result = await submitMusicReleaseForReview(userId, release.id);
                      setSubmittingReleaseId(null);
                      if (!result.ok) { show(result.error || "Could not submit release."); return; }
                      setReleaseRefreshKey((key) => key + 1);
                      show("Release submitted for review. It is still private until approved and published.");
                    }}
                    style={{ alignSelf: "flex-start", marginTop: 7, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.accentSoft, opacity: submittingReleaseId === release.id ? 0.6 : 1 }}
                  >
                    <Text style={{ color: C.accent, fontWeight: "700", fontSize: 11 }}>{submittingReleaseId === release.id ? "Submitting…" : "Submit for review"}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <Ionicons name={release.status === "published" ? "checkmark-circle" : release.status === "submitted" ? "shield-checkmark-outline" : "time-outline"} size={18} color={release.status === "published" ? C.accent : C.text3} />
            </View>
          )) : (
            <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18 }}>{loadingReleases ? "Loading your releases…" : "Your private drafts and submissions will appear here."}</Text>
          )}
        </View>
      ) : null}

      {canList ? (
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", flex: 1 }}>Support your music</Text>
            {loadingSupportPages ? <ActivityIndicator size="small" color={C.accent} /> : null}
          </View>
          <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginBottom: 10 }}>
            Members can support artists voluntarily. Kilode does not pay for streams. New pages stay private drafts until Kilode review; payment checkout is not connected yet.
          </Text>
          {supportPages.map((page) => (
            <View key={page.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginBottom: 8, borderRadius: 13, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
              <Ionicons name="heart-outline" size={20} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{page.title}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 3 }}>{page.currency} · {page.status === "active" ? "Visible to members" : page.status === "draft" ? "Private · awaiting review" : page.status}</Text>
              </View>
              <Ionicons name="checkmark-circle-outline" size={18} color={C.accent} />
            </View>
          ))}
          {!supportPages.length ? (
            <TouchableOpacity
              disabled={creatingSupportPage}
              onPress={async () => {
                if (!userId) { show("Sign in to your Artist account first."); return; }
                setCreatingSupportPage(true);
                const result = await createArtistSupportPage(userId, {});
                setCreatingSupportPage(false);
                if (!result.ok) { show(result.error || "Could not create your support page."); return; }
                setSupportPages((pages) => [result.data, ...pages]);
                show("Private support page draft created. It will not be visible to members until reviewed; payments are not enabled yet.");
              }}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: C.accentSoft, borderWidth: 1, borderColor: C.border, opacity: creatingSupportPage ? 0.6 : 1 }}
            >
              {creatingSupportPage ? <ActivityIndicator size="small" color={C.accent} /> : <Ionicons name="heart-outline" size={18} color={C.accent} />}
              <Text style={{ color: C.accent, fontWeight: "700", fontSize: 13 }}>{creatingSupportPage ? "Creating…" : "Create artist support page"}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {[
          { label: "Search", icon: "search-outline" },
          { label: "Top 100", icon: "podium-outline" },
          { label: "Releases", icon: "albums-outline" },
          { label: "Albums", icon: "disc-outline" },
          { label: "Playlists", icon: "list-outline" },
          { label: "Genres", icon: "grid-outline" },
          { label: "Library", icon: "heart-outline" },
          { label: "Recently Played", icon: "time-outline" },
          { label: "Push Link", icon: "megaphone-outline" },
        ].map((item) => (
          <TouchableOpacity key={item.label} onPress={() => openMusicDestination(item.label)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name={item.icon as any} size={15} color={C.accent} />
            <Text style={{ color: C.text, fontSize: 12, fontWeight: "700" }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginHorizontal: 16, marginTop: 14, padding: 4, flexDirection: "row", borderRadius: 12, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 9, backgroundColor: tab === t ? C.card : "transparent" }}
          >
            <Text style={{ color: tab === t ? C.text : C.text3, fontWeight: tab === t ? "700" : "500", fontSize: 12 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => (onOpenArtist ? onOpenArtist(FEATURED.name) : show(FEATURED.name))}
        style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
      >
        <Image source={{ uri: FEATURED.imageUrl }} style={{ width: "100%", height: 116 }} resizeMode="cover" />
        <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "600", fontSize: 14, letterSpacing: -0.15 }}>{FEATURED.name}</Text>
            <Text style={{ color: C.text3, fontSize: 12, marginTop: 3 }}>{FEATURED.meta}</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.text3, fontWeight: "700", fontSize: 10 }}>Featured preview</Text>
          </View>
        </View>
      </TouchableOpacity>

      {(tab === "Home" || tab === "Charts" || tab === "Discover") ? (
        <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, flex: 1 }}>{tab === "Discover" ? "Picked for discovery" : "Kilode Top 100"}</Text>
          <TouchableOpacity onPress={() => openMusicDestination("Top 100")} accessibilityRole="button"><Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>Open Top 100</Text></TouchableOpacity>
        </View>
      ) : null}

      {(tab === "Charts" || tab === "Home" || tab === "Discover" ? [...tracks].sort((a: any, b: any) => Number(b.play_count ?? b.plays ?? b.stream_count ?? 0) - Number(a.play_count ?? a.plays ?? a.stream_count ?? 0)).slice(0, tab === "Charts" ? 100 : 5) : []).map((track: any, index: number) => {
        const id = String(track.id ?? track.title);
        const title = String(track.title || "Untitled track");
        const artistName = String(track.artist || track.artist_name || "Unknown artist");
        const artwork = track.imageUrl || track.cover_url || track.artwork_url;
        return (
          <TouchableOpacity key={id} onPress={() => openTrack(track)} style={{ marginHorizontal: 16, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 7, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.text3, fontWeight: "800", width: 20 }}>{index + 1}</Text>
            {artwork ? <Image source={{ uri: artwork }} style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: C.elevated }} /> : <View style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="musical-notes" size={18} color={C.text3} /></View>}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: C.text, fontWeight: "600", fontSize: 13, letterSpacing: -0.1 }}>{title}</Text>
              <Text numberOfLines={1} style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>{artistName}</Text>
            </View>
            <Ionicons name="play-circle" size={28} color={C.accent} />
          </TouchableOpacity>
        );
      })}
      {(tab === "Home" || tab === "Discover") ? (
        <TouchableOpacity onPress={() => openMusicDestination("Tailored to You")} style={{ marginHorizontal: 16, marginTop: 18, padding: 14, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name="sparkles-outline" size={22} color={C.accent} /></View>
          <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>Tailored to You</Text><Text style={{ color: C.text3, fontSize: 11, marginTop: 4 }}>Adapts to what you save and play on this device</Text></View>
          <Ionicons name="chevron-forward" size={18} color={C.text3} />
        </TouchableOpacity>
      ) : null}

      {(tab === "Home" || tab === "Discover") ? (
        <View style={{ paddingHorizontal: 16, marginTop: 20, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", flex: 1 }}>More to explore</Text>
          <TouchableOpacity onPress={() => openMusicDestination("Playlists")}><Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>Playlists</Text></TouchableOpacity>
        </View>
      ) : null}
      {(tab === "Home" || tab === "Discover") ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 10 }}>
        {[
          { title: "Kilode Top 100", detail: "Kilode's own chart destination", icon: "podium-outline", target: "Top 100" },
          { title: "Playlists for every mood", detail: "Browse collections and categories", icon: "list-outline", target: "Playlists" },
          { title: "New Releases", detail: "Fresh singles, EPs & albums", icon: "disc-outline", target: "Releases" },
          { title: "Your Library", detail: "Saved music in one place", icon: "heart-outline", target: "Library" },
          { title: "Recently Played", detail: "Pick up where you left off", icon: "time-outline", target: "Recently Played" },
          { title: "Push Link", detail: "Discover promoted music", icon: "megaphone-outline", target: "Push Link" },
        ].map((item) => <TouchableOpacity key={item.title} onPress={() => openMusicDestination(item.target)} style={{ width: 154, padding: 13, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
          <Ionicons name={item.icon as any} size={22} color={C.accent} />
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 13, marginTop: 13 }}>{item.title}</Text>
          <Text style={{ color: C.text3, fontSize: 11, lineHeight: 16, marginTop: 4 }}>{item.detail}</Text>
        </TouchableOpacity>)}
      </ScrollView> : null}
      {(tab === "Home" || tab === "Discover") ? <Text style={{ color: C.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2, paddingHorizontal: 16, marginTop: 18, marginBottom: 9 }}>Genres</Text> : null}
      {(tab === "Home" || tab === "Discover") ? <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 }}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => openMusicDestination(g.label, g.label)}
            style={{ width: "48%", minHeight: 52, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 11, paddingVertical: 10, borderRadius: 11, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
          >
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: g.color, opacity: 0.9, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-note" size={14} color="#fff" />
            </View>
            <Text numberOfLines={1} style={{ color: C.text, fontWeight: "600", fontSize: 12 }}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View> : null}

      {tab === "Artists" ? (
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", flex: 1 }}>Artists</Text>
            {loadingArtists ? <ActivityIndicator size="small" color={C.accent} /> : null}
          </View>
          {artistProfiles.map((artist) => {
            const isFollowing = Boolean(followedArtists[artist.id]);
            const avatar = artist.avatar_url;
            return (
              <View key={artist.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border }}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.elevated }} />
                ) : (
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="person-outline" size={21} color={C.text3} />
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onOpenArtist ? onOpenArtist(artist) : show("Artist profile navigation is not connected yet.")}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>{artist.display_name || artist.handle}</Text>
                  <Text style={{ color: C.text3, fontSize: 11, marginTop: 4 }} numberOfLines={1}>@{artist.handle}{artist.bio ? ` · ${artist.bio}` : ""}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={busyArtistId === artist.id}
                  accessibilityRole="button"
                  accessibilityLabel={isFollowing ? `Unfollow ${artist.display_name || artist.handle}` : `Follow ${artist.display_name || artist.handle}`}
                  onPress={async () => {
                    if (!userId) { show("Sign in to follow artists."); return; }
                    if (busyArtistId) return;
                    setBusyArtistId(artist.id);
                    const result = await toggleArtistFollow(userId, artist.id);
                    setBusyArtistId(null);
                    if (!result.ok || typeof result.following !== "boolean") {
                      show(result.error || "Could not update your follow. Please try again.");
                      return;
                    }
                    setFollowedArtists((current) => ({ ...current, [artist.id]: result.following as boolean }));
                    show(result.following ? `Following ${artist.display_name || artist.handle}` : `Unfollowed ${artist.display_name || artist.handle}`);
                  }}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: isFollowing ? C.elevated : C.accent, borderWidth: 1, borderColor: isFollowing ? C.border : C.accent, opacity: busyArtistId === artist.id ? 0.6 : 1 }}
                >
                  <Text style={{ color: isFollowing ? C.text : "#111", fontWeight: "700", fontSize: 11 }}>{busyArtistId === artist.id ? "…" : isFollowing ? "Following" : "Follow"}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {!loadingArtists && !artistProfiles.length ? (
            <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
              {artistCatalogueError || "No artist profiles are available yet. Artist accounts will appear here when the Kilode backend is connected."}
            </Text>
          ) : null}
          <Text style={{ color: C.text3, fontSize: 11, lineHeight: 16, marginTop: 12 }}>Profiles and follow status come from Kilode's backend. Follower counts and rankings are not displayed until verified data is available.</Text>
        </View>
      ) : null}

      {(tab === "Home" || tab === "Discover") ? (
        <View style={{ marginTop: 20 }}>
          <View style={{ paddingHorizontal: 16, flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, flex: 1 }}>Artists on Kilode</Text>
            <TouchableOpacity onPress={() => setTab("Artists")} accessibilityRole="button" accessibilityLabel="See all registered artists">
              <Text style={{ color: C.accent, fontSize: 12, fontWeight: "700" }}>See all</Text>
            </TouchableOpacity>
          </View>
          {loadingArtists ? (
            <View style={{ height: 92, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="small" color={C.accent} />
            </View>
          ) : artistProfiles.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
              {artistProfiles.slice(0, 12).map((artist: any) => (
                <TouchableOpacity
                  key={artist.id}
                  onPress={() => onOpenArtist ? onOpenArtist(artist) : setTab("Artists")}
                  accessibilityRole="button"
                  accessibilityLabel={`Open artist ${artist.display_name || artist.handle}`}
                  activeOpacity={0.82}
                  style={{ width: 68, alignItems: "center" }}
                >
                  {artist.avatar_url ? (
                    <Image source={{ uri: artist.avatar_url }} style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }} />
                  ) : (
                    <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: C.accent, fontWeight: "800", fontSize: 18 }}>{String(artist.display_name || artist.handle || "A").trim().slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text numberOfLines={1} style={{ color: C.text, fontSize: 11, fontWeight: "600", marginTop: 7, width: 68, textAlign: "center" }}>{artist.display_name || artist.handle}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity onPress={() => setTab("Artists")} style={{ marginHorizontal: 16, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="people-outline" size={19} color={C.accent} />
              <Text style={{ color: C.text3, fontSize: 12, lineHeight: 17, flex: 1 }}>{artistCatalogueError || "Browse registered artist profiles on Kilode."}</Text>
              <Ionicons name="chevron-forward" size={17} color={C.text3} />
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </ScrollView>
    </>
  );
}
