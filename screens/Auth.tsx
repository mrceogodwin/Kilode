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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ACCOUNT_GROUPS, ACCOUNT_KINDS, type AccountKind } from "../lib/accountKinds";
import { KilodeWordmark } from "../components/KilodeWordmark";

const GOLD = "#E5C158";

type Props = {
  isDark: boolean;
  C: any;
  onSignIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  onSignUp: (handle: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
  onGoogle: () => void;
  show: (m: string) => void;
};

const FLOAT = [
  {
    key: "music",
    title: "Music",
    sub: "New sounds. New vibes.",
    icon: "musical-notes" as const,
    style: { top: "12%" as const, left: 12 },
    thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80",
  },
  {
    key: "socials",
    title: "Socials",
    sub: "Connect. Share. Belong.",
    icon: "people" as const,
    style: { top: "18%" as const, right: 12 },
    thumb: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&q=80",
  },
  {
    key: "media",
    title: "Media",
    sub: "Real stories. Fresh takes.",
    icon: "newspaper" as const,
    style: { bottom: "22%" as const, left: 12 },
    thumb: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&q=80",
  },
  {
    key: "events",
    title: "Events",
    sub: "Be there. Feel it.",
    icon: "calendar" as const,
    style: { bottom: "16%" as const, right: 12 },
    thumb: "https://images.unsplash.com/photo-1459749411175-047fc749d9b0?w=200&q=80",
  },
];

export function AuthScreen({ onSignIn, onSignUp, onGuest, show }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 760;
  const [mode, setMode] = useState<"welcome" | "in" | "up">("welcome");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (mode === "up" && !kind) {
      show("Choose the Kilode system you want to join.");
      return;
    }
    if (!handle.trim() || !password) {
      show("Enter your username and password.");
      return;
    }
    setBusy(true);
    try {
      const result =
        mode === "up"
          ? await onSignUp(handle.trim(), password, kind as AccountKind, name.trim() || undefined)
          : await onSignIn(handle.trim(), password);
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
        <View style={styles.welcome}>
          <View style={styles.logoWrap}>
            <KilodeWordmark size="large" />
          </View>

          <View style={[styles.hero, compact && { height: 280 }]}>
            {/* Soft gold arcs */}
            <View style={styles.arc} />
            {/* Center portrait placeholder matching brand mood */}
            <View style={styles.portrait}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80",
                }}
                style={styles.portraitImg}
                resizeMode="cover"
              />
              <View style={styles.portraitFade} />
            </View>

            {FLOAT.map((f) => (
              <View key={f.key} style={[styles.floatCard, f.style as any]}>
                <View style={styles.floatHead}>
                  <Ionicons name={f.icon} size={12} color={GOLD} />
                  <Text style={styles.floatTitle}>{f.title}</Text>
                </View>
                <Text style={styles.floatSub}>{f.sub}</Text>
                <Image source={{ uri: f.thumb }} style={styles.floatThumb} resizeMode="cover" />
              </View>
            ))}
          </View>

          <View style={styles.copy}>
            <Text style={styles.headline}>Everything You Need.</Text>
            <Text style={styles.headlineGold}>One Platform.</Text>
            <Text style={styles.body}>
              Discover, create, connect and be part of something bigger. Kilode brings your world together in one place.
            </Text>
          </View>

          <TouchableOpacity style={styles.cta} onPress={() => setMode("up")} activeOpacity={0.9}>
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode("in")} style={styles.loginRow}>
            <Text style={styles.loginMuted}>
              Already have an account? <Text style={styles.loginLink}>Log In</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onGuest} style={{ marginTop: 10 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textAlign: "center" }}>Continue as guest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.formPad} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setMode("welcome")} style={{ marginBottom: 16 }}>
            <Text style={{ color: GOLD, fontWeight: "600" }}>‹ Back</Text>
          </TouchableOpacity>
          <KilodeWordmark size="medium" />
          <Text style={styles.formTitle}>{mode === "up" ? "Create account" : "Welcome back"}</Text>
          <Text style={styles.formSub}>
            {mode === "up" ? "Choose your path on Kilode" : "Sign in to continue"}
          </Text>

          {mode === "up" ? (
            <>
              <Text style={styles.label}>Account type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {ACCOUNT_KINDS.map((k) => (
                  <TouchableOpacity
                    key={k.id}
                    onPress={() => setKind(k.id)}
                    style={[styles.kindChip, kind === k.id && styles.kindChipOn]}
                  >
                    <Text style={[styles.kindText, kind === k.id && styles.kindTextOn]}>{k.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            placeholder="@handle"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={handle}
            onChangeText={setHandle}
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

          <TouchableOpacity style={[styles.cta, { marginTop: 20, opacity: busy ? 0.6 : 1 }]} onPress={submit} disabled={busy}>
            <Text style={styles.ctaText}>{busy ? "Please wait…" : mode === "up" ? "Create account" : "Log In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(mode === "up" ? "in" : "up")}
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
  root: { flex: 1, backgroundColor: "#0A0A0B" },
  welcome: { flex: 1, paddingHorizontal: 20, paddingBottom: 12 },
  logoWrap: { alignItems: "center", paddingTop: 8, marginBottom: 4 },
  hero: {
    height: 340,
    marginTop: 4,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  arc: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: "rgba(229,193,88,0.18)",
  },
  portrait: {
    width: 200,
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1510",
  },
  portraitImg: { width: "100%", height: "100%" },
  portraitFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,11,0.15)",
  },
  floatCard: {
    position: "absolute",
    width: 132,
    backgroundColor: "rgba(22,20,18,0.92)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(229,193,88,0.22)",
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  floatHead: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 },
  floatTitle: { color: "#fff", fontSize: 12, fontWeight: "800" },
  floatSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginBottom: 6 },
  floatThumb: { width: "100%", height: 48, borderRadius: 8, backgroundColor: "#222" },
  copy: { alignItems: "center", paddingHorizontal: 8, marginTop: 4 },
  headline: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  headlineGold: {
    color: GOLD,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
    marginTop: 2,
  },
  body: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 12,
  },
  cta: {
    marginTop: 20,
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: { color: "#111", fontSize: 16, fontWeight: "800" },
  loginRow: { marginTop: 16, alignItems: "center" },
  loginMuted: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  loginLink: { color: GOLD, fontWeight: "700" },
  formPad: { padding: 20, paddingBottom: 40 },
  formTitle: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 16 },
  formSub: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 6, marginBottom: 18 },
  label: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
  },
  kindChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginRight: 8,
  },
  kindChipOn: { borderColor: GOLD, backgroundColor: "rgba(229,193,88,0.12)" },
  kindText: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: "600" },
  kindTextOn: { color: GOLD },
});
