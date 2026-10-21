import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { ACCOUNT_KINDS, type AccountKind } from "../lib/accountKinds";

type Props = {
  isDark: boolean;
  C: any;
  onSignIn: (handle: string, password: string, kind?: AccountKind) => Promise<{ ok: boolean; error?: string }>;
  onSignUp: (handle: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
  show: (m: string) => void;
};

export function AuthScreen({ onSignIn, onSignUp, onGuest, show }: Props) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const openLegal = (url: string, label: string) => {
    Linking.openURL(url).catch(() => show(`${label} is not available right now.`));
  };
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
          <View style={styles.goldBlob} />
          <View style={styles.amberBlob} />
        </Animated.View>
        <View style={styles.veil} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: mode === "in" }} style={[styles.tab, mode === "in" && styles.tabOn]} onPress={() => setMode("in")}>
                <Text style={[styles.tabText, mode === "in" && styles.tabTextOn]}>Sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: mode === "up" }} style={[styles.tab, mode === "up" && styles.tabOn]} onPress={() => setMode("up")}>
                <Text style={[styles.tabText, mode === "up" && styles.tabTextOn]}>Create account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{mode === "in" ? "Welcome back" : "Join Kilode"}</Text>
            <Text style={styles.hint}>
              {mode === "in" ? "Sign in to continue" : "Choose account type · username + password"}
            </Text>

            {mode === "up" ? (
              <>
                <Text style={styles.kindLabel}>Account type</Text>
                <View style={styles.kindGrid}>
                  {ACCOUNT_KINDS.map((k) => (
                    <TouchableOpacity
                      key={k.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${k.label} account type`}
                      accessibilityState={{ selected: kind === k.id }}
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
                  accessibilityLabel="Display name, optional"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  placeholder="Display name (optional)"
                  placeholderTextColor="#71717A"
                  value={name}
                  onChangeText={setName}
                />
              </>
            ) : null}

            <TextInput
              style={styles.field}
              accessibilityLabel="Username"
              autoComplete="username"
              textContentType="username"
              autoCorrect={false}
              returnKeyType="next"
              placeholder="Username"
              placeholderTextColor="#71717A"
              autoCapitalize="none"
              value={handle}
              onChangeText={setHandle}
            />
            <TextInput
              style={styles.field}
              accessibilityLabel={mode === "up" ? "Create password, at least 8 characters" : "Password"}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              textContentType={mode === "up" ? "newPassword" : "password"}
              returnKeyType="go"
              placeholder={mode === "up" ? "Password (8+)" : "Password"}
              placeholderTextColor="#71717A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={mode === "in" ? "Sign in to Kilode" : "Create Kilode account"}
              style={[styles.primary, { opacity: busy ? 0.7 : 1 }]}
              disabled={busy}
              onPress={async () => {
                if (busy) return;
                setBusy(true);
                try {
                  const r = mode === "up"
                    ? await onSignUp(handle, password, kind, name || undefined)
                    : await onSignIn(handle, password);
                  if (!r.ok) show(r.error || "Authentication failed");
                  else show(mode === "up" ? `Welcome · ${kind}` : "Welcome");
                } catch {
                  show("Kilode could not complete authentication. Please try again.");
                } finally {
                  setBusy(false);
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

            <View style={styles.legalRow}>
              <Text style={styles.legal}>By continuing you agree to Kilode </Text>
              <Text accessibilityRole="link" onPress={() => openLegal("https://kilode.ng/terms", "Terms of use")} style={styles.legalLink}>Terms</Text>
              <Text style={styles.legal}> & </Text>
              <Text accessibilityRole="link" onPress={() => openLegal("https://kilode.ng/privacy", "Privacy policy")} style={styles.legalLink}>Privacy</Text>
              <Text style={styles.legal}>.</Text>
            </View>

            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Continue as guest" style={styles.guest} onPress={onGuest}>
              <Text style={styles.guestText}>Continue as guest</Text>
            </TouchableOpacity>
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
    backgroundColor: "#D4AF37",
    opacity: 0.16,
  },
  goldBlob: {
    position: "absolute",
    top: 160,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#E5C158",
    opacity: 0.10,
  },
  amberBlob: {
    position: "absolute",
    bottom: 200,
    left: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#8F6D24",
    opacity: 0.10,
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
  kindCellOn: { borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.10)" },
  kindTitle: { fontSize: 12, fontWeight: "700", color: "#F4F4F5" },
  kindTitleOn: { color: "#E5C158" },
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
    backgroundColor: "#D4AF37",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: { color: "#0D0D10", fontWeight: "800", fontSize: 15 },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  switchMuted: { fontSize: 13, color: "#A1A1AA", marginRight: 6 },
  switchLink: { fontSize: 13, fontWeight: "600", color: "#E5C158" },
  legalRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: 12 },
  legal: { textAlign: "center", fontSize: 11, color: "#52525B", lineHeight: 16 },
  legalLink: { fontSize: 11, color: "#E5C158", textDecorationLine: "underline", lineHeight: 16 },
  guest: { alignItems: "center", marginTop: 14 },
  guestText: { fontSize: 13, fontWeight: "600", color: "#E5C158" },
});
