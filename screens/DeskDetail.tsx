import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Palette } from "../themeStyles";

type Props = {
  s: any;
  C: Palette;
  system: string;
  item: any;
  onBack: () => void;
  show: (message: string) => void;
};

/** Feature-specific detail surface for Jobs, Market, Events and other Kilode desks. */
export function DeskDetailScreen({ s, C, system, item, onBack, show }: Props) {
  const title = String(item?.title || item?.name || system);
  const action = system === "Jobs" ? "Apply for this job"
    : system === "Market" ? "Contact seller"
    : system === "Events" ? "RSVP to event"
    : system === "Rent" ? "Contact listing"
    : system === "Ads" ? "View campaign"
    : `Open ${system.toLowerCase()}`;

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={C.accent} />
          <Text style={s.link}>Back to {system}</Text>
        </TouchableOpacity>
        {item?.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={{ height: 210, borderRadius: 18, marginBottom: 18, backgroundColor: C.elevated }} resizeMode="cover" />
        ) : (
          <View style={{ height: 120, borderRadius: 18, marginBottom: 18, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={system === "Jobs" ? "briefcase-outline" : system === "Events" ? "calendar-outline" : system === "Market" ? "bag-handle-outline" : "grid-outline"} size={38} color={C.accent} />
          </View>
        )}
        <Text style={[s.meta, { color: C.accent, fontWeight: "700", marginBottom: 8 }]}>{system.toUpperCase()}</Text>
        <Text style={[s.h1, { marginBottom: 8 }]}>{title}</Text>
        {item?.meta ? <Text style={[s.sub, { marginBottom: 14 }]}>{item.meta}</Text> : null}
        {item?.price ? <Text style={{ color: C.accent, fontWeight: "800", fontSize: 20, marginBottom: 14 }}>{item.price}</Text> : null}
        <Text style={{ color: C.text, fontSize: 15, lineHeight: 24 }}>
          {item?.description || item?.blurb || item?.summary || `Details for this ${system.toLowerCase()} item will be provided by the connected Kilode service.`}
        </Text>
        <View style={{ marginTop: 24, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <Text style={{ color: C.text, fontWeight: "700", marginBottom: 5 }}>Action status</Text>
          <Text style={{ color: C.text2, lineHeight: 20 }}>This preview has no live {system.toLowerCase()} transaction service connected. No application, booking, message, or purchase will be submitted from this screen yet.</Text>
        </View>
        <TouchableOpacity style={[s.primaryBtn, { marginTop: 18 }]} onPress={() => show(`${action} is not connected yet. Nothing was submitted.`)} accessibilityRole="button">
          <Text style={s.primaryBtnText}>{action}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
