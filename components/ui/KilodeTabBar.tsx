import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BLUE, BORDER, TEXT3, WHITE } from "../../theme";

export type TabId = "home" | "socials" | "activity" | "myspace";

type Props = {
  active: string;
  onTab: (id: TabId) => void;
  onCreate: () => void;
  isDark?: boolean;
};

const TABS: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap; iconOn: keyof typeof Ionicons.glyphMap }[] = [
  { id: "home", label: "Home", icon: "home-outline", iconOn: "home" },
  { id: "socials", label: "Socials", icon: "people-outline", iconOn: "people" },
  { id: "activity", label: "Activity", icon: "notifications-outline", iconOn: "notifications" },
  { id: "myspace", label: "My Space", icon: "person-outline", iconOn: "person" },
];

export function KilodeTabBar({ active, onTab, onCreate, isDark }: Props) {
  const bg = isDark ? "#0B0B0F" : WHITE;
  const muted = isDark ? "#71717A" : TEXT3;
  const border = isDark ? "#2A2A35" : BORDER;

  return (
    <View style={[styles.dock, { backgroundColor: bg, borderTopColor: border }]}>
      {TABS.slice(0, 2).map((t) => {
        const on = active === t.id;
        return (
          <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab">
            <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? BLUE : muted} />
            <Text style={[styles.label, { color: on ? BLUE : muted }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        accessibilityLabel="Create"
        style={styles.plusWrap}
        onPress={onCreate}
        activeOpacity={0.9}
      >
        <View style={[styles.plus, { borderColor: bg }]}>
          <Ionicons name="add" size={28} color="#fff" />
        </View>
      </TouchableOpacity>

      {TABS.slice(2).map((t) => {
        const on = active === t.id;
        return (
          <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab">
            <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? BLUE : muted} />
            <Text style={[styles.label, { color: on ? BLUE : muted }]}>{t.label}</Text>
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
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
});
