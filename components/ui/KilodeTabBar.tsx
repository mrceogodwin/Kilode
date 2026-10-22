import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

export type TabId = "home" | "socials" | "activity" | "more";

type Props = {
  active: string;
  onTab: (id: TabId) => void;
  onCreate: () => void;
  isDark?: boolean;
  accent?: string;
};

const TABS: { id: TabId; label: string; glyph: string }[] = [
  { id: "home", label: "Home", glyph: "⌂" },
  { id: "socials", label: "Socials", glyph: "◉" },
  { id: "activity", label: "Activity", glyph: "✧" },
  { id: "more", label: "More", glyph: "•••" },
];

export function KilodeTabBar({
  active,
  onTab,
  onCreate,
  isDark = true,
  accent = "#D4AF37",
}: Props) {
  const bg = isDark ? "#18181C" : "#FFFFFF";
  const muted = isDark ? "#9A9A9E" : "#77777D";
  const border = isDark ? "#2A2A30" : "#E4E4E7";

  const item = (t: (typeof TABS)[number]) => {
    const on = active === t.id;
    return (
      <TouchableOpacity key={t.id} style={styles.item} onPress={() => onTab(t.id)} accessibilityRole="tab" accessibilityLabel={t.label}>
        <View style={[styles.glyphShell, on && { backgroundColor: isDark ? "#302A1B" : "#F7F0D8", borderColor: accent }]}>
          <Text style={[styles.glyph, { color: on ? accent : muted, fontSize: t.id === "more" ? 13 : 23 }]}>{t.glyph}</Text>
        </View>
        <Text style={[styles.label, { color: on ? accent : muted }]}>{t.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.dock, { backgroundColor: bg, borderTopColor: border }]}>
      {item(TABS[0])}
      {item(TABS[1])}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Create" style={styles.plusWrap} onPress={onCreate} activeOpacity={0.88}>
        <View style={[styles.plus, { backgroundColor: accent, borderColor: bg }]}>
          <Text style={styles.plusGlyph}>＋</Text>
        </View>
      </TouchableOpacity>
      {item(TABS[2])}
      {item(TABS[3])}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    paddingTop: 7,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1, minWidth: 0, gap: 2 },
  glyphShell: {
    width: 34,
    height: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: { fontWeight: "700", lineHeight: 25 },
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
  plusGlyph: { fontSize: 29, lineHeight: 32, color: "#18181C", fontWeight: "500" },
});
