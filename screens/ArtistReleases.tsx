import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  listReleaseDrafts,
  createReleaseDraft,
  updateReleaseDraft,
  deleteReleaseDraft,
  rightsDeclarationText,
  RELEASE_TYPES,
  type ArtistReleaseDraft,
  type ReleaseType,
} from "../lib/artistReleases";
import { EmptyState } from "../components/ui/EmptyState";
import { ArtistPlanCreditsScreen } from "./ArtistPlanCredits";

type Props = {
  s: any;
  C: any;
  sessionName?: string;
  onBack: () => void;
  show: (m: string) => void;
  /** When true, open directly in the new-draft form (e.g. from Create → Track). */
  initialCompose?: boolean;
};

const GENRE_OPTIONS = ["Afrobeats", "Amapiano", "R&B", "Highlife", "Afro-fusion", "Hip-Hop", "Gospel", "Other"];

function typeLabel(t: ReleaseType | undefined): string {
  if (t === "ep") return "EP";
  if (t === "album") return "Album";
  return "Single";
}

export function ArtistReleasesScreen({ s, C, sessionName, onBack, show, initialCompose }: Props) {
  const [drafts, setDrafts] = useState<ArtistReleaseDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(!!initialCompose);
  const [showPlanCredits, setShowPlanCredits] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState(sessionName || "");
  const [genre, setGenre] = useState("Afrobeats");
  const [releaseType, setReleaseType] = useState<ReleaseType>("single");
  const [notes, setNotes] = useState("");
  const [localAudioUri, setLocalAudioUri] = useState<string | null>(null);
  const [localAudioName, setLocalAudioName] = useState<string | null>(null);
  const [rights, setRights] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await listReleaseDrafts();
    setDrafts(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (initialCompose) {
      setComposing(true);
      setShowPlanCredits(false);
      setEditingId(null);
      setTitle("");
      setArtistName(sessionName || "");
      setGenre("Afrobeats");
      setReleaseType("single");
      setNotes("");
      setLocalAudioUri(null);
      setLocalAudioName(null);
      setRights(false);
    }
  }, [initialCompose, sessionName]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setArtistName(sessionName || "");
    setGenre("Afrobeats");
    setReleaseType("single");
    setNotes("");
    setLocalAudioUri(null);
    setLocalAudioName(null);
    setRights(false);
  };

  const openNew = () => {
    resetForm();
    setShowPlanCredits(false);
    setComposing(true);
  };

  const openEdit = (d: ArtistReleaseDraft) => {
    setEditingId(d.id);
    setTitle(d.title);
    setArtistName(d.artistName);
    setGenre(d.genre || "Afrobeats");
    setReleaseType(d.releaseType || "single");
    setNotes(d.notes || "");
    setLocalAudioUri(d.localAudioUri || null);
    setLocalAudioName(d.localAudioName || null);
    setRights(!!d.rightsAcknowledged);
    setShowPlanCredits(false);
    setComposing(true);
  };

  const onPickAudio = async () => {
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) {
        setPicking(false);
        return;
      }
      const asset = result.assets[0];
      setLocalAudioUri(asset.uri);
      setLocalAudioName(asset.name || "audio");
      show("Audio linked on this device only");
    } catch {
      show("Could not open file picker");
    } finally {
      setPicking(false);
    }
  };

  const onClearAudio = () => {
    setLocalAudioUri(null);
    setLocalAudioName(null);
  };

  const onSaveDraft = async () => {
    setSaving(true);
    if (editingId) {
      const result = await updateReleaseDraft(editingId, {
        title,
        artistName,
        genre,
        notes,
        releaseType,
        localAudioUri,
        localAudioName,
        rightsAcknowledged: rights,
      });
      setSaving(false);
      if (!result.ok) {
        show(result.message);
        return;
      }
      show("Draft updated on this device");
    } else {
      const result = await createReleaseDraft({
        title,
        artistName,
        genre,
        notes,
        releaseType,
        localAudioUri,
        localAudioName,
        rightsAcknowledged: rights,
      });
      setSaving(false);
      if (!result.ok) {
        show(result.message);
        return;
      }
      show("Draft saved on this device");
    }
    resetForm();
    setComposing(false);
    await refresh();
  };

  const onDelete = async (id: string) => {
    await deleteReleaseDraft(id);
    show("Draft removed");
    if (editingId === id) {
      resetForm();
      setComposing(false);
    }
    await refresh();
  };

  if (showPlanCredits) {
    return <ArtistPlanCreditsScreen s={s} C={C} onBack={() => setShowPlanCredits(false)} />;
  }

  if (composing) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} keyboardShouldPersistTaps="handled">
        <View style={s.padH}>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setComposing(false);
            }}
            style={{ marginBottom: 12 }}
            accessibilityRole="button"
          >
            <Text style={s.link}>‹ Back to drafts</Text>
          </TouchableOpacity>
          <Text style={s.h1}>{editingId ? "Edit draft" : "New release draft"}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>
            Local draft only. Server upload and publish need the dedicated music API.
          </Text>

          <Text style={[s.meta, { marginTop: 20, marginBottom: 8, fontWeight: "700" }]}>Release type</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {RELEASE_TYPES.map((rt) => (
              <TouchableOpacity
                key={rt.id}
                style={[s.chip, releaseType === rt.id && s.chipOn]}
                onPress={() => setReleaseType(rt.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: releaseType === rt.id }}
              >
                <Text style={[s.chipText, releaseType === rt.id && s.chipTextOn]}>{rt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.meta, { marginTop: 6, lineHeight: 18 }]}>
            {RELEASE_TYPES.find((r) => r.id === releaseType)?.hint}. EP/Album multi-track is not built yet.
          </Text>

          <Text style={[s.meta, { marginTop: 20, marginBottom: 6, fontWeight: "700" }]}>Title</Text>
          <TextInput
            style={{
              backgroundColor: C.input,
              borderRadius: 14,
              padding: 14,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
              fontSize: 16,
            }}
            placeholder={releaseType === "single" ? "Track title" : "Release / project title"}
            placeholderTextColor={C.text3}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[s.meta, { marginTop: 16, marginBottom: 6, fontWeight: "700" }]}>Artist name</Text>
          <TextInput
            style={{
              backgroundColor: C.input,
              borderRadius: 14,
              padding: 14,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
              fontSize: 16,
            }}
            placeholder="How the artist is credited"
            placeholderTextColor={C.text3}
            value={artistName}
            onChangeText={setArtistName}
          />

          <Text style={[s.meta, { marginTop: 16, marginBottom: 8, fontWeight: "700" }]}>Genre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {GENRE_OPTIONS.map((g) => (
              <TouchableOpacity key={g} style={[s.chip, genre === g && s.chipOn]} onPress={() => setGenre(g)}>
                <Text style={[s.chipText, genre === g && s.chipTextOn]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[s.meta, { marginTop: 16, marginBottom: 8, fontWeight: "700" }]}>Audio (optional · this device only)</Text>
          {localAudioUri ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.border,
                backgroundColor: C.card,
                gap: 10,
              }}
            >
              <Ionicons name="musical-notes" size={20} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={s.roomName} numberOfLines={1}>
                  {localAudioName || "Audio file"}
                </Text>
                <Text style={s.meta}>Linked on device · not uploaded</Text>
              </View>
              <TouchableOpacity onPress={onClearAudio} accessibilityRole="button" accessibilityLabel="Remove audio">
                <Ionicons name="close-circle" size={22} color={C.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.border,
                borderStyle: "dashed",
                backgroundColor: C.input,
                gap: 8,
                opacity: picking ? 0.6 : 1,
              }}
              onPress={onPickAudio}
              disabled={picking}
              accessibilityRole="button"
            >
              {picking ? (
                <ActivityIndicator color={C.accent} size="small" />
              ) : (
                <Ionicons name="attach" size={18} color={C.accent} />
              )}
              <Text style={[s.roomName, { color: C.accent }]}>
                {picking ? "Opening picker…" : "Attach audio from device"}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={[s.meta, { marginTop: 6, lineHeight: 18 }]}>
            Stores a local file reference only. Does not upload, stream, or publish. Server upload requires the music API.
          </Text>

          <Text style={[s.meta, { marginTop: 16, marginBottom: 6, fontWeight: "700" }]}>Notes (optional)</Text>
          <TextInput
            style={{
              backgroundColor: C.input,
              borderRadius: 14,
              padding: 14,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
              fontSize: 15,
              minHeight: 88,
              textAlignVertical: "top",
            }}
            placeholder="Credits, featured artists, context…"
            placeholderTextColor={C.text3}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <View
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: C.border,
              backgroundColor: C.card,
            }}
          >
            <Text style={[s.meta, { lineHeight: 20 }]}>{rightsDeclarationText()}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
              <Switch
                value={rights}
                onValueChange={setRights}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor="#fff"
              />
              <Text style={[s.roomName, { marginLeft: 12, flex: 1 }]}>I confirm the rights statement</Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              backgroundColor: C.accent + "18",
              borderWidth: 1,
              borderColor: C.accent + "40",
            }}
          >
            <Text style={[s.meta, { color: C.accent, lineHeight: 18 }]}>
              Drafts stay on this device. They are not uploaded, reviewed, or published until the dedicated music backend is connected. No credit is charged for local drafts.
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { marginTop: 22, opacity: saving ? 0.6 : 1 }]}
            disabled={saving}
            onPress={onSaveDraft}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>
                  {editingId ? "Update local draft" : "Save local draft"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[s.meta, { marginTop: 14, marginBottom: 24 }]}>
            Server submit, review, credits, and publish are not available in this build.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }} accessibilityRole="button">
          <Text style={s.link}>‹ My Space</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: C.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h1}>Releases</Text>
            <Text style={s.sub}>Local drafts · not on server yet</Text>
          </View>
        </View>
      </View>

      <View style={[s.padH, { marginTop: 8, flexDirection: "row", gap: 10 }]}>
        <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={openNew}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>New draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.ghostBtn, { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
          onPress={() => setShowPlanCredits(true)}
          accessibilityRole="button"
        >
          <Ionicons name="wallet-outline" size={18} color={C.text} />
          <Text style={s.ghostBtnText}>Plan</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <Text style={[s.meta, { lineHeight: 18 }]}>
          Artist release workspace. Single / EP / Album + optional local audio. Open Plan for how credits and Push Link will work when the music API is live.
        </Text>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Your drafts ({drafts.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />
      ) : drafts.length === 0 ? (
        <EmptyState
          title="No drafts yet"
          body="Create a release draft with type, title, artist, optional audio, and rights confirmation."
          textColor={C.text}
          mutedColor={C.text2}
          accentColor={C.accent}
          icon="document-text-outline"
        />
      ) : (
        drafts.map((d) => (
          <TouchableOpacity key={d.id} style={[s.roomRow, { alignItems: "flex-start" }]} onPress={() => openEdit(d)}>
            <View style={[s.roomAv, { backgroundColor: C.accent }]}>
              <Ionicons name={d.localAudioUri ? "musical-notes" : "musical-note"} size={16} color="#fff" />
            </View>
            <View style={[s.flex, { marginLeft: 12 }]}>
              <Text style={s.roomName}>{d.title}</Text>
              <Text style={s.meta}>
                {typeLabel(d.releaseType)} · {d.artistName} · {d.genre}
                {d.localAudioName ? ` · ${d.localAudioName}` : ""}
              </Text>
              <Text style={[s.meta, { marginTop: 4 }]}>
                Local draft · {new Date(d.updatedAt).toLocaleDateString()} · tap to edit
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onDelete(d.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${d.title}`}
            >
              <Ionicons name="trash-outline" size={20} color={C.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
