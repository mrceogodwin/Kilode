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
  show: (message: string) => void;
};

export function PostDetailScreen({ s, C, post, liked, following, onBack, onLike, onComment, onFollow, onReport, onBlock, show }: Props) {
  const name = String(post?.name || "Kilode member");
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={C.accent} />
          <Text style={s.link}>Back to Socials</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          {post?.avatarUrl ? <Image source={{ uri: post.avatarUrl }} style={{ width: 46, height: 46, borderRadius: 23, marginRight: 12 }} /> :
            <View style={{ width: 46, height: 46, borderRadius: 23, marginRight: 12, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.text, fontWeight: "800", fontSize: 18 }}>{name.slice(0,1).toUpperCase()}</Text></View>}
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 16 }}>{name}{post?.verified ? " ✓" : ""}</Text>
            <Text style={s.meta}>@{post?.handle || name.toLowerCase().replace(/\s+/g, "")} · {post?.time || "recently"}</Text>
            {post?.role ? <Text style={s.meta}>{post.role}</Text> : null}
          </View>
          <TouchableOpacity onPress={onFollow} style={{ borderWidth: 1, borderColor: C.accent, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 }}><Text style={{ color: C.accent, fontWeight: "700" }}>{following ? "Following" : "Follow"}</Text></TouchableOpacity>
        </View>
        <Text style={{ color: C.text, fontSize: 16, lineHeight: 25 }}>{post?.text || post?.body || ""}</Text>
        {post?.mediaUrl ? <Image source={{ uri: post.mediaUrl }} style={{ width: "100%", height: 250, borderRadius: 16, marginTop: 18, backgroundColor: C.elevated }} resizeMode="cover" /> : null}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 12 }}>
          <Text style={{ color: C.accent, fontSize: 12, fontWeight: "800" }}>FACT {post?.factPct ?? 50}%</Text>
          <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: C.elevated, overflow: "hidden", flexDirection: "row", marginHorizontal: 10 }}>
            <View style={{ width: (post?.factPct ?? 50) + "%", backgroundColor: C.success }} />
            <View style={{ flex: 1, backgroundColor: C.danger }} />
          </View>
          <Text style={{ color: C.danger, fontSize: 12, fontWeight: "800" }}>CAP {100 - (post?.factPct ?? 50)}%</Text>
        </View>
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border, paddingVertical: 12 }}>
          <PostActions liked={liked} likes={(post?.likes || 0) + (liked ? 1 : 0)} comments={post?.comments || 0} accent={C.accent} danger={C.danger} muted={C.text2} onLike={onLike} onComment={onComment} onShare={async () => { try { await Share.share({ message: name + " on Kilode:\n\n" + (post?.text || "") }); } catch { show("Could not open share options."); } }} onReport={onReport} onBlock={onBlock} />
        </View>
        <Text style={[s.sub, { marginTop: 18 }]}>Comments and replies</Text>
        <TouchableOpacity onPress={onComment} style={{ marginTop: 10, borderRadius: 14, padding: 15, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }}><Text style={{ color: C.text2 }}>Join the conversation…</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
