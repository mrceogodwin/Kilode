import React from "react";
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
      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12, gap: 12 }}
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
            style={{ alignItems: "center", width: 68 }}
          >
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                borderWidth: st.id === "s0" ? 1 : 2,
                borderColor: st.id === "s0" ? C.border : C.accent,
                alignItems: "center",
                justifyContent: "center",
                padding: 2,
              }}
            >
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  overflow: "hidden",
                  backgroundColor: C.elevated,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {st.avatarUrl ? (
                  <Image source={{ uri: st.avatarUrl }} style={{ width: 54, height: 54 }} />
                ) : st.id === "s0" ? (
                  <Ionicons name="add" size={24} color={C.accent} />
                ) : (
                  <Text style={{ color: C.text, fontWeight: "800" }}>{(st.label || "?")[0]}</Text>
                )}
              </View>
            </View>
            <Text style={{ color: C.text2, fontSize: 11, marginTop: 5, fontWeight: "600" }} numberOfLines={1}>
              {st.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Composer strip — minimal */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onCompose}
        style={{
          marginHorizontal: 14,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
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
          <Text style={{ color: C.text, fontWeight: "800" }}>{(sessionName || "K")[0]}</Text>
        </View>
        <Text style={{ flex: 1, color: C.text3, fontSize: 14 }}>What is happening in Naija?</Text>
        <View
          style={{
            backgroundColor: C.accent,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "#111", fontWeight: "800", fontSize: 12 }}>Post</Text>
        </View>
      </TouchableOpacity>

      {feed.length === 0 ? (
        <EmptyState
          title="No takes yet"
          body="Be first to post what’s happening."
          actionLabel="Create a take"
          onAction={onCompose}
          icon="chatbubbles-outline"
          textColor={C.text}
          mutedColor={C.text2}
          accentColor={C.accent}
        />
      ) : null}

      {feed.map((t) => {
        const key = String(t.handle || t.name);
        const isFollowing = !!following[key];
        return (
          <View
            key={t.id}
            style={{
              marginHorizontal: 14,
              marginBottom: 12,
              borderRadius: 16,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
              padding: 12,
              overflow: "hidden",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity onPress={() => onOpenProfile(t)}>
                {t.avatarUrl ? (
                  <Image source={{ uri: t.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: C.elevated,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: C.text, fontWeight: "800" }}>{(t.name || "?")[0]}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => onOpenProfile(t)}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ color: C.text, fontWeight: "800", fontSize: 14 }}>{t.name}</Text>
                  {t.verified ? <Ionicons name="checkmark-circle" size={14} color={C.accent} /> : null}
                </View>
                <Text style={{ color: C.text3, fontSize: 12, marginTop: 1 }}>
                  @{t.handle} · {t.time}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onFollow(key, t.name)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isFollowing ? C.border : C.accent,
                  backgroundColor: isFollowing ? "transparent" : C.accentSoft,
                }}
              >
                <Text style={{ color: isFollowing ? C.text2 : C.accent, fontSize: 12, fontWeight: "700" }}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.88} onPress={() => onOpenPost(t)} style={{ marginTop: 10 }}>
              <Text style={{ color: C.text, fontSize: 15, lineHeight: 21 }} numberOfLines={5}>
                {t.text}
              </Text>
            </TouchableOpacity>

            {t.mediaUrl ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => onOpenPost(t)}>
                <Image
                  source={{ uri: t.mediaUrl }}
                  style={{
                    width: "100%",
                    height: 180,
                    borderRadius: 12,
                    marginTop: 10,
                    backgroundColor: C.elevated,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : t.media ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => onOpenPost(t)}>
                <View
                  style={{
                    height: 120,
                    borderRadius: 12,
                    marginTop: 10,
                    backgroundColor: t.mediaTone || C.elevated,
                  }}
                />
              </TouchableOpacity>
            ) : null}

            {/* Compact Fact/Cap — minimal, not a wall of text */}
            {typeof t.factPct === "number" ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800" }}>FACT {t.factPct}%</Text>
                <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: C.border, overflow: "hidden", flexDirection: "row" }}>
                  <View style={{ flex: t.factPct, backgroundColor: C.accent }} />
                  <View style={{ flex: 100 - t.factPct, backgroundColor: "transparent" }} />
                </View>
                <Text style={{ color: C.text3, fontSize: 10, fontWeight: "700" }}>CAP {100 - t.factPct}%</Text>
              </View>
            ) : null}

            <View style={{ marginTop: 6 }}>
              <PostActions
                liked={!!liked[t.id]}
                likes={(t.likes || 0) + (liked[t.id] ? 1 : 0)}
                comments={t.comments || 0}
                accent={C.accent}
                danger={C.danger}
                muted={C.text2}
                onLike={() => onLike(String(t.id))}
                onComment={() => onComment(t)}
                onShare={async () => {
                  try {
                    await Share.share({ message: `${t.name}: ${t.text}` });
                  } catch {
                    show("Could not open share sheet");
                  }
                }}
                onReport={() => onReport(String(t.id))}
                onBlock={() => onBlock(String(t.handle || t.name))}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
