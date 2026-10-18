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
} from "react-native";
import { API_BASE } from "../lib/config";

type Props = {
  isDark: boolean;
  C: any;
  onSignIn: (handle: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
  onGoogle: () => void;
  show: (m: string) => void;
};

export function AuthScreen({ isDark, C, onSignIn, onGuest, onGoogle, show }: Props) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#0A0A0C" },
    bg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#0A0A0C",
    },
    // Warm Lagos-night gradient stand-in until danfo photo is bundled as asset
    glow: {
      position: "absolute",
      top: -80,
      left: -40,
      right: -40,
      height: 420,
      backgroundColor: "#1a1208",
      opacity: 0.9,
    },
    glow2: {
      position: "absolute",
      top: 80,
      left: 40,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "#3B82F6",
      opacity: 0.08,
    },
    content: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingHorizontal: 22,
      paddingBottom: 36,
      paddingTop: 48,
    },
    logoWrap: { alignItems: "center", marginBottom: 28 },
    logoMark: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.06)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    logoMarkText: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -1 },
    logoWord: { fontSize: 34, fontWeight: "800", color: "#fff", letterSpacing: -1.2 },
    logoBang: { color: "#3B82F6" },
    tagline: { marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: "500" },
    card: {
      backgroundColor: "rgba(24,24,27,0.94)",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 16,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: "#121214",
      borderRadius: 12,
      padding: 3,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#2A2A30",
    },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    tabOn: { backgroundColor: "#222226" },
    tabText: { fontSize: 13, fontWeight: "600", color: "#71717A" },
    tabTextOn: { color: "#F4F4F5" },
    title: { fontSize: 20, fontWeight: "700", color: "#F4F4F5", letterSpacing: -0.3 },
    hint: { fontSize: 13, color: "#A1A1AA", marginTop: 4, marginBottom: 16, lineHeight: 18 },
    google: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      paddingVertical: 14,
      marginBottom: 12,
    },
    googleText: { color: "#0A0A0C", fontWeight: "700", fontSize: 14 },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#2A2A30" },
    dividerText: { fontSize: 12, fontWeight: "600", color: "#52525B" },
    field: {
      backgroundColor: "#121214",
      borderWidth: 1,
      borderColor: "#2A2A30",
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: "#F4F4F5",
      fontSize: 15,
      marginBottom: 10,
    },
    primary: {
      backgroundColor: "#2563EB",
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 4,
    },
    primaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16 },
    switchMuted: { fontSize: 13, color: "#A1A1AA" },
    switchLink: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
    legal: { textAlign: "center", fontSize: 11, color: "#52525B", marginTop: 12, lineHeight: 16 },
    guest: { alignItems: "center", marginTop: 14 },
    guestText: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
    api: { textAlign: "center", fontSize: 10, color: "#3f3f46", marginTop: 10 },
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bg} />
      <View style={styles.glow} />
      <View style={styles.glow2} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>K!</Text>
            </View>
            <Text style={styles.logoWord}>
              Kilode<Text style={styles.logoBang}>!</Text>
            </Text>
            <Text style={styles.tagline}>Talk News. Real People.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === "in" && styles.tabOn]}
                onPress={() => setMode("in")}
              >
                <Text style={[styles.tabText, mode === "in" && styles.tabTextOn]}>Sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === "up" && styles.tabOn]}
                onPress={() => setMode("up")}
              >
                <Text style={[styles.tabText, mode === "up" && styles.tabTextOn]}>Create account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{mode === "in" ? "Welcome back" : "Join Kilode"}</Text>
            <Text style={styles.hint}>
              {mode === "in" ? "Sign in to your Lagos city OS" : "Create your handle · free forever"}
            </Text>

            <TouchableOpacity
              style={styles.google}
              onPress={() => {
                onGoogle();
                show("Google · wire OAuth next");
              }}
              activeOpacity={0.9}
            >
              <Text style={{ fontSize: 16 }}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {mode === "up" ? (
              <TextInput
                style={styles.field}
                placeholder="Display name"
                placeholderTextColor="#71717A"
                value={name}
                onChangeText={setName}
              />
            ) : null}
            <TextInput
              style={styles.field}
              placeholder="Handle or email"
              placeholderTextColor="#71717A"
              autoCapitalize="none"
              value={handle}
              onChangeText={setHandle}
            />
            <TextInput
              style={styles.field}
              placeholder="Password"
              placeholderTextColor="#71717A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.primary, { opacity: busy ? 0.7 : 1 }]}
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                const r = await onSignIn(handle || name || "you", password || "x");
                setBusy(false);
                if (!r.ok) show(r.error || "Failed");
                else show(mode === "up" ? "Account ready" : "Welcome");
              }}
            >
              <Text style={styles.primaryText}>
                {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchMuted}>
                {mode === "in" ? "New here?" : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setMode(mode === "in" ? "up" : "in")}>
                <Text style={styles.switchLink}>
                  {mode === "in" ? "Create account" : "Sign in"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.legal}>By continuing you agree to Kilode Terms & Privacy</Text>

            <TouchableOpacity style={styles.guest} onPress={onGuest}>
              <Text style={styles.guestText}>Continue as guest</Text>
            </TouchableOpacity>
            <Text style={styles.api}>{API_BASE}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
