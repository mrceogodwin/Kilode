import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { BLUE } from "../../theme";

type Props = {
  name?: string;
  uri?: string | null;
  size?: number;
};

export function KilodeAvatar({ name = "?", uri, size = 40 }: Props) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#E7ECF2",
        }}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: { color: "#fff", fontWeight: "700" },
});
