import React, { useEffect, useState } from "react";
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

export function AuthScreen({ onSignIn, onSignUp, onGuest, show }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const compactWelcome = windowHeight < 760;
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

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      {mode === "welcome" ? (
        <View style={[styles.welcomeRef, compactWelcome && { paddingTop: 4 }]}>
          <View style={styles.refLogoWrap}>
            <KilodeWordmark size="large" />
          </View>

          <View style={[styles.refHero, compactWelcome && { minHeight: 220 }]}>
            <View style={[styles.floatCard, styles.floatTL]}>
              <Text style={styles.floatTitle}>♪  Music</Text>
              <Text style={styles.floatSub}>New sounds. New vibes.</Text>
            </View>
            <View style={[styles.floatCard, styles.floatTR]}>
              <Text style={styles.floatTitle}>👤  Socials</Text>
              <Text style={styles.floatSub}>Connect. Share. Belong.</Text>
            </View>
            <View style={[styles.floatCard, styles.floatBL]}>
              <Text style={styles.floatTitle}>▣  Media</Text>
              <Text style={styles.floatSub}>Real stories. Fresh takes.</Text>
            </View>
            <View style={[styles.floatCard, styles.floatBR]}>
              <Text style={styles.floatTitle}>📅  Events</Text>
              <Text style={styles.floatSub}>Be there. Feel it.</Text>
            </View>
            <View style={[styles.refPortrait, compactWelcome && { height: 200, width: 170 }]}>
              <View style={styles.refPortraitInner}>
                <Ionicons name="person" size={64} color="rgba(229,193,88,0.35)" />
              </View>
            </View>
          </View>

          <View style={styles.refCopy}>
            <Text style={styles.refHeadline}>Everything You Need.</Text>
            <Text style={styles.refHeadlineGold}>One Platform.</Text>
            <Text style={styles.refBody}>
              Discover, create, connect and be part of something bigger.
            </Text>
          </View>

          <TouchableOpacity style={styles.refCta} onPress={() => setMode("up")} activeOpacity={0.9}>
            <Text style={styles.refCtaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode("in")} style={styles.refLoginRow}>
            <Text style={styles.refLogin}>
              Already have an account? <Text style={styles.refLoginLink}>Log In</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGuest} style={{ marginTop: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textAlign: "center" }}>
              Continue as guest
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => setMode("welcome")}>
              <Ionicons name="arrow-back" size={20} color="#F6F5F1" />
            </TouchableOpacity>
            <View style={styles.authBrand}>
              <KilodeWordmark size="medium" />
            </View>
            <Text style={styles.authTitle}>{mode === "in" ? "Welcome back." : "Find your people."}</Text>
            <Text style={styles.authSubtitle}>
              {mode === "in" ? "Pick up where you left off." : "One account. Your whole world."}
            </Text>
            {mode === "up" ? (
              <>
                <Text style={styles.label}>YOUR KILODE ACCOUNT</Text>
                <Text style={styles.kindIntro}>Choose the system you’re joining.</Text>
                {ACCOUNT_GROUPS.map((group) => (
                  <View key={group.title} style={styles.kindGroup}>
                    <Text style={styles.kindGroupTitle}>{group.title}</Text>
                    <View style={styles.kindGrid}>
                      {group.kinds.map((id) => {
                        const k = ACCOUNT_KINDS.find((item) => item.id === id)!;
                        const selected = kind === k.id;
                        return (
                          <TouchableOpacity
                            key={k.id}
                            style={[styles.kindCell, selected && styles.kindCellOn]}
                            onPress={() => setKind(k.id)}
                          >
                            <View style={styles.kindHeading}>
                              <Text style={[styles.kindTitle, selected && styles.kindTitleOn]} numberOfLines={1}>
                                {k.label}
                              </Text>
                              <View style={[styles.kindRadio, selected && styles.kindRadioOn]}>
                                {selected ? <View style={styles.kindRadioDot} /> : null}
                              </View>
                            </View>
                            <Text style={styles.kindHint} numberOfLines={2}>
                              {k.hint}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
                <TextInput
                  style={styles.field}
                  placeholder="Display name"
                  placeholderTextColor="#68665F"
                  value={name}
                  onChangeText={setName}
                />
              </>
            ) : null}
            <TextInput
              style={styles.field}
              placeholder="Username or email"
              placeholderTextColor="#68665F"
              autoCapitalize="none"
              value={handle}
              onChangeText={setHandle}
            />
            <TextInput
              style={styles.field}
              placeholder="Password"
              placeholderTextColor="#68665F"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={[styles.refCta, { opacity: busy ? 0.6 : 1 }]}
              disabled={busy}
              onPress={submit}
            >
              <Text style={styles.refCtaText}>{busy ? "Please wait…" : mode === "in" ? "Log In" : "Create account"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchRow}
              onPress={() => setMode(mode === "in" ? "up" : "in")}
            >
              <Text style={styles.switchText}>
                {mode === "in" ? "New here? " : "Have an account? "}
                <Text style={styles.switchGold}>{mode === "in" ? "Sign up" : "Log in"}</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0B0F" },
  welcomeRef: {
    flex: 1,
    backgroundColor: "#0A0A0C",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
  },
  refLogoWrap: { alignItems: "center", marginTop: 8, marginBottom: 8 },
  refHero: { flex: 1, minHeight: 260, justifyContent: "center", alignItems: "center" },
  refPortrait: {
    width: 200,
    height: 240,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1A1510",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(229,193,88,0.2)",
  },
  refPortraitInner: { alignItems: "center", justifyContent: "center" },
  floatCard: {
    position: "absolute",
    width: 132,
    backgroundColor: "rgba(22,22,26,0.92)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    zIndex: 2,
  },
  floatTL: { top: "12%", left: 0 },
  floatTR: { top: "18%", right: 0 },
  floatBL: { bottom: "18%", left: 0 },
  floatBR: { bottom: "12%", right: 0 },
  floatTitle: { color: "#F5F5F5", fontSize: 13, fontWeight: "700" },
  floatSub: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 3 },
  refCopy: { marginTop: 8, marginBottom: 18 },
  refHeadline: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  refHeadlineGold: {
    color: GOLD,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
    marginTop: 2,
  },
  refBody: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 12,
  },
  refCta: {
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  refCtaText: { color: "#111111", fontSize: 16, fontWeight: "800" },
  refLoginRow: { marginTop: 16, alignItems: "center" },
  refLogin: { color: "rgba(255,255,255,0.55)", fontSize: 14 },
  refLoginLink: { color: GOLD, fontWeight: "700" },
  authContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28 },
  back: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#1B1B1D",
    marginBottom: 22,
  },
  authBrand: { marginBottom: 26 },
  authTitle: { color: "#F7F6F2", fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -1.2 },
  authSubtitle: { color: "#A7A49C", fontSize: 14, marginTop: 7, marginBottom: 28 },
  label: { color: GOLD, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 9 },
  kindIntro: { color: "#A7A49C", fontSize: 13, lineHeight: 19, marginTop: -3, marginBottom: 17 },
  kindGroup: { marginBottom: 13 },
  kindGroupTitle: { color: "#858178", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 8 },
  kindGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 2 },
  kindCell: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#303033",
    backgroundColor: "#151517",
    borderRadius: 14,
    padding: 12,
    minHeight: 82,
  },
  kindCellOn: { borderColor: GOLD, backgroundColor: "rgba(212,175,87,0.09)" },
  kindHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  kindRadio: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#66625A",
    alignItems: "center",
    justifyContent: "center",
  },
  kindRadioOn: { borderColor: GOLD },
  kindRadioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: GOLD },
  kindTitle: { color: "#F7F6F2", fontSize: 12, fontWeight: "800", flexShrink: 1 },
  kindTitleOn: { color: GOLD },
  kindHint: { color: "#858178", fontSize: 10, marginTop: 4, lineHeight: 13 },
  field: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#303033",
    backgroundColor: "#151517",
    paddingHorizontal: 16,
    color: "#F7F6F2",
    fontSize: 15,
    marginBottom: 12,
  },
  switchRow: { alignItems: "center", paddingVertical: 17 },
  switchText: { color: "#A7A49C", fontSize: 13 },
  switchGold: { color: GOLD, fontWeight: "800" },
});
