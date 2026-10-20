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
  { key: "music", title: "Music", sub: "New sounds", icon: "musical-notes" as const, style: { top: "12%" as const, left: 12 } },
  { key: "socials", title: "Socials", sub: "Real people", icon: "people" as const, style: { top: "18%" as const, right: 12 } },
  { key: "media", title: "Media", sub: "Stories", icon: "newspaper" as const, style: { bottom: "22%" as const, left: 16 } },
  { key: "events", title: "Events", sub: "What's on", icon: "calendar" as const, style: { bottom: "16%" as const, right: 16 } },
];

export function AuthScreen({ onSignIn, onSignUp, onGuest, onGoogle, show }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 760;
  // Multi-step: welcome → pick account type → credentials
  const [mode, setMode] = useState<"welcome" | "kind" | "in" | "up">("welcome");
  const [handle, setHandle] = useState("");
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
      show("Enter your username and password.");
      return;
    }
    setBusy(true);
    try {
      const result =
        mode === "up"
          ? await onSignUp(handle.trim(), password, kind as AccountKind, name.trim() || undefined)
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
        <View style={styles.welcome}>
          <View style={styles.logoWrap}>
            <KilodeWordmark size="large" />
          </View>

          <View style={[styles.hero, compact && { height: 240 }]}>
            <View style={styles.arc} />
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
              </View>
            ))}
          </View>

          <Text style={styles.tagline}>Talk News. Real People.</Text>
          <Text style={styles.tagSub}>Media · Music · Socials · Opportunity</Text>

          <TouchableOpacity
            style={styles.cta}
            onPress={() => {
              setKind(null);
              setMode("kind");
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </TouchableOpacity>

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
        </View>
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
            <Text style={{ color: GOLD, fontWeight: "600" }}>‹ Back</Text>
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
                      <Text style={[styles.kindRowLabel, on && { color: GOLD }]}>{k.label}</Text>
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
            <Text style={{ color: GOLD, fontWeight: "600" }}>‹ Back</Text>
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

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
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
  root: { flex: 1, backgroundColor: "#0B0B0F" },
  welcome: { flex: 1, paddingHorizontal: 20, paddingBottom: 16 },
  logoWrap: { alignItems: "center", marginTop: 8, marginBottom: 8 },
  hero: {
    height: 300,
    borderRadius: 24,
    backgroundColor: "#141418",
    overflow: "hidden",
    marginBottom: 18,
  },
  arc: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: "rgba(229,193,88,0.18)",
    top: -40,
    alignSelf: "center",
    left: "50%",
    marginLeft: -140,
  },
  portrait: {
    position: "absolute",
    left: "50%",
    marginLeft: -70,
    top: 40,
    width: 140,
    height: 180,
    borderRadius: 70,
    overflow: "hidden",
    backgroundColor: "#1a1a20",
  },
  portraitImg: { width: "100%", height: "100%" },
  portraitFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,11,15,0.25)",
  },
  floatCard: {
    position: "absolute",
    backgroundColor: "rgba(20,20,24,0.92)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(229,193,88,0.2)",
    maxWidth: 130,
  },
  floatHead: { flexDirection: "row", alignItems: "center", gap: 4 },
  floatTitle: { color: "#fff", fontWeight: "800", fontSize: 11 },
  floatSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 },
  tagline: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
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
    backgroundColor: GOLD,
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
  formTitle: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 12 },
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
    color: GOLD,
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
    borderColor: GOLD,
    backgroundColor: "rgba(229,193,88,0.1)",
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
  radioOn: { borderColor: GOLD },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD },
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
  loginLink: { color: GOLD, fontWeight: "700" },
});
