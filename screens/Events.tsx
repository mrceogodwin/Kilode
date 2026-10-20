import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type EventItem = {
  id: string;
  title: string;
  meta: string;
  price?: string;
  tag?: string;
  city?: string;
  date?: string;
  imageUrl?: string;
  organiser?: string;
  category?: string;
};

type Props = {
  s: any;
  C: any;
  events: EventItem[];
  onBack: () => void;
  show: (m: string) => void;
};

const FILTERS = ["All", "Concerts", "Parties", "Seminars"];

const FALLBACK: EventItem[] = [
  {
    id: "e1",
    title: "Lagos Music Festival 2025",
    meta: "Sat, 24 May 2025 · Eko Convention Centre",
    tag: "Music",
    category: "Concerts",
    price: "From ₦15,000",
    city: "Lagos",
    organiser: "Lagos Live",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-047fc749d9b0?w=800&q=80",
  },
  {
    id: "e2",
    title: "Tech & Innovation Summit",
    meta: "Tue, 27 May 2025 · Landmark Event Centre",
    tag: "Tech",
    category: "Seminars",
    price: "Register",
    city: "Lagos",
    organiser: "Build NG",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    id: "e3",
    title: "Comedy Night Lagos",
    meta: "Sat, 31 May 2025 · Terra Kulture",
    tag: "Comedy",
    category: "Parties",
    price: "From ₦8,000",
    city: "Lagos",
    organiser: "Laugh Lagos",
    imageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80",
  },
  {
    id: "e4",
    title: "Afrobeats rooftop session",
    meta: "Sun 5pm · VI",
    tag: "Music",
    category: "Concerts",
    price: "₦8,000",
    city: "Lagos",
    organiser: "Sound City Live",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
];

const TAG_COLOR: Record<string, string> = {
  Music: "#3B82F6",
  Tech: "#2563EB",
  Comedy: "#B45309",
  Tonight: "#E5C158",
};

export function EventsScreen({ s, C, events, onBack, show }: Props) {
  const base = events?.length
    ? events.map((e) => ({
        ...e,
        category: e.category || (e.tag === "Tonight" ? "Parties" : "Concerts"),
        imageUrl: e.imageUrl || FALLBACK[0].imageUrl,
      }))
    : FALLBACK;

  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<EventItem | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    let rows = base;
    if (filter !== "All") rows = rows.filter((e) => e.category === filter || e.tag === filter);
    if (q.trim()) {
      const n = q.toLowerCase();
      rows = rows.filter((e) => `${e.title} ${e.meta}`.toLowerCase().includes(n));
    }
    return rows;
  }, [base, filter, q]);

  if (active) {
    const isFree = /free|register/i.test(String(active.price || ""));
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setActive(null)} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14, marginTop: 4 }}>
          <Ionicons name="chevron-back" size={20} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Events</Text>
        </TouchableOpacity>

        {active.imageUrl ? (
          <Image source={{ uri: active.imageUrl }} style={{ width: "100%", height: 210, borderRadius: 16, backgroundColor: C.elevated }} resizeMode="cover" />
        ) : (
          <View style={{ height: 180, borderRadius: 16, backgroundColor: C.elevated }} />
        )}

        {active.tag ? (
          <View
            style={{
              alignSelf: "flex-start",
              marginTop: 14,
              backgroundColor: TAG_COLOR[active.tag] || C.accentSoft,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{active.tag}</Text>
          </View>
        ) : null}

        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.4, marginTop: 10, lineHeight: 28 }}>
          {active.title}
        </Text>
        <Text style={{ color: C.text2, fontSize: 14, marginTop: 8 }}>{active.meta}</Text>
        {active.organiser ? (
          <Text style={{ color: C.accent, fontWeight: "700", marginTop: 10 }}>{active.organiser}</Text>
        ) : null}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 15, alignItems: "center" }}
            onPress={() =>
              show(
                isFree
                  ? "RSVP saved on this device. Live booking when Events API is connected."
                  : `Ticket flow for ${active.price} — nothing charged until payments are live.`
              )
            }
          >
            <Text style={{ color: "#111", fontWeight: "800", fontSize: 15 }}>
              {isFree ? "Register" : "Get Tickets"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSaved((p) => ({ ...p, [active.id]: !p[active.id] }));
              show(saved[active.id] ? "Removed from saved" : "Saved on this device");
            }}
            style={{
              width: 52,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: C.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={saved[active.id] ? "bookmark" : "bookmark-outline"} size={22} color={C.accent} />
          </TouchableOpacity>
        </View>

        <Text style={{ color: C.text3, fontSize: 12, marginTop: 18, lineHeight: 18 }}>
          Payments and live inventory need the Events backend. This screen never pretends a card was charged.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Events</Text>
        <TouchableOpacity onPress={() => show("Search events when index is live.")}>
          <Ionicons name="search" size={20} color={C.text2} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: filter === f ? C.accent : "transparent",
              borderWidth: 1,
              borderColor: filter === f ? C.accent : C.border,
            }}
          >
            <Text style={{ color: filter === f ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.elevated,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.border,
          paddingHorizontal: 12,
          height: 42,
        }}
      >
        <Ionicons name="search" size={18} color={C.text3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search events"
          placeholderTextColor={C.text3}
          style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 15 }}
        />
      </View>

      {list.map((e) => {
        const isFree = /free|register/i.test(String(e.price || ""));
        const tagColor = TAG_COLOR[e.tag || ""] || "#3B82F6";
        return (
          <TouchableOpacity
            key={e.id}
            activeOpacity={0.9}
            onPress={() => setActive(e)}
            style={{
              marginHorizontal: 16,
              marginTop: 14,
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View style={{ height: 140, position: "relative" }}>
              {e.imageUrl ? (
                <Image source={{ uri: e.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <View style={{ flex: 1, backgroundColor: C.elevated }} />
              )}
              <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />
              {e.tag ? (
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    backgroundColor: tagColor,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{e.tag}</Text>
                </View>
              ) : null}
              <View style={{ position: "absolute", left: 14, right: 14, bottom: 14 }}>
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }} numberOfLines={2}>
                  {e.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                  {e.meta}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12 }}>
              <TouchableOpacity
                onPress={() => setActive(e)}
                style={{
                  backgroundColor: C.accent,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: "#111", fontWeight: "800", fontSize: 13 }}>
                  {isFree ? "Register" : "Get Tickets"}
                </Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={18} color={C.text3} />
            </View>
          </TouchableOpacity>
        );
      })}

      {list.length === 0 ? (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ color: C.text2 }}>No events match this filter.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
