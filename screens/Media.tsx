import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
  Image,
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
  imageUrl?: string;
};

type Props = {
  s: any;
  C: Palette;
  articles: MediaArticle[];
  onBack: () => void;
  show: (m: string) => void;
  initialArticleId?: string | null;
};

/** Dedicated Media experience — article list + reader (seed body until CMS API). */
export function MediaScreen({ s, C, articles, onBack, show, initialArticleId }: Props) {
  const [active, setActive] = useState<MediaArticle | null>(null);
  const [category, setCategory] = useState("For you");
  const categories = ["For you", "Politics", "Tech", "Culture", "Sport"];
  const visibleArticles = category === "For you"
    ? articles
    : articles.filter((article) => (article.kicker || "").toLowerCase().includes(category.toLowerCase()));

  useEffect(() => {
    if (!initialArticleId) return;
    const match = articles.find((article) => String(article.id) === String(initialArticleId));
    if (match) setActive(match);
  }, [initialArticleId]);

  if (active) {
    const body =
      active.body ||
      `${active.title}\n\nThis is a Kilode Media reading surface. Full editorial body will load from the CMS when the mobile API is live. Until then, this screen is fully navigable with seed content so App Review never hits a dead end.\n\n— ${active.author || "Kilode Editorial"}`;

    return (
      <ScrollView style={s.flex} contentContainerStyle={[s.scrollPad, { paddingHorizontal: 16 }]}>
        <TouchableOpacity
          activeOpacity={0.72}
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
        {active.imageUrl ? (
          <Image source={{ uri: active.imageUrl }} style={{ height: 190, borderRadius: 16, backgroundColor: active.tone || C.elevated, marginBottom: 16 }} resizeMode="cover" />
        ) : (
          <View style={{ height: 160, borderRadius: 16, backgroundColor: active.tone || C.elevated, marginBottom: 16 }} />
        )}
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
        <TouchableOpacity activeOpacity={0.72} onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={s.link}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={s.h1}>Media</Text>
        <Text style={s.sub}>Stories worth your time.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
        {categories.map((item) => (
          <TouchableOpacity key={item} activeOpacity={0.72} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[s.chip, category === item && s.chipOn]}>
            <Text style={[s.chipText, category === item && s.chipTextOn]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {visibleArticles.map((n) => (
        <TouchableOpacity key={n.id} activeOpacity={0.78} style={s.newsCard} onPress={() => setActive(n)} accessibilityRole="button">
          {n.imageUrl ? <Image source={{ uri: n.imageUrl }} style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} resizeMode="cover" /> : <View style={[s.newsThumb, { backgroundColor: n.tone || C.elevated }]} />}
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
      {visibleArticles.length === 0 ? (
        <View style={[s.center, { padding: 40 }]}>
          <Text style={s.sub}>{category === "For you" ? "No stories yet" : `No ${category.toLowerCase()} stories yet`}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
