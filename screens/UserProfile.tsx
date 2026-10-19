import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  s: any;
  C: any;
  user: any;
  posts: any[];
  isFollowing: boolean;
  onBack: () => void;
  onToggleFollow: () => void;
  onOpenPost: (post: any) => void;
};

export function UserProfileScreen({ s, C, user, posts, isFollowing, onBack, onToggleFollow, onOpenPost }: Props) {
  const name = String(user?.name || user?.displayName || user?.handle || "Kilode member");
  const handle = String(user?.handle || name.toLowerCase().replace(/\s+/g, ""));
  const bio = String(user?.bio || user?.role || "Part of the Kilode community.");
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }} accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={C.accent} />
          <Text style={s.link}>Back to Socials</Text>
        </TouchableOpacity>
        <View style={{ height: 94, borderRadius: 18, backgroundColor: C.elevated, marginBottom: -34 }} />
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
          {user?.avatarUrl
            ? <Image source={{ uri: user.avatarUrl }} style={{ width: 74, height: 74, borderRadius: 37, borderWidth: 3, borderColor: C.bg }} />
            : <View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: C.accent, borderWidth: 3, borderColor: C.bg, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#17130A", fontWeight: "800", fontSize: 24 }}>{name.slice(0, 1).toUpperCase()}</Text></View>}
          {user?.handle !== "you" ? (
            <TouchableOpacity onPress={onToggleFollow} style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, backgroundColor: isFollowing ? C.card : C.accent, borderWidth: 1, borderColor: C.accent }} accessibilityRole="button">
              <Text style={{ color: isFollowing ? C.accent : "#17130A", fontWeight: "800" }}>{isFollowing ? "Following" : "Follow"}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={s.h1}>{name}{user?.verified ? " ✓" : ""}</Text>
        <Text style={[s.sub, { marginTop: 3 }]}>@{handle}</Text>
        <Text style={{ color: C.text, lineHeight: 21, marginTop: 12 }}>{bio}</Text>
        <View style={{ flexDirection: "row", gap: 24, marginTop: 18, marginBottom: 22 }}>
          <View><Text style={{ color: C.text, fontWeight: "800", fontSize: 17 }}>{posts.length}</Text><Text style={s.meta}>Posts</Text></View>
          <View><Text style={{ color: C.text, fontWeight: "800", fontSize: 17 }}>{user?.followingCount ?? "—"}</Text><Text style={s.meta}>Following</Text></View>
          <View><Text style={{ color: C.text, fontWeight: "800", fontSize: 17 }}>{user?.followersCount ?? "—"}</Text><Text style={s.meta}>Followers</Text></View>
        </View>
        <View style={{ height: 1, backgroundColor: C.border, marginBottom: 16 }} />
        <Text style={s.sectionTitle}>Posts</Text>
        {posts.length ? posts.map((post) => (
          <TouchableOpacity key={String(post.id)} onPress={() => onOpenPost(post)} style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border }} accessibilityRole="button">
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 21 }}>{post.text || post.body}</Text>
            {post.mediaUrl ? <Image source={{ uri: post.mediaUrl }} style={{ height: 150, borderRadius: 14, marginTop: 12, backgroundColor: C.elevated }} resizeMode="cover" /> : null}
            <Text style={[s.meta, { marginTop: 10 }]}>{post.time || "Recently"} · ♥ {post.likes || 0} · {post.comments || 0} comments</Text>
          </TouchableOpacity>
        )) : <Text style={[s.sub, { marginTop: 14 }]}>No posts from this profile in the current feed.</Text>}
      </View>
    </ScrollView>
  );
}
