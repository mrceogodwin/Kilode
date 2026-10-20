import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
  /** Preferred */
  articles?: MediaArticle[];
  /** Alias used by KilodeRoot */
  news?: MediaArticle[];
  onBack: () => void;
  show: (m: string) => void;
  initialArticleId?: string | null;
};

const W = Dimensions.get("window").width;
const CAROUSEL_W = W - 32;

const GRID = [
  { id: "politics", label: "Politics", icon: "business-outline" as const },
  { id: "tech", label: "Tech", icon: "hardware-chip-outline" as const },
  { id: "culture", label: "Culture", icon: "color-palette-outline" as const },
  { id: "sport", label: "Sport", icon: "football-outline" as const },
  { id: "business", label: "Business", icon: "briefcase-outline" as const },
  { id: "more", label: "More", icon: "grid-outline" as const },
];

const TICKER = [
  "Trending: Lagos rains · governance",
  "Oil spill probe · Akwa Ibom",
  "Afrobeats charts · weekend drops",
  "Kilode Media · top reads",
];

/** Full Media system: ticker → carousel → 3-col grid → list + ads */
export function MediaScreen({ s, C, articles, news, onBack, show, initialArticleId }: Props) {
  const data = articles?.length ? articles : news || [];
  const [active, setActive] = useState<MediaArticle | null>(null);
  const [slide, setSlide] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);

  const list = filter
    ? data.filter((a) => (a.kicker || "").toLowerCase().includes(filter.toLowerCase()))
    : data;

  const hero = list.slice(0, 4);
  const rest = list.slice(0, 12);

  useEffect(() => {
    if (!initialArticleId) return;
    const match = data.find((a) => String(a.id) === String(initialArticleId));
    if (match) setActive(match);
  }, [initialArticleId, data]);

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setSlide(Math.round(x / (CAROUSEL_W + 12)));
  };

  if (active) {
    const body =
      active.body ||
      `${active.title}\n\nFull story loads when the editorial API is live.\n\n— ${active.author || "Kilode Editorial"}`;
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={() => setActive(null)}
          style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14, marginTop: 4 }}
        >
          <Ionicons name="chevron-back" size={20} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Media</Text>
        </TouchableOpacity>
        <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700", letterSpacing: 0.6 }}>
          {(active.kicker || "MEDIA").toUpperCase()} · {active.time || "Today"}
        </Text>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.4, marginTop: 8, lineHeight: 28 }}>
          {active.title}
        </Text>
        <Text style={{ color: C.text3, fontSize: 12, marginTop: 8 }}>{active.author || "Kilode Editorial"}</Text>
        {active.imageUrl ? (
          <Image
            source={{ uri: active.imageUrl }}
            style={{ width: "100%", height: 200, borderRadius: 14, marginTop: 14, backgroundColor: C.elevated }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ height: 160, borderRadius: 14, marginTop: 14, backgroundColor: active.tone || C.elevated }} />
        )}
        <Text style={{ color: C.text2, fontSize: 15, lineHeight: 24, marginTop: 16 }}>{body}</Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            alignSelf: "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: C.border,
          }}
          onPress={async () => {
            try {
              await Share.share({ message: active.title });
            } catch {
              show("Could not share");
            }
          }}
        >
          <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }}>Share</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", marginLeft: 8, letterSpacing: -0.3 }}>Media</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => show("Search opens when catalogue API is live")}>
          <Ionicons name="search-outline" size={20} color={C.text2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 32, marginBottom: 10 }}
        contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center", gap: 16 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
          <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 }}>TRENDING</Text>
        </View>
        {TICKER.map((t) => (
          <Text key={t} style={{ color: C.text2, fontSize: 12 }} numberOfLines={1}>
            {t}
          </Text>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        decelerationRate="fast"
        snapToInterval={CAROUSEL_W + 12}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onCarouselScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {(hero.length ? hero : [{ id: "empty", title: "Stories load when Media is connected", kicker: "MEDIA" } as MediaArticle]).map(
          (n) => (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.9}
              onPress={() => (n.id !== "empty" ? setActive(n) : undefined)}
              style={{
                width: CAROUSEL_W,
                height: 180,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: n.tone || C.elevated,
              }}
            >
              {n.imageUrl ? (
                <Image source={{ uri: n.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : null}
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: 14,
                  backgroundColor: "rgba(0,0,0,0.55)",
                }}
              >
                <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }}>
                  {(n.kicker || "MEDIA").toUpperCase()}
                </Text>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 4 }} numberOfLines={2}>
                  {n.title}
                </Text>
              </View>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10, marginBottom: 14 }}>
        {Array.from({ length: Math.max(hero.length, 1) }).map((_, i) => (
          <View
            key={i}
            style={{
              width: i === slide ? 14 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === slide ? C.accent : C.border,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, marginBottom: 8 }}>
        {GRID.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => {
              if (g.id === "more") {
                show("More sections when editorial catalogue expands");
                return;
              }
              setFilter(filter === g.label ? null : g.label);
            }}
            style={{ width: "33.33%", paddingHorizontal: 4, paddingVertical: 6, alignItems: "center" }}
          >
            <View
              style={{
                width: "100%",
                aspectRatio: 1.15,
                maxWidth: 104,
                borderRadius: 14,
                backgroundColor: filter === g.label ? C.accentSoft : C.card,
                borderWidth: 1,
                borderColor: filter === g.label ? C.accent : C.border,
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Ionicons name={g.icon} size={22} color={filter === g.label ? C.accent : C.text2} />
              <Text style={{ color: filter === g.label ? C.accent : C.text, fontSize: 12, fontWeight: "700" }}>
                {g.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
        <View
          style={{
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: C.elevated,
            borderWidth: 1,
            borderColor: C.border,
            flexDirection: "row",
            minHeight: 110,
          }}
        >
          <View style={{ width: 92, backgroundColor: "#2A2419", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="megaphone-outline" size={28} color={C.accent} />
          </View>
          <View style={{ flex: 1, padding: 12, justifyContent: "center" }}>
            <Text style={{ color: C.text3, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>SPONSORED</Text>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 4 }} numberOfLines={2}>
              Promote on Kilode Media
            </Text>
            <Text style={{ color: C.text2, fontSize: 12, marginTop: 4 }} numberOfLines={1}>
              Reach readers · Push Link
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", paddingHorizontal: 16, marginBottom: 10 }}>
        Latest
      </Text>
      {rest.map((n, idx) => (
        <React.Fragment key={n.id}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActive(n)}
            style={{
              flexDirection: "row",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            {n.imageUrl ? (
              <Image
                source={{ uri: n.imageUrl }}
                style={{ width: 76, height: 64, borderRadius: 10, backgroundColor: C.elevated }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ width: 76, height: 64, borderRadius: 10, backgroundColor: n.tone || C.elevated }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "700" }} numberOfLines={1}>
                {(n.kicker || "MEDIA").toUpperCase()} · {n.time || ""}
              </Text>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 3, lineHeight: 19 }} numberOfLines={2}>
                {n.title}
              </Text>
            </View>
          </TouchableOpacity>
          {idx === 3 ? (
            <View
              style={{
                marginHorizontal: 16,
                marginVertical: 10,
                height: 72,
                borderRadius: 12,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: C.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="stats-chart-outline" size={20} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text3, fontSize: 10, fontWeight: "700" }}>AD</Text>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
                  Brand story · Kilode Ads
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </View>
          ) : null}
        </React.Fragment>
      ))}

      {rest.length === 0 ? (
        <Text style={{ color: C.text3, textAlign: "center", marginTop: 24, paddingHorizontal: 24 }}>
          No stories in this section yet
        </Text>
      ) : null}
    </ScrollView>
  );
}
