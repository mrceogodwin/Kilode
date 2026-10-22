import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Share, RefreshControl } from "react-native";
import { PostActions } from "../components/ui/PostActions";
import { blockUser, submitReport } from "../lib/moderation";

type Props = {
  s: any;
  C: any;
  session: any;
  takes: any[];
  blocked: string[];
  setBlocked: (b: string[] | ((prev: string[]) => string[])) => void;
  socialSection: "feed" | "creators" | "communities";
  setSocialSection: (v: "feed" | "creators" | "communities") => void;
  liked: Record<string, boolean>;
  setLiked: (l: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  following: Record<string, boolean>;
  setFollowing: (f: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  refreshing: boolean;
  onRefresh: () => void;
  setComposeOpen: (v: boolean) => void;
  setCommentTake: (t: any) => void;
  setSelectedProfile: (p: any) => void;
  show: (m: string) => void;
};

export function SocialsScreen({
  s, C, session, takes, blocked, setBlocked, socialSection, setSocialSection,
  liked, setLiked, following, setFollowing, refreshing, onRefresh,
  setComposeOpen, setCommentTake, setSelectedProfile, show,
}: Props) {
  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />;
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad} showsVerticalScrollIndicator={false} refreshControl={rc}>
      <View style={s.padH}>
        <Text style={s.h1}>Socials</Text>
        <Text style={s.sub}>Your people, creators and communities in one place.</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 14 }}>
        {([
          { id: "feed" as const, label: "Feed" },
          { id: "creators" as const, label: "Creators" },
          { id: "communities" as const, label: "Communities" },
        ]).map((item) => {
          const active = socialSection === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSocialSection(item.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: 38, paddingHorizontal: 8, borderRadius: 13, borderWidth: 1, borderColor: active ? C.accent : C.border, backgroundColor: active ? C.accent + "20" : C.card }}
            >
              <Text style={{ color: active ? C.accent : C.text2, fontSize: 12, fontWeight: active ? "800" : "600" }}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {socialSection === "feed" ? (
        <>
          <View style={s.composer}>
            <View style={s.composerAv}><Text style={s.avatarText}>{(session.name || "K").slice(0, 1)}</Text></View>
            <TouchableOpacity style={s.composerInput} onPress={() => setComposeOpen(true)}><Text style={s.composerPlaceholder}>What is happening in Naija?</Text></TouchableOpacity>
            <TouchableOpacity style={s.postBtn} onPress={() => setComposeOpen(true)}><Text style={s.postBtnText}>Post</Text></TouchableOpacity>
          </View>
          {takes.filter((t: any) => !blocked.includes(String(t.handle || "")) && !blocked.includes(String(t.name || ""))).map((t: any) => (
            <View key={t.id} style={s.postCard}>
              <View style={s.postTop}>
                <TouchableOpacity onPress={() => setSelectedProfile(t)} accessibilityRole="button"><View style={s.postAv}><Text style={s.avatarText}>{(t.name || "?").slice(0, 1)}</Text></View></TouchableOpacity>
                <TouchableOpacity style={s.flex} onPress={() => setSelectedProfile(t)} accessibilityRole="button">
                  <View style={s.row}><Text style={s.postName}>{t.name}</Text>{t.verified ? <Text style={s.verified}>✓</Text> : null}</View>
                  <Text style={s.meta}>@{t.handle} · {t.time} · {t.role}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.followBtn} onPress={() => setFollowing((prev) => ({ ...prev, [String(t.handle || t.name)]: !prev[String(t.handle || t.name)] }))}><Text style={s.followBtnText}>{following[String(t.handle || t.name)] ? "Following" : "Follow"}</Text></TouchableOpacity>
              </View>
              <Text style={s.postBody}>{t.text}</Text>
              {t.mediaUrl ? (
                <Image source={{ uri: t.mediaUrl }} style={s.postMedia} resizeMode="cover" />
              ) : t.media ? (
                <View style={[s.postMedia, { backgroundColor: t.mediaTone || C.elevated }]} />
              ) : null}
              <View style={s.factCapRow}>
                <Text style={[s.meta, { fontWeight: "700", color: C.success }]}>FACT {t.factPct ?? 50}%</Text>
                <View style={s.factCapBar}>
                  <View style={[s.factFill, { flex: t.factPct ?? 50 }]} />
                  <View style={[s.capFill, { flex: 100 - (t.factPct ?? 50) }]} />
                </View>
                <Text style={[s.meta, { fontWeight: "700", color: C.danger }]}>CAP {100 - (t.factPct ?? 50)}%</Text>
              </View>
              <PostActions
                liked={!!liked[t.id]}
                likes={(t.likes || 0) + (liked[t.id] ? 1 : 0)}
                comments={t.comments || 0}
                accent={C.accent}
                danger={C.danger}
                muted={C.text2}
                onLike={() => setLiked((prev) => ({ ...prev, [String(t.id)]: !prev[String(t.id)] }))}
                onComment={() => setCommentTake(t)}
                onShare={async () => { try { await Share.share({ message: `${t.name} (@${t.handle}) on Kilode:\n\n${t.text}` }); } catch { show("Could not open share options."); } }}
                onReport={async () => { await submitReport("post", String(t.id), "other"); show("Reported · under review"); }}
                onBlock={async () => {
                  const h = String(t.handle || t.name);
                  await blockUser(h);
                  setBlocked((prev) => (prev.includes(h) ? prev : [...prev, h]));
                  show(`Blocked @${h}`);
                }}
              />
            </View>
          ))}
          <View style={{ height: 20 }} />
        </>
      ) : socialSection === "creators" ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <Text style={s.sub}>Creator discovery lives here. Follow artists, writers and makers from Socials.</Text>
          <Text style={[s.meta, { marginTop: 12 }]}>Live creator graph connects when the dedicated API is available.</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <Text style={s.sub}>Communities and topic rooms. Join conversations that matter in Naija.</Text>
          <Text style={[s.meta, { marginTop: 12 }]}>Community membership persists when the backend is connected.</Text>
        </View>
      )}
    </ScrollView>
  );
}
