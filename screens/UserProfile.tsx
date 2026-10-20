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
  const name = String(user?.name || "Member");
  const handle = String(user?.handle || name.toLowerCase().replace(/\s+/g, ""));

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16 }}>
          <Ionicons name="chevron-back" size={20} color={C.accent} />
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>Back</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginBottom: 18 }}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: 88, height: 88, borderRadius: 44, marginBottom: 12 }} />
          ) : (
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: C.elevated,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: C.text, fontSize: 32, fontWeight: "800" }}>{name.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: C.text, fontSize: 20, fontWeight: "800" }}>{name}</Text>
            {user?.verified ? <Ionicons name="checkmark-circle" size={18} color={C.accent} /> : null}
          </View>
          <Text style={{ color: C.text3, fontSize: 13, marginTop: 4 }}>@{handle}</Text>
          {user?.role ? <Text style={{ color: C.text2, fontSize: 13, marginTop: 6 }}>{user.role}</Text> : null}

          <View style={{ flexDirection: "row", gap: 24, marginTop: 14 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 16 }}>{posts.length}</Text>
              <Text style={{ color: C.text3, fontSize: 11 }}>Takes</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 16 }}>—</Text>
              <Text style={{ color: C.text3, fontSize: 11 }}>Followers</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: C.text, fontWeight: "800", fontSize: 16 }}>—</Text>
              <Text style={{ color: C.text3, fontSize: 11 }}>Following</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onToggleFollow}
            style={{
              marginTop: 16,
              paddingHorizontal: 28,
              paddingVertical: 11,
              borderRadius: 999,
              backgroundColor: isFollowing ? C.elevated : C.accent,
              borderWidth: 1,
              borderColor: isFollowing ? C.border : C.accent,
            }}
          >
            <Text style={{ color: isFollowing ? C.text : "#111", fontWeight: "800", fontSize: 14 }}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginBottom: 12 }}>Takes</Text>
      </View>

      {posts.length === 0 ? (
        <Text style={{ color: C.text3, textAlign: "center", marginTop: 20, paddingHorizontal: 24 }}>No takes yet.</Text>
      ) : (
        posts.map((p) => (
          <TouchableOpacity
            key={p.id}
            activeOpacity={0.85}
            onPress={() => onOpenPost(p)}
            style={{
              marginHorizontal: 14,
              marginBottom: 10,
              padding: 12,
              borderRadius: 14,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
              {p.text}
            </Text>
            {p.mediaUrl ? (
              <Image
                source={{ uri: p.mediaUrl }}
                style={{ width: "100%", height: 140, borderRadius: 10, marginTop: 10, backgroundColor: C.elevated }}
                resizeMode="cover"
              />
            ) : null}
            <Text style={{ color: C.text3, fontSize: 11, marginTop: 8 }}>
              {p.time || ""} · {p.likes || 0} likes
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
