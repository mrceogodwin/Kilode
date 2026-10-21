import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/** Matches design system: Home · Media · + · Socials · More */
export type TabId = "home" | "media" | "socials" | "more" | "myspace";

type Props = {
  active: string;
  onTab: (id: TabId) => void;
  onCreate: () => void;
  isDark?: boolean;
  accent?: string;
};

const LEFT: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap; iconOn: keyof typeof Ionicons.glyphMap }[] = [
  { id: "home", label: "Home", icon: "home-outline", iconOn: "home" },
  { id: "media", label: "Media", icon: "play-circle-outline", iconOn: "play-circle" },
];

const RIGHT: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap; iconOn: keyof typeof Ionicons.glyphMap }[] = [
  { id: "socials", label: "Socials", icon: "people-outline", iconOn: "people" },
  { id: "more", label: "More", icon: "grid-outline", iconOn: "grid" },
];

export function KilodeTabBar({
  active,
  onTab,
  onCreate,
  isDark = true,
  accent = "#D4AF37",
}: Props) {
  const bg = isDark ? "#0D0D10" : "#FFFFFF";
  const muted = isDark ? "#9A9A9E" : "#777777";
  const border = isDark ? "#2A2A30" : "#E1E5DF";

  const item = (t: (typeof LEFT)[0]) => {
    const on = active === t.id;
    return (
      <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab">
        <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? accent : muted} />
        <Text style={[styles.label, { color: on ? accent : muted }]}>{t.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.dock, { backgroundColor: bg, borderTopColor: border }]}>
      {LEFT.map(item)}
      <TouchableOpacity accessibilityLabel="Create" style={styles.plusWrap} onPress={onCreate} activeOpacity={0.9}>
        <View style={[styles.plus, { backgroundColor: accent }]}>
          <Ionicons name="add" size={30} color={isDark ? "#101512" : "#FFFFFF"} />
        </View>
      </TouchableOpacity>
      {RIGHT.map(item)}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    minHeight: 66,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1, minWidth: 0, minHeight: 48, gap: 3 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 0.1 },
  plusWrap: { alignItems: "center", justifyContent: "center", width: 54, marginTop: -10 },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5C158",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 6,
  },
});
