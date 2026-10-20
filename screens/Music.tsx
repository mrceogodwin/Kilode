import React, { useEffect, useState } from "react";
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

const CHARTS = [
  { rank: 1, title: "Calm Down", artist: "Rema", color: "#D97706" },
  { rank: 2, title: "Beautiful Things", artist: "Burna Boy", color: "#4B5563" },
  { rank: 3, title: "Lonely At The Top", artist: "Asake", color: "#B45309" },
  { rank: 4, title: "Ojuelegba Nights", artist: "Simi Sola", color: "#7C3AED" },
  { rank: 5, title: "Water & Light", artist: "Ayo Blue", color: "#2563EB" },
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
  const [musicQuery, setMusicQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [savedTrackIds, setSavedTrackIds] = useState<Record<string, boolean>>({});
  const [recentTrackIds, setRecentTrackIds] = useState<string[]>([]);

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
    if (tab !== "Artists") return () => { active = false; };
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
    setDestination(name);
    setSelectedGenre(genre ?? null);
    setMusicQuery("");
  };

  const catalogueTracks = tracks.filter((track: any) => {
    const query = musicQuery.trim().toLowerCase();
    const genreMatch = !selectedGenre || String(track.genre || track.genres || "").toLowerCase().includes(selectedGenre.toLowerCase());
    const queryMatch = !query || [track.title, track.artist, track.album, track.genre].some((value) => String(value || "").toLowerCase().includes(query));
    return genreMatch && queryMatch;
  });
  const destinationTracks = destination === "Library"
    ? catalogueTracks.filter((track: any) => savedTrackIds[String(track.id ?? track.title)])
    : destination === "Recently Played"
      ? recentTrackIds.map((id) => catalogueTracks.find((track: any) => String(track.id ?? track.title) === id)).filter(Boolean)
      : destination === "Albums" || destination === "Releases"
        ? catalogueTracks.filter((track: any) => track.album || track.release_type)
        : catalogueTracks;


  return (
    <>
    <Modal visible={Boolean(destination)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDestination(null)}>
      <View style={{ flex: 1, backgroundColor: C.bg || C.background || "#111114" }}>
        <View style={{ paddingTop: 14, paddingHorizontal: 18, paddingBottom: 12, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.border }}>
          <TouchableOpacity onPress={() => setDestination(null)} accessibilityRole="button" accessibilityLabel="Back to Music" style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: C.elevated }}>
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
                <TouchableOpacity key={genre.id} onPress={() => { setSelectedGenre(genre.label); setDestination(genre.label); }} style={{ width: "48%", minHeight: 76, borderRadius: 14, padding: 13, justifyContent: "flex-end", backgroundColor: genre.color }}>
                  <Ionicons name="musical-notes" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, marginTop: 8 }}>{genre.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {destination === "Playlists" ? (
            <View style={{ gap: 10, marginBottom: 18 }}>
              {[
                { title: "Naija Now", subtitle: "Contemporary Nigerian sounds", icon: "headset-outline" },
                { title: "Late Night Rotation", subtitle: "Smooth tracks for after hours", icon: "moon-outline" },
                { title: "New & Noted", subtitle: "Recently added music", icon: "sparkles-outline" },
                { title: "The Discovery List", subtitle: "Find your next favourite", icon: "compass-outline" },
              ].map((playlist) => (
                <TouchableOpacity key={playlist.title} onPress={() => { setDestination("Playlist · " + playlist.title); setMusicQuery(""); }} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: C.card, borderRadius: 13, borderWidth: 1, borderColor: C.border }}>
                  <View style={{ width: 52, height: 52, borderRadius: 9, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Ionicons name={playlist.icon as any} size={24} color={C.accent} /></View>
                  <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>{playlist.title}</Text><Text style={{ color: C.text3, fontSize: 12, marginTop: 4 }}>{playlist.subtitle}</Text><Text style={{ color: C.text3, fontSize: 10, marginTop: 4 }}>Curated collection · catalogue-dependent</Text></View>
                  <Ionicons name="chevron-forward" size={18} color={C.text3} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {destination === "Library" ? (
            <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginBottom: 14 }}>Your saved tracks on this device are shown here. Account-synced library and purchases require the connected Music backend.</Text>
          ) : null}
          {destination === "Push Link" ? (
            <View style={{ padding: 16, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
              <Ionicons name="megaphone-outline" size={26} color={C.accent} />
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 16, marginTop: 10 }}>Promote music across Kilode</Text>
              <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginTop: 7 }}>Create a campaign for an eligible track or release, choose placements and a budget, and review verified results. Campaign payments and activation are not connected yet.</Text>
              <TouchableOpacity onPress={() => show(canList ? "Artist campaign setup requires the trusted Push Link payment and activation workflow." : "Push Link campaign creation is available to eligible artist accounts.")} style={{ alignSelf: "flex-start", marginTop: 13, backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}><Text style={{ color: "#111", fontWeight: "800", fontSize: 12 }}>Explore promotion</Text></TouchableOpacity>
            </View>
          ) : null}
          {destination?.startsWith("Playlist · ") ? (
            <Text style={{ color: C.text3, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>This is a curated playlist concept. Tracks below come from the currently available catalogue; playlist persistence and editorial publishing need backend support.</Text>
          ) : null}
          {destination !== "Genres" && destination !== "Playlists" && destination !== "Push Link" ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", flex: 1 }}>{destination === "Library" ? "Saved tracks" : destination === "Recently Played" ? "Recently played" : destination === "Albums" || destination === "Releases" ? "Available releases" : selectedGenre || destination}</Text>
                <Text style={{ color: C.text3, fontSize: 11 }}>{destinationTracks.length} items</Text>
              </View>
              {destinationTracks.map((track: any, index: number) => {
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
                    <TouchableOpacity onPress={() => setSavedTrackIds((current) => ({ ...current, [id]: !current[id] }))} accessibilityRole="button" accessibilityLabel={savedTrackIds[id] ? "Remove saved track" : "Save track"} style={{ padding: 7 }}>
                      <Ionicons name={savedTrackIds[id] ? "heart" : "heart-outline"} size={19} color={savedTrackIds[id] ? C.accent : C.text3} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openTrack(track)} accessibilityRole="button" accessibilityLabel={"Play " + title} style={{ padding: 4 }}>
                      <Ionicons name="play-circle" size={25} color={C.accent} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              {!destinationTracks.length ? <View style={{ alignItems: "center", paddingVertical: 30 }}><Ionicons name="musical-notes-outline" size={32} color={C.text3} /><Text style={{ color: C.text, fontWeight: "700", marginTop: 10 }}>{destination === "Library" ? "No saved tracks yet" : destination === "Recently Played" ? "Nothing played yet" : "No matching music yet"}</Text><Text style={{ color: C.text3, fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 }}>When music is available in the connected catalogue, it will appear here.</Text></View> : null}
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
          { label: "Releases", icon: "albums-outline" },
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
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, flex: 1 }}>{tab === "Discover" ? "Popular picks" : "Chart preview"}</Text>
          {tab !== "Charts" ? <TouchableOpacity onPress={() => setTab("Charts")} accessibilityRole="button"><Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>See all</Text></TouchableOpacity> : null}
        </View>
      ) : null}

      {(tab === "Charts" || tab === "Home" ? CHARTS : tab === "Discover" ? CHARTS.slice(0, 3) : []).map((row) => {
        const payload = { id: `c${row.rank}`, title: row.title, artist: row.artist, color: row.color };
        return (
          <TouchableOpacity
            key={row.rank}
            onPress={() => openTrack(payload)}
            style={{
              marginHorizontal: 16,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 7,
              paddingHorizontal: 2,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <Text style={{ color: C.text3, fontWeight: "800", width: 20 }}>{row.rank}</Text>
            <View style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: row.color, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-notes" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "600", fontSize: 13, letterSpacing: -0.1 }}>{row.title}</Text>
              <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>{row.artist}</Text>
            </View>
            <Ionicons name="play-circle" size={28} color={C.accent} />
          </TouchableOpacity>
        );
      })}

      {(tab === "Home" || tab === "Discover") ? (
        <View style={{ paddingHorizontal: 16, marginTop: 20, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", flex: 1 }}>More to explore</Text>
          <TouchableOpacity onPress={() => openMusicDestination("Playlists")}><Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>Playlists</Text></TouchableOpacity>
        </View>
      ) : null}
      {(tab === "Home" || tab === "Discover") ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 10 }}>
        {[
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

      {(tab === "Home" || tab === "Discover") ? <>
      <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>From Kilode</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {tracks.map((t: any) => (
          <TouchableOpacity key={t.id} onPress={() => openTrack(t)} style={{ width: 112 }}>
            {t.imageUrl || t.coverUrl || t.cover_url || t.artworkUrl ? (
              <Image source={{ uri: t.imageUrl || t.coverUrl || t.cover_url || t.artworkUrl }} style={{ width: 112, height: 112, borderRadius: 10, backgroundColor: t.color || C.elevated }} resizeMode="cover" />
            ) : (
              <View style={{ width: 112, height: 112, borderRadius: 10, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
              </View>
            )}
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 6 }} numberOfLines={1}>{t.title}</Text>
            <Text style={{ color: C.text3, fontSize: 11 }} numberOfLines={1}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </> : null}
    </ScrollView>
    </>
  );
}
