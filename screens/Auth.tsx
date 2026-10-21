import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { ACCOUNT_GROUPS, ACCOUNT_KINDS, type AccountKind } from "../lib/accountKinds";
import { KilodeWordmark } from "../components/KilodeWordmark";

const ACCENT = "#D4AF37";

type Props = {
  isDark: boolean;
  C: any;
  onSignIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  onSignUp: (handle: string, password: string, kind: AccountKind, displayName?: string, emailAddress?: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
  onGoogle: () => void;
  hasSession?: boolean;
  onContinue?: () => void;
  show: (m: string) => void;
};

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
const WELCOME_FALLBACK = WELCOME_SCENES[0];

function WelcomeScene({ source, index }: { source: string; index: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={styles.sceneTile}>
      <Video
        source={{ uri: failed ? WELCOME_FALLBACK : source }}
        style={styles.sceneVideo}
        resizeMode={ResizeMode.COVER}
        isMuted
        shouldPlay
        isLooping
        useNativeControls={false}
        progressUpdateIntervalMillis={1000}
        onError={() => { if (!failed) setFailed(true); }}
        accessible
        accessibilityLabel={`Kilode culture scene ${index + 1}`}
      />
      <View pointerEvents="none" style={styles.sceneShade} />
    </View>
  );
}

const FLOAT = [
  { key: "music", title: "Music", sub: "New sounds", icon: "musical-notes" as const, style: { top: "12%" as const, left: 12 } },
  { key: "socials", title: "Socials", sub: "Real people", icon: "people" as const, style: { top: "18%" as const, right: 12 } },
  { key: "media", title: "Media", sub: "Stories", icon: "newspaper" as const, style: { bottom: "22%" as const, left: 16 } },
  { key: "events", title: "Events", sub: "What's on", icon: "calendar" as const, style: { bottom: "16%" as const, right: 16 } },
];

export function AuthScreen({ onSignIn, onSignUp, onGuest, onGoogle, show, hasSession = false, onContinue }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 760;
  // Multi-step: welcome → pick account type → credentials
  const [mode, setMode] = useState<"welcome" | "kind" | "in" | "up">("welcome");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (mode === "up" && !kind) {
      show("Choose the account type that matches how you'll use Kilode.");
      setMode("kind");
      return;
    }
    if (!handle.trim() || !password) {
      show(mode === "in" ? "Enter your email address and password." : "Enter your username and password.");
      return;
    }
    setBusy(true);
    try {
      const result =
        mode === "up"
          ? await onSignUp(handle.trim(), password, kind as AccountKind, name.trim() || undefined, email.trim())
          : await onSignIn(handle.trim(), password, kind || undefined);
      if (!result.ok) show(result.error || "Something went wrong. Try again.");
      else show(mode === "up" ? `Welcome to Kilode · ${kind}` : "Welcome back");
    } catch {
      show("Could not connect. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "welcome") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.welcome} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.logoWrap}>
            <KilodeWordmark size="large" />
          </View>

          <View style={[styles.hero, compact && { height: 240 }]}>
            <View style={styles.arc} />
            <View style={styles.sceneGrid}>
              {WELCOME_SCENES.slice(1).map((source, index) => (
                <WelcomeScene key={`welcome-scene-${index}`} source={source} index={index} />
              ))}
            </View>
            <View style={styles.sceneHero}>
              <Video
                source={{ uri: WELCOME_SCENES[0] }}
                style={styles.sceneHeroVideo}
                resizeMode={ResizeMode.COVER}
                isMuted
                shouldPlay
                isLooping
                useNativeControls={false}
                onError={() => show("Welcome videos are loading slowly. Check your connection and try again.")}
                accessibilityLabel="Kilode welcome culture video"
              />
              <View pointerEvents="none" style={styles.sceneHeroShade} />
              <View pointerEvents="none" style={styles.sceneHeroLabel}>
                <Text style={styles.sceneHeroEyebrow}>● LIVE CULTURE</Text>
                <Text style={styles.sceneHeroCount}>01 / 10</Text>
              </View>
            </View>
            {FLOAT.map((f) => (
              <View key={f.key} style={[styles.floatCard, f.style as any]}>
                <View style={styles.floatHead}>
                  <Ionicons name={f.icon} size={12} color={ACCENT} />
                  <Text style={styles.floatTitle}>{f.title}</Text>
                </View>
                <Text style={styles.floatSub}>{f.sub}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.tagline}>Talk News. Real People.</Text>
          <Text style={styles.tagSub}>Media · Music · Socials · Opportunity</Text>

          <TouchableOpacity
            style={styles.cta}
            onPress={() => {
              if (hasSession) {
                onContinue?.();
                return;
              }
              setKind(null);
              setMode("kind");
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaText}>{hasSession ? "Continue to Kilode" : "Get Started"}</Text>
          </TouchableOpacity>

          {!hasSession ? (
            <>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode("in")} activeOpacity={0.85}>
                <Text style={styles.secondaryText}>I already have an account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.guestBtn} onPress={onGuest}>
                <Text style={styles.guestText}>Continue as guest</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.googleBtn} onPress={onGoogle}>
                <Ionicons name="logo-google" size={16} color="#fff" />
                <Text style={styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: choose account type (required before credentials on sign-up)
  if (mode === "kind") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.formPad} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setMode("welcome")} style={{ marginBottom: 12 }}>
            <Text style={{ color: ACCENT, fontWeight: "600" }}>‹ Back</Text>
          </TouchableOpacity>
          <KilodeWordmark size="medium" />
          <Text style={styles.formTitle}>Choose your path</Text>
          <Text style={styles.formSub}>This sets your tools on Kilode. You can change it later in Settings when the server supports it.</Text>

          {ACCOUNT_GROUPS.map((group) => (
            <View key={group.title} style={{ marginBottom: 12 }}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.kinds.map((id) => {
                const k = ACCOUNT_KINDS.find((x) => x.id === id)!;
                const on = kind === k.id;
                return (
                  <TouchableOpacity
                    key={k.id}
                    onPress={() => setKind(k.id)}
                    style={[styles.kindRow, on && styles.kindRowOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.kindRowLabel, on && { color: ACCENT }]}>{k.label}</Text>
                      <Text style={styles.kindRowHint}>{k.hint}</Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.cta, { opacity: kind ? 1 : 0.45, marginTop: 8 }]}
            disabled={!kind}
            onPress={() => {
              if (!kind) {
                show("Select an account type to continue.");
                return;
              }
              setMode("up");
            }}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.formPad} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() => setMode(mode === "up" ? "kind" : "welcome")}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ color: ACCENT, fontWeight: "600" }}>‹ Back</Text>
          </TouchableOpacity>
          <KilodeWordmark size="medium" />
          <Text style={styles.formTitle}>{mode === "up" ? "Create account" : "Welcome back"}</Text>
          <Text style={styles.formSub}>
            {mode === "up"
              ? kind
                ? `Account type: ${ACCOUNT_KINDS.find((k) => k.id === kind)?.label || kind}`
                : "Complete your profile"
              : "Sign in to continue"}
          </Text>

          {mode === "up" ? (
            <>
              <Text style={styles.label}>Display name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={name}
                onChangeText={setName}
              />
            </>
          ) : null}

          {mode === "up" ? (
            <>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={email}
                onChangeText={setEmail}
              />
            </>
          ) : null}
          <Text style={styles.label}>{mode === "in" ? "Email address" : "Username"}</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={mode === "in" ? "email-address" : "default"}
            textContentType={mode === "in" ? "emailAddress" : "username"}
            autoComplete={mode === "in" ? "email" : "username"}
            placeholder={mode === "in" ? "you@example.com" : "@handle"}
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={handle}
            onChangeText={setHandle}
            returnKeyType="next"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.cta, { opacity: busy ? 0.6 : 1, marginTop: 8 }]}
            onPress={submit}
            disabled={busy}
          >
            <Text style={styles.ctaText}>{busy ? "Please wait…" : mode === "up" ? "Create account" : "Log In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (mode === "up") setMode("in");
              else {
                setKind(null);
                setMode("kind");
              }
            }}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={styles.loginMuted}>
              {mode === "up" ? "Already have an account? " : "New here? "}
              <Text style={styles.loginLink}>{mode === "up" ? "Log In" : "Get Started"}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D10" },
  welcome: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 16 },
  logoWrap: { alignItems: "center", marginTop: 8, marginBottom: 8 },
  hero: {
    height: 300,
    borderRadius: 24,
    backgroundColor: "#18181C",
    overflow: "hidden",
    marginBottom: 18,
  },
  arc: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)",
    top: -40,
    alignSelf: "center",
    left: "50%",
    marginLeft: -140,
  },
  sceneGrid: {
    ...StyleSheet.absoluteFillObject,
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    alignContent: "stretch",
    opacity: 0.82,
  },
  sceneTile: {
    width: "31.5%",
    height: "32%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#242329",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sceneVideo: { width: "100%", height: "100%" },
  sceneShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,16,0.18)",
  },
  sceneHero: {
    position: "absolute",
    zIndex: 2,
    width: 112,
    height: 190,
    top: "50%",
    left: "50%",
    marginLeft: -56,
    marginTop: -95,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
    backgroundColor: "#18181C",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  sceneHeroVideo: { width: "100%", height: "100%" },
  sceneHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,16,0.16)",
  },
  sceneHeroLabel: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sceneHeroEyebrow: { color: "#fff", fontSize: 7, fontWeight: "800", letterSpacing: 0.3 },
  sceneHeroCount: { color: "#fff", fontSize: 7, fontWeight: "800" },
  floatCard: {
    position: "absolute",
    backgroundColor: "rgba(20,20,24,0.92)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(230,169,74,0.24)",
    maxWidth: 130,
  },
  floatHead: { flexDirection: "row", alignItems: "center", gap: 4 },
  floatTitle: { color: "#fff", fontWeight: "800", fontSize: 11 },
  floatSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 },
  tagline: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  tagSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  cta: {
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: "#111", fontWeight: "800", fontSize: 16 },
  secondaryBtn: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  secondaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  guestBtn: { marginTop: 12, alignItems: "center" },
  guestText: { color: "rgba(255,255,255,0.55)", fontWeight: "600", fontSize: 13 },
  googleBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  googleText: { color: "rgba(255,255,255,0.75)", fontWeight: "600", fontSize: 13 },
  formPad: { padding: 20, paddingBottom: 48 },
  formTitle: { color: "#fff", fontSize: 21, fontWeight: "700", marginTop: 12 },
  formSub: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  label: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },
  groupTitle: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  kindRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 8,
  },
  kindRowOn: {
    borderColor: ACCENT,
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  kindRowLabel: { color: "#fff", fontWeight: "700", fontSize: 14 },
  kindRowHint: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2, lineHeight: 16 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: ACCENT },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    fontSize: 15,
    marginBottom: 12,
  },
  loginMuted: { color: "rgba(255,255,255,0.45)", fontSize: 13 },
  loginLink: { color: ACCENT, fontWeight: "700" },
});
