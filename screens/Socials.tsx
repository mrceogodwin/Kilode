import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostActions } from "../components/ui/PostActions";
import { EmptyState } from "../components/ui/EmptyState";
import { STORIES } from "../data";

type Props = {
  s: any;
  C: any;
  takes: any[];
  blocked: string[];
  liked: Record<string, boolean>;
  following: Record<string, boolean>;
  sessionName: string;
  refreshing: boolean;
  onRefresh: () => void;
  onCompose: () => void;
  onOpenPost: (post: any) => void;
  onOpenProfile: (user: any) => void;
  onLike: (id: string) => void;
  onComment: (post: any) => void;
  onFollow: (key: string, name: string) => void;
  onReport: (id: string) => void;
  onBlock: (handle: string) => void;
  show: (m: string) => void;
};

const FEED_CHIPS = ["For You", "Following", "Trending"] as const;

export function SocialsScreen({
  s,
  C,
  takes,
  blocked,
  liked,
  following,
  sessionName,
  refreshing,
  onRefresh,
  onCompose,
  onOpenPost,
  onOpenProfile,
  onLike,
  onComment,
  onFollow,
  onReport,
  onBlock,
  show,
}: Props) {
  const [chip, setChip] = useState<(typeof FEED_CHIPS)[number]>("For You");
  const feed = takes.filter(
    (t) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || ""))
  );

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {/* Header row */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: C.text, fontSize: 20, fontWeight: "800" }}>Socials</Text>
        <TouchableOpacity
          onPress={onCompose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: C.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Stories — compact */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 10, gap: 10 }}
      >
        {STORIES.map((st) => (
          <TouchableOpacity
            key={st.id}
            activeOpacity={0.75}
            onPress={() =>
              st.id === "s0"
                ? onCompose()
                : onOpenProfile({ name: st.label, handle: st.label.toLowerCase(), role: "Kilode" })
            }
            style={{ alignItems: "center", width: 64 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: st.id === "s0" ? 1 : 2,
                borderColor: st.id === "s0" ? C.border : C.accent,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: C.elevated,
                overflow: "hidden",
              }}
            >
              {st.imageUrl ? (
                <Image source={{ uri: st.imageUrl }} style={{ width: 52, height: 52, borderRadius: 26 }} />
              ) : (
                <Ionicons name={st.id === "s0" ? "add" : "person"} size={22} color={C.text2} />
              )}
            </View>
            <Text style={{ color: C.text2, fontSize: 10, marginTop: 4, fontWeight: "600" }} numberOfLines={1}>
              {st.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 8 }}
      >
        {FEED_CHIPS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setChip(c)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: chip === c ? C.accent : "transparent",
              borderWidth: 1,
              borderColor: chip === c ? C.accent : C.border,
            }}
          >
            <Text style={{ color: chip === c ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Composer strip */}
      <TouchableOpacity
        onPress={onCompose}
        activeOpacity={0.85}
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 14,
          backgroundColor: C.elevated,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: C.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: C.text, fontWeight: "800", fontSize: 13 }}>{(sessionName || "K").slice(0, 1)}</Text>
        </View>
        <Text style={{ color: C.text3, fontSize: 14, flex: 1 }}>What's on your mind?</Text>
        <Ionicons name="image-outline" size={18} color={C.accent} />
      </TouchableOpacity>

      {feed.length === 0 ? (
        <EmptyState
          C={C}
          icon="people-outline"
          title="No posts yet"
          body="Be the first to share something on Kilode."
          actionLabel="Create post"
          onAction={onCompose}
        />
      ) : (
        feed.map((t) => {
          const id = String(t.id);
          const key = String(t.handle || t.name);
          const isLiked = !!liked[id];
          const isFollowing = !!following[key];
          return (
            <View
              key={id}
              style={{
                marginHorizontal: 12,
                marginBottom: 10,
                borderRadius: 16,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
                overflow: "hidden",
              }}
            >
              {/* Author row — tight */}
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, gap: 10 }}>
                <TouchableOpacity
                  onPress={() =>
                    onOpenProfile({
                      name: t.name,
                      handle: t.handle || t.name,
                      role: t.role || "Member",
                      avatarUrl: t.avatarUrl,
                    })
                  }
                >
                  {t.avatarUrl ? (
                    <Image source={{ uri: t.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                  ) : (
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: C.elevated,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: C.text, fontWeight: "800", fontSize: 13 }}>{String(t.name || "K").slice(0, 1)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }} numberOfLines={1}>
                    {t.name}
                  </Text>
                  <Text style={{ color: C.text3, fontSize: 11, marginTop: 1 }}>
                    {t.time || "Just now"} · {t.role || "Public"}
                  </Text>
                </View>
                {!isFollowing ? (
                  <TouchableOpacity
                    onPress={() => onFollow(key, t.name)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: C.accent,
                    }}
                  >
                    <Text style={{ color: "#111", fontWeight: "800", fontSize: 11 }}>Follow</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => show("More options")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={C.text3} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Body */}
              <TouchableOpacity activeOpacity={0.9} onPress={() => onOpenPost(t)} style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }} numberOfLines={5}>
                  {t.text}
                </Text>
              </TouchableOpacity>

              {t.mediaUrl ? (
                <TouchableOpacity activeOpacity={0.95} onPress={() => onOpenPost(t)}>
                  <Image
                    source={{ uri: t.mediaUrl }}
                    style={{ width: "100%", height: 200, backgroundColor: C.elevated }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : null}

              {/* Actions */}
              <View style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
                <PostActions
                  C={C}
                  liked={isLiked}
                  likes={typeof t.likes === "number" ? t.likes + (isLiked ? 1 : 0) : undefined}
                  comments={t.comments}
                  onLike={() => onLike(id)}
                  onComment={() => onComment(t)}
                  onShare={async () => {
                    try {
                      await Share.share({ message: `${t.name}: ${t.text}` });
                    } catch {
                      show("Share cancelled");
                    }
                  }}
                  onReport={() => onReport(id)}
                  onBlock={() => onBlock(String(t.handle || t.name))}
                />
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
