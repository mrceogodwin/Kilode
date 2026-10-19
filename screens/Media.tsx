import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Palette } from "../themeStyles";

export type MediaArticle = {
  id: string;
  title: string;
  kicker?: string;
  time?: string;
  tone?: string;
  body?: string;
  author?: string;
};

type Props = {
  s: any;
  C: Palette;
  articles: MediaArticle[];
  onBack: () => void;
  show: (m: string) => void;
};

/** Dedicated Media experience — article list + reader (seed body until CMS API). */
export function MediaScreen({ s, C, articles, onBack, show }: Props) {
  const [active, setActive] = useState<MediaArticle | null>(null);

  if (active) {
    const body =
      active.body ||
      `${active.title}\n\nThis is a Kilode Media reading surface. Full editorial body will load from the CMS when the mobile API is live. Until then, this screen is fully navigable with seed content so App Review never hits a dead end.\n\n— ${active.author || "Kilode Editorial"}`;

    return (
      <ScrollView style={s.flex} contentContainerStyle={[s.scrollPad, { paddingHorizontal: 16 }]}>
        <TouchableOpacity
          onPress={() => setActive(null)}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={C.accent} />
          <Text style={s.link}>All stories</Text>
        </TouchableOpacity>
        <Text style={[s.meta, { color: C.accent, fontWeight: "700", marginBottom: 6 }]}>
          {(active.kicker || "Media").toUpperCase()} · {active.time || "Today"}
        </Text>
        <Text style={[s.h1, { marginBottom: 8 }]}>{active.title}</Text>
        <Text style={[s.sub, { marginBottom: 16 }]}>{active.author || "Kilode Editorial"}</Text>
        <View
          style={{
            height: 160,
            borderRadius: 16,
            backgroundColor: active.tone || C.elevated,
            marginBottom: 16,
          }}
        />
        <Text style={{ fontSize: 16, lineHeight: 26, color: C.text }}>{body}</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <TouchableOpacity
            style={[s.primaryBtn, { flex: 1 }]}
            onPress={async () => {
              try {
                await Share.share({
                  message: `${active.title} — via Kilode`,
                  title: active.title,
                });
              } catch {
                show("Share unavailable");
              }
            }}
          >
            <Text style={s.primaryBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.ghostBtn, { flex: 1, alignItems: "center" }]} onPress={onBack}>
            <Text style={s.ghostBtnText}>Home</Text>
          </TouchableOpacity>
        </View>
        <Text style={[s.meta, { marginTop: 16 }]}>Seed article · not live CMS</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={s.link}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={s.h1}>Media</Text>
        <Text style={s.sub}>News & stories · seed until CMS API</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {["For you", "Politics", "Tech", "Culture", "Sport"].map((c, i) => (
          <View key={c} style={[s.chip, i === 0 && s.chipOn]}>
            <Text style={[s.chipText, i === 0 && s.chipTextOn]}>{c}</Text>
          </View>
        ))}
      </ScrollView>
      {articles.map((n) => (
        <TouchableOpacity key={n.id} style={s.newsCard} onPress={() => setActive(n)} accessibilityRole="button">
          <View style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} />
          <View style={s.flex}>
            <Text style={s.newsKicker}>
              {n.kicker} · {n.time}
            </Text>
            <Text style={s.newsTitle} numberOfLines={3}>
              {n.title}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.text3} />
        </TouchableOpacity>
      ))}
      {articles.length === 0 ? (
        <View style={[s.center, { padding: 40 }]}>
          <Text style={s.sub}>No stories yet</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
