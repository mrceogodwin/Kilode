import React, { useEffect, useRef, useState } from "react";
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
  Animated,
  Easing,
} from "react-native";
import { API_BASE } from "../lib/config";
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

export function AuthScreen({ onSignIn, onSignUp, onGuest, onGoogle, show }: Props) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind>("member");
  const [busy, setBusy] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.12,
          duration: 11000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 11000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.bgPlate, { transform: [{ scale }] }]}>
          <View style={styles.warmBlob} />
          <View style={styles.blueBlob} />
          <View style={styles.amberBlob} />
        </Animated.View>
        <View style={styles.veil} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, mode === "in" && styles.tabOn]} onPress={() => setMode("in")}>
                <Text style={[styles.tabText, mode === "in" && styles.tabTextOn]}>Sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, mode === "up" && styles.tabOn]} onPress={() => setMode("up")}>
                <Text style={[styles.tabText, mode === "up" && styles.tabTextOn]}>Create account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{mode === "in" ? "Welcome back" : "Join Kilode"}</Text>
            <Text style={styles.hint}>
              {mode === "in" ? "Sign in to continue" : "Choose account type · username + password"}
            </Text>

            <TouchableOpacity
              style={styles.google}
              onPress={() => {
                onGoogle();
                show("Google · wire OAuth next");
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {mode === "up" ? (
              <>
                <Text style={styles.kindLabel}>Account type</Text>
                <View style={styles.kindGrid}>
                  {ACCOUNT_KINDS.map((k) => (
                    <TouchableOpacity
                      key={k.id}
                      style={[styles.kindCell, kind === k.id && styles.kindCellOn]}
                      onPress={() => setKind(k.id)}
                    >
                      <Text style={[styles.kindTitle, kind === k.id && styles.kindTitleOn]}>{k.label}</Text>
                      <Text style={styles.kindHint} numberOfLines={2}>
                        {k.hint}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.field}
                  placeholder="Display name (optional)"
                  placeholderTextColor="#71717A"
                  value={name}
                  onChangeText={setName}
                />
              </>
            ) : null}

            <TextInput
              style={styles.field}
              placeholder="Username"
              placeholderTextColor="#71717A"
              autoCapitalize="none"
              value={handle}
              onChangeText={setHandle}
            />
            <TextInput
              style={styles.field}
              placeholder={mode === "up" ? "Password (8+)" : "Password"}
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
                if (mode === "up") {
                  const r = await onSignUp(handle, password, kind, name || undefined);
                  setBusy(false);
                  if (!r.ok) show(r.error || "Failed");
                  else show(`Welcome · ${kind}`);
                } else {
                  const r = await onSignIn(handle, password);
                  setBusy(false);
                  if (!r.ok) show(r.error || "Failed");
                  else show("Welcome");
                }
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A0C" },
  bgPlate: { ...StyleSheet.absoluteFillObject, backgroundColor: "#120e0a" },
  warmBlob: {
    position: "absolute",
    top: 40,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#c27a2e",
    opacity: 0.28,
  },
  blueBlob: {
    position: "absolute",
    top: 160,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#2563EB",
    opacity: 0.12,
  },
  amberBlob: {
    position: "absolute",
    bottom: 200,
    left: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ea580c",
    opacity: 0.12,
  },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,10,12,0.5)" },
  content: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 36,
    paddingTop: 48,
  },
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  googleG: { fontSize: 16, fontWeight: "800", color: "#4285F4", marginRight: 10 },
  googleText: { color: "#0A0A0C", fontWeight: "700", fontSize: 14 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2A2A30" },
  dividerText: { fontSize: 12, fontWeight: "600", color: "#52525B", marginHorizontal: 12 },
  kindLabel: { fontSize: 12, fontWeight: "700", color: "#A1A1AA", marginBottom: 8 },
  kindGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  kindCell: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#2A2A30",
    backgroundColor: "#121214",
    borderRadius: 12,
    padding: 10,
  },
  kindCellOn: { borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.12)" },
  kindTitle: { fontSize: 12, fontWeight: "700", color: "#F4F4F5" },
  kindTitleOn: { color: "#93C5FD" },
  kindHint: { fontSize: 10, color: "#71717A", marginTop: 3, lineHeight: 13 },
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
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  switchMuted: { fontSize: 13, color: "#A1A1AA", marginRight: 6 },
  switchLink: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
  legal: { textAlign: "center", fontSize: 11, color: "#52525B", marginTop: 12, lineHeight: 16 },
  guest: { alignItems: "center", marginTop: 14 },
  guestText: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
  api: { textAlign: "center", fontSize: 10, color: "#3f3f46", marginTop: 10 },
});
