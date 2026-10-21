import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type TabId = "home" | "socials" | "activity" | "myspace";

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
  { id: "socials", label: "Socials", icon: "people-outline", iconOn: "people" },
  { id: "activity", label: "Activity", icon: "notifications-outline", iconOn: "notifications" },
  { id: "myspace", label: "My Space", icon: "person-outline", iconOn: "person" },
];

/** Native five-slot dock, using the active Kilode palette. */
export function KilodeTabBar({
  active,
  onTab,
  onCreate,
  isDark = true,
  accent = "#D4AF37",
}: Props) {
  const bg = isDark ? "#0D0D10" : "#FFFFFF";
  const muted = isDark ? "#9A9A9E" : "#71717A";
  const border = isDark ? "#2A2A30" : "#E4E4E7";

  return (
    <View style={[styles.dock, { backgroundColor: bg, borderTopColor: border }]}>
      {TABS.slice(0, 2).map((t) => {
        const on = active === t.id;
        return (
          <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? accent : muted} />
            <Text style={[styles.label, { color: on ? accent : muted }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity accessibilityLabel="Create" accessibilityRole="button" hitSlop={8} style={styles.plusWrap} onPress={onCreate} activeOpacity={0.9}>
        <View style={[styles.plus, { backgroundColor: accent, borderColor: bg }]}>
          <Ionicons name="add" size={28} color="#fff" />
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
  item: { alignItems: "center", minWidth: 60, gap: 2 },
  label: { fontSize: 10, fontWeight: "600" },
  plusWrap: { marginTop: -18 },
  plus: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
});
