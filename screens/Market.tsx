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
import { can } from "../lib/permissions";

const { width: W } = Dimensions.get("window");
const GAP = 12;
const PAD = 16;
const COL = (W - PAD * 2 - GAP) / 2;

type Product = {
  id: string;
  title: string;
  price: string;
  rating?: number;
  category: string;
  imageUrl?: string;
};

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
  accountKind?: string;
};

const CATS = ["All", "Electronics", "Fashion", "Home", "Beauty"];

const PRODUCTS: Product[] = [
  { id: "p1", title: "Nike Air Force 1", price: "₦85,000", rating: 4.8, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
  { id: "p2", title: "iPhone 15 Pro", price: "₦1,250,000", rating: 4.9, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80" },
  { id: "p3", title: "Galaxy Buds", price: "₦120,000", rating: 4.7, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80" },
  { id: "p4", title: "Men's Hoodie", price: "₦45,000", rating: 4.6, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80" },
  { id: "p5", title: "Vintage Ankara set", price: "₦18,000", rating: 4.5, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80" },
  { id: "p6", title: "Ceramic planter", price: "₦12,500", rating: 4.4, category: "Home", imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80" },
  { id: "p7", title: "Skincare kit", price: "₦22,000", rating: 4.6, category: "Beauty", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80" },
  { id: "p8", title: "Wireless charger", price: "₦18,500", rating: 4.3, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1591290619762-c588f7cba272?w=500&q=80" },
];

export function MarketScreen({ s, C, onBack, show, accountKind }: Props) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<Product | null>(null);
  const canSell = can(accountKind, "market_sell");

  const list = useMemo(() => {
    let rows = PRODUCTS;
    if (cat !== "All") rows = rows.filter((p) => p.category === cat);
    if (q.trim()) rows = rows.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    return rows;
  }, [cat, q]);

  if (active) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setActive(null)} style={{ marginBottom: 12 }}>
          <Text style={{ color: C.accent, fontWeight: "600" }}>‹ Market</Text>
        </TouchableOpacity>
        {active.imageUrl ? (
          <Image source={{ uri: active.imageUrl }} style={{ width: "100%", height: 300, borderRadius: 18, backgroundColor: C.elevated }} resizeMode="cover" />
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ color: C.text3, fontSize: 12, fontWeight: "700", letterSpacing: 0.4 }}>{active.category.toUpperCase()}</Text>
          <TouchableOpacity
            onPress={() => {
              setSaved((p) => ({ ...p, [active.id]: !p[active.id] }));
              show(saved[active.id] ? "Removed from saved" : "Saved on this device");
            }}
          >
            <Ionicons name={saved[active.id] ? "heart" : "heart-outline"} size={24} color={C.accent} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", marginTop: 6 }}>{active.title}</Text>
        <Text style={{ color: C.accent, fontSize: 22, fontWeight: "800", marginTop: 8 }}>{active.price}</Text>
        {active.rating ? (
          <Text style={{ color: C.text2, marginTop: 6, fontWeight: "600" }}>★ {active.rating} · Seller on Kilode Market</Text>
        ) : null}
        <TouchableOpacity
          style={{ marginTop: 22, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 16, alignItems: "center" }}
          onPress={() => show("Checkout connects when Market payments are live. Nothing was charged.")}
        >
          <Text style={{ color: "#111", fontWeight: "800", fontSize: 16 }}>Add to cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10, borderRadius: 999, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: C.border }}
          onPress={() => show("Message seller when chat is connected.")}
        >
          <Text style={{ color: C.text, fontWeight: "700", fontSize: 15 }}>Message seller</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Market</Text>
        <TouchableOpacity onPress={() => show("Cart opens when payments are live.")}>
          <Ionicons name="bag-handle-outline" size={22} color={C.text2} />
        </TouchableOpacity>
      </View>

      {canSell ? (
        <TouchableOpacity
          onPress={() => show("List product when Market API is live.")}
          style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={{ color: "#111", fontWeight: "800", fontSize: 14 }}>Sell on Kilode</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ marginHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: C.elevated, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 42 }}>
        <Ionicons name="search" size={18} color={C.text3} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search Market" placeholderTextColor={C.text3} style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 15 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 8 }}>
        {CATS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCat(c)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: cat === c ? C.accent : "transparent", borderWidth: 1, borderColor: cat === c ? C.accent : C.border }}
          >
            <Text style={{ color: cat === c ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: PAD, paddingTop: 14, gap: GAP }}>
        {list.map((p) => (
          <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => setActive(p)} style={{ width: COL }}>
            <View style={{ borderRadius: 14, overflow: "hidden", backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={{ width: "100%", height: COL * 0.95, backgroundColor: C.elevated }} resizeMode="cover" />
              ) : (
                <View style={{ width: "100%", height: COL * 0.95, backgroundColor: C.elevated }} />
              )}
              <View style={{ padding: 10 }}>
                <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }} numberOfLines={2}>{p.title}</Text>
                <Text style={{ color: C.accent, fontWeight: "800", fontSize: 14, marginTop: 4 }}>{p.price}</Text>
                {p.rating ? <Text style={{ color: C.text3, fontSize: 11, marginTop: 3 }}>★ {p.rating}</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {list.length === 0 ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ color: C.text2 }}>No products in this category.</Text>
        </View>
      ) : null}

      <Text style={{ color: C.text3, fontSize: 11, textAlign: "center", marginTop: 20, paddingHorizontal: 24 }}>
        Checkout is not live yet. Browse only — nothing is charged.
      </Text>
    </ScrollView>
  );
}
