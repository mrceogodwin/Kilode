import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostActions } from "../components/ui/PostActions";

type Props = {
  s: any;
  C: any;
  post: any;
  liked: boolean;
  following: boolean;
  onBack: () => void;
  onLike: () => void;
  onComment: () => void;
  onFollow: () => void;
  onReport: () => void;
  onBlock: () => void;
  onOpenProfile?: () => void;
  show: (message: string) => void;
};

export function PostDetailScreen({
  s,
  C,
  post,
  liked,
  following,
  onBack,
  onLike,
  onComment,
  onFollow,
  onReport,
  onBlock,
  onOpenProfile,
  show,
}: Props) {
  const name = String(post?.name || "Kilode member");
  const handle = String(post?.handle || name.toLowerCase().replace(/\s+/g, ""));

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        onPress={onBack}
        style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, marginTop: 4 }}
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={20} color={C.accent} />
        <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Socials</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <TouchableOpacity onPress={onOpenProfile} disabled={!onOpenProfile}>
          {post?.avatarUrl ? (
            <Image source={{ uri: post.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }} />
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                marginRight: 12,
                backgroundColor: C.elevated,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 17 }}>{name.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={onOpenProfile} disabled={!onOpenProfile}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 16 }}>{name}</Text>
            {post?.verified ? <Ionicons name="checkmark-circle" size={15} color={C.accent} /> : null}
          </View>
          <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>
            @{handle} · {post?.time || "recently"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFollow}
          style={{
            borderWidth: 1,
            borderColor: following ? C.border : C.accent,
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 14,
            backgroundColor: following ? "transparent" : C.accentSoft,
          }}
        >
          <Text style={{ color: following ? C.text2 : C.accent, fontWeight: "700", fontSize: 13 }}>
            {following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: C.text, fontSize: 16, lineHeight: 24 }}>{post?.text || post?.body || ""}</Text>

      {post?.mediaUrl ? (
        <Image
          source={{ uri: post.mediaUrl }}
          style={{ width: "100%", height: 260, borderRadius: 16, marginTop: 16, backgroundColor: C.elevated }}
          resizeMode="cover"
        />
      ) : post?.media ? (
        <View
          style={{
            height: 160,
            borderRadius: 16,
            marginTop: 16,
            backgroundColor: post.mediaTone || C.elevated,
          }}
        />
      ) : null}

      {typeof post?.factPct === "number" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }}>
          <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>FACT {post.factPct}%</Text>
          <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: C.border, overflow: "hidden", flexDirection: "row" }}>
            <View style={{ flex: post.factPct, backgroundColor: C.accent }} />
            <View style={{ flex: Math.max(0, 100 - post.factPct) }} />
          </View>
          <Text style={{ color: C.text3, fontSize: 11, fontWeight: "700" }}>CAP {100 - post.factPct}%</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        <PostActions
          liked={liked}
          likes={(post?.likes || 0) + (liked ? 1 : 0)}
          comments={post?.comments || 0}
          accent={C.accent}
          danger={C.danger}
          muted={C.text2}
          onLike={onLike}
          onComment={onComment}
          onShare={async () => {
            try {
              await Share.share({ message: `${name}: ${post?.text || ""}` });
            } catch {
              show("Could not open share sheet");
            }
          }}
          onReport={onReport}
          onBlock={onBlock}
        />
      </View>

      <TouchableOpacity
        onPress={onComment}
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 14,
          backgroundColor: C.elevated,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <Text style={{ color: C.text3, fontSize: 14 }}>Add a comment…</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
