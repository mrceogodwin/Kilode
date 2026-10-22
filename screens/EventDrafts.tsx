import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  listEventDrafts,
  createEventDraft,
  updateEventDraft,
  deleteEventDraft,
  type EventDraft,
} from "../lib/eventDrafts";
import { EmptyState } from "../components/ui/EmptyState";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  initialCompose?: boolean;
};

export function EventDraftsScreen({ s, C, onBack, show, initialCompose }: Props) {
  const [drafts, setDrafts] = useState<EventDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(!!initialCompose);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [whenText, setWhenText] = useState("");
  const [priceText, setPriceText] = useState("Free");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await listEventDrafts();
    setDrafts(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (initialCompose) {
      setComposing(true);
      setEditingId(null);
      setTitle("");
      setVenue("");
      setCity("");
      setWhenText("");
      setPriceText("Free");
      setNotes("");
    }
  }, [initialCompose]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setVenue("");
    setCity("");
    setWhenText("");
    setPriceText("Free");
    setNotes("");
  };

  const openNew = () => {
    resetForm();
    setComposing(true);
  };

  const openEdit = (d: EventDraft) => {
    setEditingId(d.id);
    setTitle(d.title);
    setVenue(d.venue || "");
    setCity(d.city || "");
    setWhenText(d.whenText || "");
    setPriceText(d.priceText || "Free");
    setNotes(d.notes || "");
    setComposing(true);
  };

  const onSave = async () => {
    setSaving(true);
    if (editingId) {
      const result = await updateEventDraft(editingId, {
        title,
        venue,
        city,
        whenText,
        priceText,
        notes,
      });
      setSaving(false);
      if (!result.ok) {
        show(result.message);
        return;
      }
      show("Event draft updated on this device");
    } else {
      const result = await createEventDraft({
        title,
        venue,
        city,
        whenText,
        priceText,
        notes,
      });
      setSaving(false);
      if (!result.ok) {
        show(result.message);
        return;
      }
      show("Event draft saved on this device");
    }
    resetForm();
    setComposing(false);
    await refresh();
  };

  const onDelete = async (id: string) => {
    await deleteEventDraft(id);
    show("Draft removed");
    if (editingId === id) {
      resetForm();
      setComposing(false);
    }
    await refresh();
  };

  const field = (label: string, value: string, onChange: (t: string) => void, placeholder: string, multiline = false) => (
    <>
      <Text style={[s.meta, { marginTop: 16, marginBottom: 6, fontWeight: "700" }]}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: C.input,
          borderRadius: 14,
          padding: 14,
          color: C.text,
          borderWidth: 1,
          borderColor: C.border,
          fontSize: 16,
          minHeight: multiline ? 88 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
        placeholder={placeholder}
        placeholderTextColor={C.text3}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
      />
    </>
  );

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
          <Text style={s.h1}>{editingId ? "Edit event draft" : "New event draft"}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>
            Local only. Not discoverable, ticketed, or published until the events API is connected.
          </Text>

          {field("Title", title, setTitle, "e.g. Lagos Founders meetup")}
          {field("Venue", venue, setVenue, "e.g. Freedom Park")}
          {field("City", city, setCity, "e.g. Lagos")}
          {field("When", whenText, setWhenText, "e.g. Sat 7pm · 25 Oct")}
          {field("Price", priceText, setPriceText, "Free or ₦5,000")}
          {field("Notes (optional)", notes, setNotes, "What to bring, RSVP details…", true)}

          <View
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 12,
              backgroundColor: C.accent + "18",
              borderWidth: 1,
              borderColor: C.accent + "40",
            }}
          >
            <Text style={[s.meta, { color: C.accent, lineHeight: 18 }]}>
              This draft stays on this device. Other users cannot see it. Live RSVP, tickets, and discovery require the dedicated backend.
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { marginTop: 22, opacity: saving ? 0.6 : 1 }]}
            disabled={saving}
            onPress={onSave}
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
            Publish and RSVP are not available in this build.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }} accessibilityRole="button">
          <Text style={s.link}>‹ Back</Text>
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
            <Ionicons name="calendar-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h1}>Events</Text>
            <Text style={s.sub}>Local drafts · not published</Text>
          </View>
        </View>
      </View>

      <View style={[s.padH, { marginTop: 8 }]}>
        <TouchableOpacity style={s.primaryBtn} onPress={openNew}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={[s.primaryBtnText, { marginLeft: 8 }]}>New event draft</Text>
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
          Draft events are stored on this device only. Seed listings on the Events desk are sample data. Live hosting and RSVP need the dedicated API.
        </Text>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Your drafts ({drafts.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />
      ) : drafts.length === 0 ? (
        <EmptyState
          title="No event drafts yet"
          body="Create a draft with title, venue, city, and when. It stays private on this device."
          textColor={C.text}
          mutedColor={C.text2}
          accentColor={C.accent}
          icon="calendar-outline"
        />
      ) : (
        drafts.map((d) => (
          <TouchableOpacity key={d.id} style={[s.roomRow, { alignItems: "flex-start" }]} onPress={() => openEdit(d)}>
            <View style={[s.roomAv, { backgroundColor: C.accent }]}>
              <Ionicons name="calendar" size={16} color="#fff" />
            </View>
            <View style={[s.flex, { marginLeft: 12 }]}>
              <Text style={s.roomName}>{d.title}</Text>
              <Text style={s.meta}>
                {[d.whenText, d.venue, d.city].filter(Boolean).join(" · ") || "Details TBD"}
              </Text>
              <Text style={[s.meta, { marginTop: 4 }]}>
                {d.priceText || "Free"} · Local draft · {new Date(d.updatedAt).toLocaleDateString()}
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
