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
      `${active.title}\n\nFull story coming soon.\n\n— ${active.author || "Kilode Editorial"}`;

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
      {visibleArticles[0] ? (
        <View style={{ marginTop: 4, marginBottom: 20 }}>
          <TouchableOpacity key={visibleArticles[0].id} activeOpacity={0.9} onPress={() => setActive(visibleArticles[0])} accessibilityRole="button" style={{ marginHorizontal: 16, overflow: "hidden", borderRadius: 18, backgroundColor: C.card }}>
            {visibleArticles[0].imageUrl ? <Image source={{ uri: visibleArticles[0].imageUrl }} style={{ width: "100%", height: 164, backgroundColor: visibleArticles[0].tone || C.elevated }} resizeMode="cover" /> : <View style={{ height: 164, backgroundColor: visibleArticles[0].tone || C.elevated }} />}
            <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.9 }}>{(visibleArticles[0].kicker || "MEDIA").toUpperCase()} · {visibleArticles[0].time || "LATEST"}</Text>
              <Text style={{ color: C.text, fontSize: 17, lineHeight: 22, fontWeight: "700", letterSpacing: -0.3, marginTop: 6 }}>{visibleArticles[0].title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 11 }}>
                <Text style={{ color: C.text2, fontSize: 11 }}>Kilode Media</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="arrow-forward" size={18} color={C.accent} />
              </View>
            </View>
          </TouchableOpacity>
          {visibleArticles.slice(1).map((n) => (
            <TouchableOpacity key={n.id} activeOpacity={0.78} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginTop: 14 }} onPress={() => setActive(n)} accessibilityRole="button">
              {n.imageUrl ? <Image source={{ uri: n.imageUrl }} style={{ width: 92, height: 78, borderRadius: 10, backgroundColor: n.tone || C.elevated }} resizeMode="cover" /> : <View style={{ width: 92, height: 78, borderRadius: 10, backgroundColor: n.tone || C.elevated }} />}
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }}>{(n.kicker || "MEDIA").toUpperCase()} · {n.time || ""}</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 19, fontWeight: "700", marginTop: 5 }} numberOfLines={3}>{n.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {visibleArticles.length === 0 ? (
        <View style={[s.center, { padding: 40 }]}>
          <Text style={s.sub}>{category === "For you" ? "No stories yet" : `No ${category.toLowerCase()} stories yet`}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
