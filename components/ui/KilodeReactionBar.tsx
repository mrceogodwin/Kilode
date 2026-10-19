import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TEXT2, BORDER } from "../../theme";

export type Reaction = {
  key: string;
  emoji: string;
  count: number;
  active?: boolean;
};

type Props = {
  items: Reaction[];
  onPress?: (key: string) => void;
};

export function KilodeReactionBar({ items, onPress }: Props) {
  return (
    <View style={styles.row}>
      {items.map((r) => (
        <TouchableOpacity
          key={r.key}
          activeOpacity={0.8}
          onPress={() => onPress?.(r.key)}
          style={[styles.chip, r.active && styles.chipOn]}
        >
          <Text style={styles.emoji}>{r.emoji}</Text>
          <Text style={styles.count}>{r.count}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
  },
  chipOn: { borderColor: "#1877F2", backgroundColor: "#E7F0FE" },
  emoji: { fontSize: 14 },
  count: { fontSize: 12, fontWeight: "600", color: TEXT2 },
});
