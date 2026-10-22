import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ACCOUNT_GROUPS, ACCOUNT_KINDS, type AccountKind } from "../lib/accountKinds";

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

export function AuthScreen({ onSignIn, onSignUp, onGuest, show }: Props) {
  // Open directly on sign-in: no pre-auth video splash or incorrect wordmark.
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

  // Native first-launch welcome. No video splash or incorrect logo asset.
  if (mode === "welcome") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <Image
          source={require("../assets/kilode-welcome-portrait.jpg")}
          style={styles.welcomeBackdrop}
          resizeMode="cover"
          accessibilityLabel="Kilode welcome portrait"
        />
        <View pointerEvents="none" style={styles.welcomeScrim} />
        <ScrollView contentContainerStyle={styles.welcomePad} keyboardShouldPersistTaps="handled">
          <View style={styles.welcomePanel}>
            <Text style={styles.welcomeTitle}>Everything you need.</Text>
            <Text style={styles.welcomeGold}>One platform.</Text>
            <Text style={styles.welcomeSub}>Discover, create, connect and be part of something bigger.</Text>
            <TouchableOpacity style={[styles.cta, { marginTop: 22 }]} onPress={() => setMode("kind")} accessibilityRole="button">
              <Text style={styles.ctaText}>Get Started  →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode("in")} style={{ marginTop: 18, alignItems: "center" }} accessibilityRole="button">
              <Text style={styles.loginMuted}>Already have an account? <Text style={styles.loginLink}>Log In</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestBtn} onPress={onGuest} accessibilityRole="button" accessibilityLabel="Continue as Guest">
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step: choose account type (required before credentials on sign-up)
  if (mode === "kind") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.formPad} keyboardShouldPersistTaps="handled"><View style={styles.formCard}>
          <TouchableOpacity onPress={() => setMode("welcome")} style={{ marginBottom: 12 }}>
            <Text style={{ color: ACCENT, fontWeight: "600" }}>‹ Back</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={onGuest}
            accessibilityRole="button"
            accessibilityLabel="Continue as Guest"
          >
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.formPad} keyboardShouldPersistTaps="handled"><View style={styles.formCard}>
          {mode === "up" ? (
            <TouchableOpacity
              onPress={() => setMode("kind")}
              style={{ marginBottom: 16 }}
              accessibilityRole="button"
              accessibilityLabel="Back to account type"
            >
              <Text style={{ color: ACCENT, fontWeight: "600" }}>‹ Back</Text>
            </TouchableOpacity>
          ) : null}
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
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={onGuest}
            accessibilityRole="button"
            accessibilityLabel="Continue as Guest"
          >
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D10" },
  welcomePad: { flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  welcomeBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  welcomeScrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(13,13,16,0.34)" },
  welcomePanel: { width: "100%", maxWidth: 460, alignSelf: "center", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(212,175,55,0.22)", backgroundColor: "rgba(13,13,16,0.78)" },
  welcomeTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -0.7, marginTop: 22 },
  welcomeGold: { color: ACCENT, fontSize: 28, fontWeight: "800", letterSpacing: -0.7, marginTop: 1 },
  welcomeSub: { color: "rgba(255,255,255,0.58)", fontSize: 14, lineHeight: 21, marginTop: 10 },
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
  formPad: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 24 },
  formCard: { width: "100%", maxWidth: 420, alignSelf: "center" },
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
