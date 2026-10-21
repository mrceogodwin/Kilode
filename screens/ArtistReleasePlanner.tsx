import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Palette } from "../themeStyles";

type Props = { s: any; C: Palette; onBack: () => void; show: (message: string) => void; artistName: string; artistHandle?: string };
type Draft = { title: string; releaseType: string; genre: string; releaseDate: string; credits: string; notes: string; audioReady?: boolean; artworkReady?: boolean; metadataChecked?: boolean; rightsConfirmed?: boolean; updatedAt: string };
const STORAGE_KEY = "@kilode/artist-release-planner-v1";

export function ArtistReleasePlanner({ s, C, onBack, show, artistName, artistHandle }: Props) {
  const [title, setTitle] = useState("");
  const [releaseType, setReleaseType] = useState("Single");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [credits, setCredits] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  // Prefer the account handle over the display name: two artists can share a display name.
  // This remains device-local scoping, not a server-side account identity.
  const accountScope = (artistHandle || artistName || "artist").trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_-]/g, "_").slice(0, 64) || "artist";
  const storageKey = `${STORAGE_KEY}:${accountScope}`;
  const [saved, setSaved] = useState(false);
  const [rights, setRights] = useState(false);
  const [artwork, setArtwork] = useState(false);
  const [metadata, setMetadata] = useState(false);
  const [audio, setAudio] = useState(false);

  const dateValid = useMemo(() => { if (!releaseDate) return true; if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) return false; const parsed = new Date(`${releaseDate}T00:00:00Z`); return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === releaseDate; }, [releaseDate]);
  const requiredReady = title.trim().length > 0 && genre.trim().length > 0 && dateValid;
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!active || !raw) return;
      try { const value = JSON.parse(raw); if (Array.isArray(value)) setDrafts(value.filter((x): x is Draft => x && typeof x.title === "string" && typeof x.genre === "string").slice(0, 20)); } catch { setDrafts([]); }
    }).catch(() => { if (active) setDrafts([]); });
    return () => { active = false; };
  }, [storageKey]);

  const loadDraft = (draft: Draft) => {
    setTitle(draft.title); setReleaseType(draft.releaseType || "Single"); setGenre(draft.genre); setReleaseDate(draft.releaseDate || ""); setCredits(draft.credits || ""); setNotes(draft.notes || ""); setAudio(draft.audioReady === true); setArtwork(draft.artworkReady === true); setMetadata(draft.metadataChecked === true); setRights(draft.rightsConfirmed === true); setSaved(true);
    show("Release draft loaded.");
  };

  const deleteDraft = async (draft: Draft) => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      let existing: Draft[] = [];
      try { existing = raw ? JSON.parse(raw) : []; } catch { existing = []; }
      const next = (Array.isArray(existing) ? existing : []).filter((item) =>
        !(item.title === draft.title && item.releaseType === draft.releaseType && item.updatedAt === draft.updatedAt)
      );
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      setDrafts(next);
      show("Release draft deleted from this device.");
    } catch {
      show("Could not delete this draft. Try again.");
    }
  };

  const checklist = [
    { label: "Audio master prepared", value: audio, set: setAudio },
    { label: "Artwork prepared", value: artwork, set: setArtwork },
    { label: "Title, genre and release date checked", value: metadata, set: setMetadata },
    { label: "Rights and contributor permissions confirmed", value: rights, set: setRights },
  ] as const;
  const field = (label: string, value: string, onChangeText: (v: string) => void, placeholder: string, multiline = false) => (
    <View style={{ marginTop: 15 }}>
      <Text style={{ color: C.text, fontSize: 12, fontWeight: "700", marginBottom: 7 }}>{label}</Text>
      <TextInput value={value} onChangeText={(v) => { onChangeText(v); setSaved(false); }} placeholder={placeholder} placeholderTextColor={C.text3} multiline={multiline} autoCapitalize="sentences" style={{ color: C.text, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, minHeight: multiline ? 84 : 46, textAlignVertical: multiline ? "top" : "center" }} />
    </View>
  );
  const saveDraft = async () => {
    if (!requiredReady) {
      show("Add a release title and genre. Use YYYY-MM-DD for the release date.");
      return;
    }
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      let existing: Draft[] = [];
      try { existing = raw ? JSON.parse(raw) : []; } catch { existing = []; }
      const draft: Draft = { title: title.trim(), releaseType, genre: genre.trim(), releaseDate: releaseDate.trim(), credits: credits.trim(), notes: notes.trim(), audioReady: audio, artworkReady: artwork, metadataChecked: metadata, rightsConfirmed: rights, updatedAt: new Date().toISOString() };
      const next = [draft, ...(Array.isArray(existing) ? existing.filter((x) => !(x.title === draft.title && x.releaseType === draft.releaseType)) : [])].slice(0, 20);
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      setDrafts(next);
      setSaved(true);
      show("Release plan saved on this device.");
    } catch {
      show("Could not save the release plan on this device. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} accessibilityRole="button" style={{ paddingVertical: 14, alignSelf: "flex-start" }}><Text style={{ color: C.accent, fontWeight: "700" }}>‹ Back to Artist Studio</Text></TouchableOpacity>
      <Text style={{ color: C.text, fontSize: 25, fontWeight: "800" }}>Release planner</Text>
      <Text style={{ color: C.text2, fontSize: 13, lineHeight: 19, marginTop: 6 }}>Prepare your release details and checklist. Drafts are stored on this device; saving here does not upload, distribute or publish music.</Text>
      <View style={{ marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, padding: 14 }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "800" }}>Release details</Text>
        {field("Release title *", title, setTitle, "Enter your single or project title")}
        <Text style={{ color: C.text, fontSize: 12, fontWeight: "700", marginTop: 15, marginBottom: 7 }}>Release type</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["Single", "EP", "Album"].map((type) => <TouchableOpacity key={type} onPress={() => { setReleaseType(type); setSaved(false); }} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: releaseType === type ? C.accent : C.border, backgroundColor: releaseType === type ? C.elevated : C.card }}><Text style={{ color: releaseType === type ? C.accent : C.text2, fontWeight: "700", fontSize: 12 }}>{type}</Text></TouchableOpacity>)}
        </View>
        {field("Genre *", genre, setGenre, "e.g. Afrobeats, Afro-drill")}
        {field("Planned release date", releaseDate, setReleaseDate, "YYYY-MM-DD")}
        {!dateValid ? <Text style={{ color: C.danger, fontSize: 11, marginTop: 5 }}>Enter the date in YYYY-MM-DD format.</Text> : null}
        {field("Credits & collaborators", credits, setCredits, "Producer, songwriter, featured artists…", true)}
        {field("Private planning notes", notes, setNotes, "Promotion ideas, tasks or reminders…", true)}
        <TouchableOpacity disabled={saving} onPress={() => void saveDraft()} accessibilityRole="button" style={{ marginTop: 18, borderRadius: 12, backgroundColor: C.accent, paddingVertical: 13, alignItems: "center", opacity: saving ? 0.6 : 1 }}>
          <Text style={{ color: "#0D0D10", fontWeight: "800" }}>{saving ? "Saving…" : saved ? "Draft saved ✓" : "Save release draft"}</Text>
        </TouchableOpacity>
      </View>
      {drafts.length > 0 ? <View style={{ marginTop: 22 }}>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 10 }}>Saved drafts on this device</Text>
        {drafts.map((draft, index) => <View key={`${draft.title}-${draft.releaseType}-${draft.updatedAt}-${index}`} style={{ padding: 13, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => loadDraft(draft)} accessibilityRole="button" style={{ paddingVertical: 2 }}>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>{draft.title}</Text>
            <Text style={{ color: C.text2, fontSize: 11, marginTop: 4 }}>{draft.releaseType} · {draft.genre}{draft.releaseDate ? ` · ${draft.releaseDate}` : ""}</Text>
            <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700", marginTop: 6 }}>Load draft</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void deleteDraft(draft)} accessibilityRole="button" accessibilityLabel={`Delete ${draft.title} release draft`} style={{ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 4, marginTop: 4 }}>
            <Text style={{ color: C.danger, fontSize: 12, fontWeight: "700" }}>Delete draft</Text>
          </TouchableOpacity>
        </View>)}
      </View> : null}
      <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", marginTop: 24, marginBottom: 10 }}>Release readiness</Text>
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, overflow: "hidden" }}>
        {checklist.map((item) => <TouchableOpacity key={item.label} onPress={() => { item.set(!item.value); setSaved(false); }} accessibilityRole="checkbox" accessibilityState={{ checked: item.value }} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ width: 23, height: 23, borderRadius: 7, borderWidth: 1, borderColor: item.value ? C.accent : C.border, backgroundColor: item.value ? C.accent : "transparent", alignItems: "center", justifyContent: "center", marginRight: 11 }}><Text style={{ color: "#0D0D10", fontWeight: "900" }}>{item.value ? "✓" : ""}</Text></View>
          <Text style={{ color: C.text, fontSize: 13, flex: 1 }}>{item.label}</Text>
        </TouchableOpacity>)}
      </View>
      <View style={{ marginTop: 14, padding: 13, borderRadius: 12, backgroundColor: C.elevated }}>
        <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18 }}>Artist: {artistName || "Artist account"}. Rights confirmation is a planning checklist only, not legal verification. Distribution, copyright checks, payment and publishing remain unavailable until the corresponding services are connected.</Text>
      </View>
    </ScrollView>
  );
}
