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

/** Kilode dock: restrained liquid-glass feel, signature gold, crisp outline icons. */
export function KilodeTabBar({
  active,
  onTab,
  onCreate,
  isDark = true,
  accent = "#D4AF37",
}: Props) {
  const bg = isDark ? "rgba(15,15,16,0.96)" : "rgba(250,249,246,0.96)";
  const muted = isDark ? "#8A8A8E" : "#777777";
  const border = isDark ? "rgba(212,175,55,0.18)" : "rgba(130,105,48,0.18)";

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

      <TouchableOpacity accessibilityLabel="Create" style={styles.plusWrap} onPress={onCreate} activeOpacity={0.9}>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.78)",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 5,
  },
});
