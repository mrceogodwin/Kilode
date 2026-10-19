import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  titleColor: string;
  actionColor: string;
};

/** Shared section header — consistent type & spacing */
export function SectionHeader({ title, actionLabel, onAction, titleColor, actionColor }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.action, { color: actionColor }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700", letterSpacing: -0.25, flex: 1, marginRight: 12 },
  action: { fontSize: 13, fontWeight: "600" },
});
