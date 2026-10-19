import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  liked: boolean;
  likes: number;
  comments: number;
  accent: string;
  danger: string;
  muted: string;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
};

/** Coherent icon actions — no emoji chrome */
export function PostActions({
  liked,
  likes,
  comments,
  danger,
  muted,
  onLike,
  onComment,
  onShare,
}: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onLike}
        accessibilityRole="button"
        accessibilityLabel="Like"
      >
        <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? danger : muted} />
        <Text style={[styles.n, { color: liked ? danger : muted }]}>{likes}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={onComment}
        accessibilityRole="button"
        accessibilityLabel="Comments"
      >
        <Ionicons name="chatbubble-outline" size={19} color={muted} />
        <Text style={[styles.n, { color: muted }]}>{comments}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="Share"
      >
        <Ionicons name="share-outline" size={20} color={muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    minHeight: 36,
  },
  n: { fontSize: 13, fontWeight: "600" },
});
