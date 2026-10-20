import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { createArtistSupportPage, createMusicReleaseDraft, listOwnMusicReleases, listOwnSupportPages, submitMusicReleaseForReview, uploadMusicReleaseAudio } from "../lib/supabase";
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
  onOpenArtist?: (artistName: string) => void;
  accountKind?: string;
  userId?: string;
  tracks?: any[];
};

const TABS = ["Home", "Discover", "Charts", "Artists"] as const;

const FEATURED = {
  name: "Ayra Starr",
  meta: "R&B · Afrobeats · 2.8M followers",
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
  const [following, setFollowing] = useState(false);
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

  const openTrack = (t: any) => {
    if (onOpenTrack) onOpenTrack(t);
    else {
      onPlay(t);
      show(`Playing ${t.title} · full stream when Music API is live`);
    }
  };

  return (
    <>
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
          onPress={() => canList ? setDraftOpen(true) : show("Music uploads are available to Artist accounts.")}
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
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: tab === t ? C.accentSoft : "transparent",
              borderWidth: 1,
              borderColor: tab === t ? C.accent : C.border,
            }}
          >
            <Text style={{ color: tab === t ? C.accent : C.text2, fontWeight: "600", fontSize: 13 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => (onOpenArtist ? onOpenArtist(FEATURED.name) : show(FEATURED.name))}
        style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
      >
        <Image source={{ uri: FEATURED.imageUrl }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
        <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "600", fontSize: 14, letterSpacing: -0.15 }}>{FEATURED.name}</Text>
            <Text style={{ color: C.text3, fontSize: 12, marginTop: 3 }}>{FEATURED.meta}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setFollowing((f) => !f);
              show(following ? `Unfollowed ${FEATURED.name}` : `Following ${FEATURED.name}`);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: following ? C.elevated : C.accent,
              borderWidth: 1,
              borderColor: following ? C.border : C.accent,
            }}
          >
            <Text style={{ color: following ? C.text : "#111", fontWeight: "800", fontSize: 12 }}>
              {following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, flex: 1 }}>Top charts</Text>
        <TouchableOpacity onPress={() => setTab("Charts")}>
          <Text style={{ color: C.accent, fontWeight: "700", fontSize: 12 }}>See all</Text>
        </TouchableOpacity>
      </View>

      {(tab === "Charts" || tab === "Home" ? CHARTS : CHARTS.slice(0, 3)).map((row) => {
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
              padding: 10,
              borderRadius: 14,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Text style={{ color: C.text3, fontWeight: "800", width: 20 }}>{row.rank}</Text>
            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: row.color, alignItems: "center", justifyContent: "center" }}>
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

      <Text style={{ color: C.text, fontSize: 15, fontWeight: "600", letterSpacing: -0.2, paddingHorizontal: 16, marginTop: 18, marginBottom: 9 }}>Genres</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 }}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => show(`${g.label} catalogue when Music API is live.`)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: g.color }} />
            <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ color: C.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.25, paddingHorizontal: 16, marginTop: 20, marginBottom: 10 }}>From Kilode</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {tracks.map((t: any) => (
          <TouchableOpacity key={t.id} onPress={() => openTrack(t)} style={{ width: 120 }}>
            <View style={{ width: 120, height: 120, borderRadius: 14, backgroundColor: t.color || C.elevated, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 12, marginTop: 6 }} numberOfLines={1}>{t.title}</Text>
            <Text style={{ color: C.text3, fontSize: 11 }} numberOfLines={1}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
    </>
  );
}
