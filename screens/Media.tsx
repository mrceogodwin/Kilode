import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: W } = Dimensions.get("window");
const CAROUSEL_W = W - 32;

type Article = {
  id: string;
  title: string;
  kicker?: string;
  time?: string;
  author?: string;
  imageUrl?: string;
  tone?: string;
  body?: string;
};

type Props = {
  s: any;
  C: any;
  news: Article[];
  initialArticleId?: string | null;
  onBack: () => void;
  show: (m: string) => void;
};

const CATEGORIES = ["All", "News", "Culture", "Business", "Sports", "Tech"];

export function MediaScreen({ s, C, news, initialArticleId, onBack, show }: Props) {
  const data = news?.length ? news : [];
  const [active, setActive] = useState<Article | null>(null);
  const [slide, setSlide] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showMore, setShowMore] = useState(false);
  const carouselRef = useRef<ScrollView>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return data;
    const terms: Record<string, RegExp> = {
      News: /news|headline|politic|government|community|incident|report/i,
      Culture: /culture|fashion|art|film|music|afrobeats|creator|entertainment/i,
      Business: /business|market|money|finance|startup|company|econom|brand/i,
      Sports: /sport|football|basketball|athlete|match|league|team/i,
      Tech: /tech|technology|digital|app|software|ai|startup|device/i,
    };
    const matcher = terms[filter];
    return data.filter((a) => matcher?.test(`${a.kicker || ""} ${a.title || ""}`));
  }, [data, filter]);

  const hero = filtered.slice(0, 5);
  const listItems = filtered.slice(0, showMore ? 15 : 8);

  useEffect(() => {
    if (!initialArticleId) return;
    const match = data.find((a) => String(a.id) === String(initialArticleId));
    if (match) setActive(match);
  }, [initialArticleId, data]);

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setSlide(Math.round(x / (CAROUSEL_W + 12)));
  };

  // —— Article detail ——
  if (active) {
    const body =
      active.body ||
      `${active.title}\n\nFull editorial body loads when the Media API is live.\n\n— ${active.author || "Kilode Editorial"}`;
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setActive(null)} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14, marginTop: 4 }}>
          <Ionicons name="chevron-back" size={20} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Media</Text>
        </TouchableOpacity>
        <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700", letterSpacing: 0.6 }}>
          {(active.kicker || "MEDIA").toUpperCase()} · {active.time || "Today"}
        </Text>
        <Text style={{ color: C.text, fontSize: 25, fontWeight: "800", letterSpacing: -0.55, marginTop: 8, lineHeight: 31 }}>
          {active.title}
        </Text>
        <Text style={{ color: C.text3, fontSize: 12, marginTop: 8 }}>{active.author || "Kilode Editorial"}</Text>
        {active.imageUrl ? (
          <Image source={{ uri: active.imageUrl }} style={{ width: "100%", height: 210, borderRadius: 14, marginTop: 14, backgroundColor: C.elevated }} resizeMode="cover" />
        ) : (
          <View style={{ height: 160, borderRadius: 14, marginTop: 14, backgroundColor: active.tone || C.elevated }} />
        )}
        <Text style={{ color: C.text2, fontSize: 15, lineHeight: 24, marginTop: 16 }}>{body}</Text>

        <TouchableOpacity
          style={{ marginTop: 20, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: C.border }}
          onPress={async () => {
            try {
              const { Share } = await import("react-native");
              await Share.share({ message: active.title });
            } catch {
              show("Could not open share sheet");
            }
          }}
        >
          <Text style={{ color: C.text, fontWeight: "600" }}>Share story</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // —— Media landing ——
  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to Home" style={{ flexDirection: "row", alignItems: "center", gap: 3, minWidth: 72 }}>
          <Ionicons name="chevron-back" size={18} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.35, textAlign: "center", flex: 1 }}>Media</Text>
        <View style={{ width: 72 }} />
      </View>

      {/* Category navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setFilter(c)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: filter === c ? C.accentSoft : "transparent",
              borderWidth: 1,
              borderColor: filter === c ? C.accent : C.border,
            }}
          >
            <Text style={{ color: filter === c ? C.accent : C.text2, fontSize: 13, fontWeight: "700" }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Carousel */}
      {hero.length > 0 ? (
        <View style={{ marginBottom: 16 }}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled={false}
            decelerationRate="fast"
            snapToInterval={CAROUSEL_W + 12}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
          >
            {hero.map((a) => (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.9}
                onPress={() => setActive(a)}
                style={{
                  width: CAROUSEL_W,
                  height: 236,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: a.tone || C.elevated,
                }}
              >
                {a.imageUrl ? (
                  <Image source={{ uri: a.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <View style={{ flex: 1, backgroundColor: a.tone || C.elevated }} />
                )}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 16,
                    backgroundColor: "rgba(10,18,13,0.82)",
                  }}
                >
                  <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>
                    {(a.kicker || "FEATURED").toUpperCase()}
                  </Text>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 5, lineHeight: 25, letterSpacing: -0.45 }} numberOfLines={2}>
                    {a.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
            {hero.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === slide ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === slide ? C.accent : C.border,
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Latest stories */}
      <View style={{ paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "800" }}>Latest</Text>
        <TouchableOpacity onPress={() => setShowMore((v) => !v)}>
          <Text style={{ color: C.accent, fontSize: 13, fontWeight: "700" }}>{showMore ? "Less" : "More"}</Text>
        </TouchableOpacity>
      </View>

      {/* Editorial story feed — compact thumbnail rows */}
      <View style={{ paddingHorizontal: 16 }}>
        {listItems.map((a) => (
          <TouchableOpacity
            key={a.id}
            activeOpacity={0.82}
            onPress={() => setActive(a)}
            style={{ flexDirection: "row", gap: 12, marginBottom: 14, alignItems: "center" }}
          >
            {a.imageUrl ? (
              <Image
                source={{ uri: a.imageUrl }}
                style={{ width: 88, height: 72, borderRadius: 10, backgroundColor: C.elevated }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ width: 88, height: 72, borderRadius: 10, backgroundColor: a.tone || C.elevated }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }}>
                {(a.kicker || "MEDIA").toUpperCase()} · {a.time || ""}
              </Text>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "700", marginTop: 4, lineHeight: 21, letterSpacing: -0.2 }} numberOfLines={2}>
                {a.title}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.text3} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Single clearly labelled sponsored placement */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 18,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.border,
          backgroundColor: C.card,
          padding: 14,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
        }}
      >
        <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: C.accent }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text3, fontSize: 10, fontWeight: "700", letterSpacing: 0.6 }}>ADVERTISEMENT</Text>
          <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 4 }}>Grow your brand on Kilode</Text>
          <Text style={{ color: C.text2, fontSize: 12, marginTop: 2 }}>Portrait & feed placements · Push Link</Text>
        </View>
        <TouchableOpacity
          onPress={() => show("Ads desk opens from More → Ads when connected.")}
          style={{ backgroundColor: C.accentSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}
        >
          <Text style={{ color: C.accent, fontWeight: "800", fontSize: 12 }}>Advertise</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ color: C.text2, fontSize: 14 }}>No stories in this category yet.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
