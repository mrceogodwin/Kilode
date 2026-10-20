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
  accent = "#E5C158",
}: Props) {
  const bg = isDark ? "rgba(12,12,14,0.98)" : "rgba(250,249,246,0.98)";
  const muted = isDark ? "#7A7A80" : "#777";
  const border = isDark ? "rgba(229,193,88,0.14)" : "rgba(130,105,48,0.14)";

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
          <Ionicons name="add" size={30} color="#111" />
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
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { alignItems: "center", minWidth: 58, gap: 2 },
  label: { fontSize: 10, fontWeight: "600" },
  plusWrap: { marginTop: -20 },
  plus: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E5C158",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
