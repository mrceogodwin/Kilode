import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createPushCampaignDraft } from "../lib/pushLink";

type Props = { s: any; C: any; onBack: () => void; show: (message: string) => void };

const CATEGORIES = ["music", "creator", "video", "event", "media", "product", "job", "business", "profile", "other"] as const;

export function PushLinkScreen({ s, C, onBack, show }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("music");
  const [links, setLinks] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof createPushCampaignDraft>>(null);
  const rawLinks = useMemo(() => links.split(/\r?\n/).map((value) => value.trim()).filter(Boolean), [links]);

  const makeDraft = () => {
    const draft = createPushCampaignDraft(title, category, rawLinks);
    setPreview(draft);
    if (!draft) {
      show("Add a title and at least one valid HTTPS link.");
      return;
    }
    show("Draft preview created. It has not been published or submitted.");
  };

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} keyboardShouldPersistTaps="handled">
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 14 }} accessibilityRole="button">
          <Text style={s.link}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.h1}>Push Link</Text>
        <Text style={[s.sub, { marginTop: 6 }]}>One campaign. Your Kilode audience. Your official destinations.</Text>

        <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>Campaign name</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="e.g. We Want a Party — new release" placeholderTextColor={C.text3} maxLength={120} style={{ backgroundColor: C.input, borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 12, color: C.text, minHeight: 44 }} />

        <Text style={[s.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>What are you promoting?</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map((value) => {
            const selected = value === category;
            return <TouchableOpacity key={value} onPress={() => setCategory(value)} accessibilityRole="button" accessibilityState={{ selected }} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, borderWidth: 1, borderColor: selected ? C.accent : C.border, backgroundColor: selected ? C.elevated : "transparent" }}>
              <Text style={{ color: selected ? C.accent : C.text, textTransform: "capitalize", fontSize: 12 }}>{value}</Text>
            </TouchableOpacity>;
          })}
        </View>

        <Text style={[s.sectionTitle, { marginTop: 22, marginBottom: 8 }]}>Official destination links</Text>
        <Text style={[s.meta, { marginBottom: 8 }]}>Add one HTTPS link per line: Kilode release page, Spotify, Apple Music, Audiomack, YouTube, your website or another platform.</Text>
        <TextInput value={links} onChangeText={(value) => { setLinks(value); setPreview(null); }} placeholder={"https://open.spotify.com/...\nhttps://audiomack.com/..."} placeholderTextColor={C.text3} multiline autoCapitalize="none" autoCorrect={false} keyboardType="url" style={{ backgroundColor: C.input, borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 12, color: C.text, minHeight: 112, textAlignVertical: "top" }} />

        <TouchableOpacity onPress={makeDraft} style={[s.primaryBtn, { marginTop: 18 }]} accessibilityRole="button">
          <Text style={s.primaryBtnText}>Preview campaign draft</Text>
        </TouchableOpacity>

        {preview ? <View style={{ marginTop: 18, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <Text style={s.sectionTitle}>Draft preview · not published</Text>
          <Text style={[s.h1, { marginTop: 8 }]}>{preview.title}</Text>
          <Text style={[s.meta, { marginTop: 4 }]}>{preview.category} · {preview.destinations.length} unique destination{preview.destinations.length === 1 ? "" : "s"}</Text>
          {preview.destinations.map((destination) => <View key={destination.url} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.text, fontWeight: "600" }}>{destination.label}</Text>
            <Text style={[s.meta, { marginTop: 3 }]} numberOfLines={2}>{destination.url}</Text>
          </View>)}
          <Text style={[s.meta, { marginTop: 12 }]}>Publishing, paid reach and analytics will become available only after the campaign backend is connected.</Text>
        </View> : null}
      </View>
    </ScrollView>
  );
}
