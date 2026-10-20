import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: W } = Dimensions.get("window");
const GAP = 12;
const CARD = (W - 32 - GAP) / 2;

type Product = {
  id: string;
  title: string;
  price: string;
  rating?: number;
  imageUrl?: string;
  category?: string;
};

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
};

const CATS = ["All", "Fashion", "Electronics", "Home", "Beauty"];

const PRODUCTS: Product[] = [
  { id: "p1", title: "Nike Air Force 1", price: "₦85,000", rating: 4.8, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { id: "p2", title: "iPhone 15 Pro", price: "₦1,250,000", rating: 4.9, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80" },
  { id: "p3", title: "Samsung Galaxy Buds", price: "₦120,000", rating: 4.7, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80" },
  { id: "p4", title: "Men's Hoodie", price: "₦45,000", rating: 4.6, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80" },
  { id: "p5", title: "Vintage Ankara set", price: "₦18,000", rating: 4.5, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80" },
  { id: "p6", title: "Ceramic planter", price: "₦12,500", rating: 4.4, category: "Home", imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80" },
];

export function MarketScreen({ s, C, onBack, show }: Props) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<Product | null>(null);

  const list = useMemo(() => {
    let rows = PRODUCTS;
    if (cat !== "All") rows = rows.filter((p) => p.category === cat);
    if (q.trim()) rows = rows.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    return rows;
  }, [cat, q]);

  if (active) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => setActive(null)} style={{ marginBottom: 12 }}>
          <Text style={{ color: C.accent, fontWeight: "600" }}>‹ Market</Text>
        </TouchableOpacity>
        {active.imageUrl ? (
          <Image source={{ uri: active.imageUrl }} style={{ width: "100%", height: 280, borderRadius: 16, backgroundColor: "#fff" }} resizeMode="cover" />
        ) : null}
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", marginTop: 14 }}>{active.title}</Text>
        <Text style={{ color: C.accent, fontSize: 20, fontWeight: "800", marginTop: 8 }}>{active.price}</Text>
        {active.rating ? (
          <Text style={{ color: C.text2, marginTop: 6 }}>★ {active.rating}</Text>
        ) : null}
        <TouchableOpacity
          style={{ marginTop: 20, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 16, alignItems: "center" }}
          onPress={() => show("Checkout connects when Market payments are live. Nothing was charged.")}
        >
          <Text style={{ color: "#111", fontWeight: "800", fontSize: 16 }}>Add to cart</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: C.accent, fontWeight: "600" }}>‹ Home</Text></TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Market</Text>
        <Ionicons name="search" size={20} color={C.text2} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {CATS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCat(c)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: cat === c ? C.accent : "transparent",
              borderWidth: 1,
              borderColor: cat === c ? C.accent : C.border,
            }}
          >
            <Text style={{ color: cat === c ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: C.elevated, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 44 }}>
        <Ionicons name="search" size={18} color={C.text3} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search products..." placeholderTextColor={C.text3} style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 15 }} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginTop: 16, gap: GAP }}>
        {list.map((p) => (
          <TouchableOpacity
            key={p.id}
            activeOpacity={0.88}
            onPress={() => setActive(p)}
            style={{
              width: CARD,
              backgroundColor: isLightCard(C) ? "#fff" : C.card,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: C.border,
              marginBottom: 4,
            }}
          >
            <View style={{ position: "relative" }}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={{ width: CARD, height: CARD * 0.95, backgroundColor: "#f5f5f5" }} resizeMode="cover" />
              ) : (
                <View style={{ width: CARD, height: CARD * 0.95, backgroundColor: C.elevated }} />
              )}
              <TouchableOpacity
                onPress={() => setSaved((s) => ({ ...s, [p.id]: !s[p.id] }))}
                style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name={saved[p.id] ? "heart" : "heart-outline"} size={16} color={saved[p.id] ? "#ff5a5a" : "#fff"} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 10 }}>
              <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{p.title}</Text>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginTop: 4 }}>{p.price}</Text>
              {p.rating ? (
                <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700", marginTop: 4 }}>★ {p.rating}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function isLightCard(C: any) {
  // Prefer white product cards like the mock when on dark chrome
  return true;
}
