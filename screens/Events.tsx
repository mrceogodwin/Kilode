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
};

type Props = {
  s: any;
  C: any;
  events: EventItem[];
  onBack: () => void;
  show: (m: string) => void;
};

const FILTERS = ["All", "Tonight", "Weekend", "Free", "Lagos", "Abuja"];

const FALLBACK: EventItem[] = [
  {
    id: "e1",
    title: "Freedom Park short film night",
    meta: "Fri 7pm · Lagos Island",
    tag: "Tonight",
    price: "Free",
    city: "Lagos",
    date: "Fri",
    organiser: "Kilode Cinema",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
  },
  {
    id: "e2",
    title: "Lagos Founders meetup",
    meta: "Sat · Civic Centre",
    price: "₦5,000",
    city: "Lagos",
    date: "Sat",
    organiser: "Founders NG",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
  {
    id: "e3",
    title: "Afrobeats rooftop session",
    meta: "Sun 5pm · VI",
    tag: "Weekend",
    price: "₦8,000",
    city: "Lagos",
    organiser: "Sound City Live",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-047fc749d9b0?w=600&q=80",
  },
  {
    id: "e4",
    title: "Abuja creators brunch",
    meta: "Sat 11am · Maitama",
    price: "₦3,500",
    city: "Abuja",
    organiser: "Capital Creatives",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80",
  },
];

export function EventsScreen({ s, C, events, onBack, show }: Props) {
  const base = events?.length ? events : FALLBACK;
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<EventItem | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    let rows = base.map((e) => ({
      ...e,
      city: e.city || (e.meta?.includes("Abuja") ? "Abuja" : "Lagos"),
      date: e.date || (e.tag === "Tonight" ? "Fri" : "Sat"),
    }));
    if (filter === "Tonight") rows = rows.filter((e) => e.tag === "Tonight" || /fri|tonight/i.test(e.meta));
    if (filter === "Weekend") rows = rows.filter((e) => /sat|sun|weekend/i.test(e.meta + (e.tag || "")));
    if (filter === "Free") rows = rows.filter((e) => /free/i.test(String(e.price || e.meta)));
    if (filter === "Lagos" || filter === "Abuja") rows = rows.filter((e) => e.city === filter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((e) => `${e.title} ${e.meta}`.toLowerCase().includes(needle));
    }
    return rows;
  }, [base, filter, q]);

  if (active) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setActive(null)} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 14, marginTop: 4 }}>
          <Ionicons name="chevron-back" size={20} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Events</Text>
        </TouchableOpacity>

        {active.imageUrl ? (
          <Image source={{ uri: active.imageUrl }} style={{ width: "100%", height: 200, borderRadius: 16, backgroundColor: C.elevated }} resizeMode="cover" />
        ) : (
          <View style={{ height: 160, borderRadius: 16, backgroundColor: C.elevated }} />
        )}

        {active.tag ? (
          <View style={{ alignSelf: "flex-start", marginTop: 14, backgroundColor: C.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>{active.tag}</Text>
          </View>
        ) : null}

        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.4, marginTop: 10, lineHeight: 28 }}>
          {active.title}
        </Text>
        <Text style={{ color: C.text2, fontSize: 14, marginTop: 8 }}>{active.meta}</Text>
        {active.organiser ? (
          <TouchableOpacity onPress={() => show(`Organiser profile for ${active.organiser} when profiles API is live.`)} style={{ marginTop: 12 }}>
            <Text style={{ color: C.accent, fontWeight: "700" }}>{active.organiser}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: C.accent,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: "center",
            }}
            onPress={() =>
              show(
                active.price && !/free/i.test(active.price)
                  ? `Ticket selection for ${active.price} needs payments — not charged.`
                  : "RSVP saved on device. Live booking when Events API is connected."
              )
            }
          >
            <Text style={{ color: "#111", fontWeight: "800", fontSize: 15 }}>
              {active.price && !/free/i.test(String(active.price)) ? `Tickets · ${active.price}` : "RSVP free"}
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
          Payments and live inventory require the Events backend. This screen never pretends a card was charged.
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
        <Text style={{ color: C.text, fontSize: 17, fontWeight: "800" }}>Events</Text>
        <TouchableOpacity onPress={() => show("Create event opens for organisers when Events API is live.")}>
          <Ionicons name="add-circle-outline" size={22} color={C.accent} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View
          style={{
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
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: filter === f ? C.accentSoft : "transparent",
              borderWidth: 1,
              borderColor: filter === f ? C.accent : C.border,
            }}
          >
            <Text style={{ color: filter === f ? C.accent : C.text2, fontSize: 13, fontWeight: "700" }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured */}
      {list[0] ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setActive(list[0])}
          style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 16, borderRadius: 16, overflow: "hidden", backgroundColor: C.elevated }}
        >
          {list[0].imageUrl ? (
            <Image source={{ uri: list[0].imageUrl }} style={{ width: "100%", height: 170 }} resizeMode="cover" />
          ) : (
            <View style={{ height: 140, backgroundColor: C.elevated }} />
          )}
          <View style={{ padding: 14 }}>
            <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }}>
              {(list[0].tag || "FEATURED").toUpperCase()}
            </Text>
            <Text style={{ color: C.text, fontSize: 17, fontWeight: "800", marginTop: 4 }} numberOfLines={2}>
              {list[0].title}
            </Text>
            <Text style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>{list[0].meta}</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", paddingHorizontal: 16, marginBottom: 10 }}>Up next</Text>

      {list.slice(1).map((e) => (
        <TouchableOpacity
          key={e.id}
          activeOpacity={0.85}
          onPress={() => setActive(e)}
          style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 14, alignItems: "center" }}
        >
          {e.imageUrl ? (
            <Image source={{ uri: e.imageUrl }} style={{ width: 88, height: 72, borderRadius: 12, backgroundColor: C.elevated }} resizeMode="cover" />
          ) : (
            <View style={{ width: 88, height: 72, borderRadius: 12, backgroundColor: C.elevated }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }} numberOfLines={2}>
              {e.title}
            </Text>
            <Text style={{ color: C.text2, fontSize: 12, marginTop: 3 }}>{e.meta}</Text>
            {e.price ? <Text style={{ color: C.accent, fontSize: 12, fontWeight: "700", marginTop: 3 }}>{e.price}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color={C.text3} />
        </TouchableOpacity>
      ))}

      {list.length === 0 ? (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ color: C.text2 }}>No events match this filter.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
