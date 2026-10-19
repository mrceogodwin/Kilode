import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { ACCOUNT_KINDS, type AccountKind } from "../lib/accountKinds";

type Props = {
  isDark: boolean;
  C: any;
  onSignIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  onSignUp: (handle: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
  onGoogle: () => void;
  show: (m: string) => void;
};

export function AuthScreen({ onSignIn, onSignUp, onGuest, show }: Props) {
  const [mode, setMode] = useState<"welcome" | "in" | "up">("welcome");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind>("member");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!handle.trim() || !password) { show("Enter your username and password."); return; }
    setBusy(true);
    try {
      const result = mode === "up"
        ? await onSignUp(handle.trim(), password, kind, name.trim() || undefined)
        : await onSignIn(handle.trim(), password);
      if (!result.ok) show(result.error || "Something went wrong. Try again.");
      else show(mode === "up" ? `Welcome to Kilode · ${kind}` : "Welcome back");
    } catch {
      show("Could not connect. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      {mode === "welcome" ? (
        <View style={styles.welcome}>
          <View style={styles.topBrand}>
            <Text style={styles.logo}>Kilode<Text style={styles.logoMark}>!</Text></Text>
            <View style={styles.signature}><View style={styles.signatureLine} /><View style={styles.signatureDot} /></View>
          </View>
          <View style={styles.heroWrap}>
            <View style={styles.hero}>
              <View style={styles.videoMosaic}>
                {WELCOME_SCENES.map((uri, index) => (
                  <View key={index} style={[styles.videoTile, { transform: [{ translateY: index % 3 === 0 ? -4 : index % 3 === 1 ? 5 : 0 }] }]}>
                    <Video
                      source={{ uri }}
                      style={styles.tileVideo}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay
                      isLooping
                      isMuted
                      useNativeControls={false}
                    />
                    <View style={styles.tileShade} />
                  </View>
                ))}
              </View>
              <View style={styles.heroCenterVideo}>
                <Video
                  source={{ uri: WELCOME_SCENES[0] }}
                  style={styles.centerVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                  useNativeControls={false}
                />
                <View style={styles.centerVideoShade} />
                <View style={styles.centerLive}><View style={styles.liveDot} /><Text style={styles.centerLiveText}>LIVE CULTURE</Text></View>
                <View style={styles.centerCaption}><Ionicons name="musical-notes" size={12} color={GOLD} /><Text style={styles.captionText}>THE SOUND OF YOUR WORLD</Text></View>
              </View>
              <View style={styles.floatingTag}><Ionicons name="musical-notes" size={14} color="#E5C158" /><Text style={styles.tagText}>MUSIC</Text></View>
              <View style={[styles.floatingTag, styles.tagMedia]}><Ionicons name="play-circle" size={14} color="#E5C158" /><Text style={styles.tagText}>CULTURE</Text></View>
              <View style={[styles.floatingTag, styles.tagSocial]}><Ionicons name="people" size={14} color="#E5C158" /><Text style={styles.tagText}>YOUR PEOPLE</Text></View>
              <View style={styles.heroCaption}><View style={styles.liveDot} /><Text style={styles.captionText}>10 SCENES · ONE WORLD</Text></View>
            </View>
          </View>
          <View style={styles.copy}>
            <Text style={styles.headline}>Everything you need.</Text>
            <Text style={styles.headlineGold}>One platform.</Text>
            <Text style={styles.description}>Discover your people, music, stories and what’s happening around you.</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity activeOpacity={0.85} style={styles.primary} onPress={() => setMode("up")}>
              <Text style={styles.primaryText}>Get started</Text><Ionicons name="arrow-forward" size={18} color="#11100D" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} style={styles.loginButton} onPress={() => setMode("in")}>
              <Text style={styles.loginText}>I already have an account <Text style={styles.loginStrong}>Log in</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestButton} onPress={onGuest}><Text style={styles.guestText}>Explore as guest</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => setMode("welcome")}><Ionicons name="arrow-back" size={20} color="#F6F5F1" /></TouchableOpacity>
            <View style={styles.authBrand}><Text style={styles.logo}>Kilode<Text style={styles.logoMark}>!</Text></Text></View>
            <Text style={styles.authTitle}>{mode === "in" ? "Welcome back." : "Find your people."}</Text>
            <Text style={styles.authSubtitle}>{mode === "in" ? "Pick up where you left off." : "One account. Your whole world."}</Text>
            {mode === "up" ? (
              <>
                <Text style={styles.label}>ACCOUNT TYPE</Text>
                <View style={styles.kindGrid}>
                  {ACCOUNT_KINDS.map((k) => (
                    <TouchableOpacity key={k.id} style={[styles.kindCell, kind === k.id && styles.kindCellOn]} onPress={() => setKind(k.id)}>
                      <Text style={[styles.kindTitle, kind === k.id && styles.kindTitleOn]}>{k.label}</Text>
                      <Text style={styles.kindHint} numberOfLines={2}>{k.hint}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput style={styles.field} placeholder="Display name (optional)" placeholderTextColor="#77756F" value={name} onChangeText={setName} />
              </>
            ) : null}
            <TextInput style={styles.field} placeholder="Username" placeholderTextColor="#77756F" autoCapitalize="none" autoCorrect={false} value={handle} onChangeText={setHandle} />
            <TextInput style={styles.field} placeholder={mode === "up" ? "Password (8+ characters)" : "Password"} placeholderTextColor="#77756F" secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity activeOpacity={0.85} disabled={busy} style={[styles.primary, busy && { opacity: 0.6 }]} onPress={submit}>
              <Text style={styles.primaryText}>{busy ? "Please wait…" : mode === "in" ? "Log in" : "Create account"}</Text><Ionicons name="arrow-forward" size={18} color="#11100D" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchRow} onPress={() => setMode(mode === "in" ? "up" : "in")}>
              <Text style={styles.switchText}>{mode === "in" ? "New to Kilode? " : "Already have an account? "}<Text style={styles.switchGold}>{mode === "in" ? "Join now" : "Log in"}</Text></Text>
            </TouchableOpacity>
            <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} /></View>
            <TouchableOpacity style={styles.guestOutline} onPress={onGuest}><Text style={styles.guestText}>Continue as guest</Text></TouchableOpacity>
            <Text style={styles.legal}>By continuing, you agree to Kilode’s Terms and Privacy Policy.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const WELCOME_SCENES = [
  "https://videos.pexels.com/video-files/5805069/5805069-uhd_2160_3840_25fps.mp4",
  "https://videos.pexels.com/video-files/9690764/9690764-uhd_2160_3840_30fps.mp4",
  "https://videos.pexels.com/video-files/8027282/8027282-uhd_2160_3840_25fps.mp4",
  "https://videos.pexels.com/video-files/6940477/6940477-uhd_1440_2560_25fps.mp4",
  "https://videos.pexels.com/video-files/12322749/12322749-hd_1080_1920_30fps.mp4",
  "https://videos.pexels.com/video-files/9653700/9653700-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/6940485/6940485-uhd_1440_2560_25fps.mp4",
  "https://videos.pexels.com/video-files/9187818/9187818-hd_1080_1920_25fps.mp4",
  "https://videos.pexels.com/video-files/8929212/8929212-hd_1080_1920_30fps.mp4",
  "https://videos.pexels.com/video-files/9690755/9690755-uhd_2160_3840_30fps.mp4"
];

const GOLD = "#D4AF57";
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0B0D" },
  welcome: { flex: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 8 : 18 },
  topBrand: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo: { color: "#FAF9F6", fontSize: 35, fontWeight: "900", letterSpacing: -2.1, includeFontPadding: false },
  logoMark: { color: GOLD, fontSize: 39, fontWeight: "900", letterSpacing: -2.5 },
  signature: { width: 42, height: 24, justifyContent: "center", alignItems: "flex-end" },
  signatureLine: { width: 34, height: 3, borderRadius: 2, backgroundColor: GOLD, transform: [{ rotate: "-24deg" }] },
  signatureDot: { position: "absolute", right: 0, bottom: 2, width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  heroWrap: { flex: 1, minHeight: 250, maxHeight: 430, marginTop: 10, marginBottom: 24 },
  hero: { flex: 1, borderRadius: 28, overflow: "hidden", justifyContent: "flex-start", backgroundColor: "#211D17" },
  videoMosaic: { ...StyleSheet.absoluteFillObject, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignContent: "space-between", padding: 7, gap: 5 },
  videoTile: { width: "18.7%", height: "48.5%", borderRadius: 8, overflow: "hidden", backgroundColor: "#25221B", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  tileVideo: { width: "100%", height: "100%" },
  tileShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,7,8,0.28)" },
  heroCenterVideo: { position: "absolute", width: "43%", top: "4%", bottom: "4%", left: "28.5%", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.58)", backgroundColor: "#161411", shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 18, elevation: 10 },
  centerVideo: { width: "100%", height: "100%" },
  centerVideoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(7,7,8,0.18)" },
  centerLive: { position: "absolute", top: 10, left: 8, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 7, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(15,15,16,0.78)" },
  centerLiveText: { color: "#F7F4EA", fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  centerCaption: { position: "absolute", bottom: 10, left: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 4 },

  floatingTag: { position: "absolute", top: 18, left: 16, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 20, backgroundColor: "rgba(15,15,16,0.82)", borderWidth: 1, borderColor: "rgba(212,175,87,0.32)" },
  tagMedia: { top: 86, left: undefined, right: 14 },
  tagSocial: { top: undefined, left: 14, bottom: 78 },
  tagText: { color: "#F7F4EA", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  heroCaption: { position: "absolute", left: 16, right: 16, bottom: 16, flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD },
  captionText: { color: "#F7F4EA", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  copy: { marginBottom: 20 },
  headline: { color: "#F7F6F2", fontSize: 31, lineHeight: 36, fontWeight: "800", letterSpacing: -1.15 },
  headlineGold: { color: GOLD, fontSize: 31, lineHeight: 36, fontWeight: "800", letterSpacing: -1.15 },
  description: { color: "#A7A49C", fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 330 },
  actions: { gap: 8 },
  primary: { minHeight: 54, borderRadius: 17, backgroundColor: GOLD, paddingHorizontal: 19, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  primaryText: { color: "#11100D", fontSize: 15, fontWeight: "800" },
  loginButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  loginText: { color: "#A7A49C", fontSize: 13 },
  loginStrong: { color: "#F7F6F2", fontWeight: "800" },
  guestButton: { alignItems: "center", paddingVertical: 6 },
  guestText: { color: "#B8B4AA", fontSize: 13, fontWeight: "650" },
  authContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28 },
  back: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: "#1B1B1D", marginBottom: 22 },
  authBrand: { marginBottom: 26 },
  authTitle: { color: "#F7F6F2", fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -1.2 },
  authSubtitle: { color: "#A7A49C", fontSize: 14, marginTop: 7, marginBottom: 28 },
  label: { color: GOLD, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 9 },
  kindGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  kindCell: { width: "48%", flexGrow: 1, borderWidth: 1, borderColor: "#303033", backgroundColor: "#151517", borderRadius: 14, padding: 11 },
  kindCellOn: { borderColor: GOLD, backgroundColor: "rgba(212,175,87,0.09)" },
  kindTitle: { color: "#F7F6F2", fontSize: 12, fontWeight: "750" },
  kindTitleOn: { color: GOLD },
  kindHint: { color: "#858178", fontSize: 10, marginTop: 4, lineHeight: 13 },
  field: { minHeight: 54, borderRadius: 15, borderWidth: 1, borderColor: "#303033", backgroundColor: "#151517", paddingHorizontal: 16, color: "#F7F6F2", fontSize: 15, marginBottom: 12 },
  switchRow: { alignItems: "center", paddingVertical: 17 },
  switchText: { color: "#A7A49C", fontSize: 13 },
  switchGold: { color: GOLD, fontWeight: "800" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 5 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2B2B2E" },
  dividerText: { color: "#68665F", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  guestOutline: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: "#38383B", alignItems: "center", justifyContent: "center", marginTop: 14 },
  legal: { textAlign: "center", fontSize: 10, lineHeight: 15, color: "#69675F", marginTop: 18 },
});
