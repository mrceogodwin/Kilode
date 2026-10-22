import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type TabId = "home" | "socials" | "music" | "more";

type Props = {
  active: string;
  onTab: (id: TabId) => void;
  onCreate: () => void;
  isDark?: boolean;
  accent?: string;
};

const TABS: {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOn: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "home", label: "Home", icon: "home-outline", iconOn: "home" },
  { id: "socials", label: "Social", icon: "people-outline", iconOn: "people" },
  { id: "music", label: "Music", icon: "musical-notes-outline", iconOn: "musical-notes" },
  { id: "more", label: "More", icon: "grid-outline", iconOn: "grid" },
];

/** Dock respects Kilode palette — green accent by default */
export function KilodeTabBar({
  active,
  onTab,
  onCreate,
  isDark = true,
  accent = "#22C55E",
}: Props) {
  const bg = isDark ? "#18181C" : "#FFFFFF";
  const muted = isDark ? "#9A9A9E" : "#77777D";
  const border = isDark ? "#2A2A30" : "#E4E4E7";

  return (
    <View style={[styles.dock, { backgroundColor: bg, borderTopColor: border }]}>
      {TABS.slice(0, 2).map((t) => {
        const on = active === t.id;
        return (
          <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab">
            <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? accent : muted} />
            <Text style={[styles.label, { color: on ? accent : muted }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Create" style={styles.plusWrap} onPress={onCreate} activeOpacity={0.9}>
        <View style={[styles.plus, { backgroundColor: accent, borderColor: bg }]}>
          <Ionicons name="add" size={28} color="#18181C" />
        </View>
      </TouchableOpacity>

      {TABS.slice(2).map((t) => {
        const on = active === t.id;
        return (
          <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab">
            <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? accent : muted} />
            <Text style={[styles.label, { color: on ? accent : muted }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { alignItems: "center", flex: 1, minWidth: 0, gap: 2 },
  label: { fontSize: 10, fontWeight: "600" },
  plusWrap: { flex: 1, alignItems: "center", marginTop: -15 },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
});
