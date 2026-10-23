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
  Modal,
  Animated,
  Easing,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { ACCOUNT_KINDS, type AccountKind } from "../lib/accountKinds";

const AUTH_BACKGROUND_VIDEOS = [
  "https://videos.pexels.com/video-files/4540336/4540336-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/36743112/36743112-hd_1080_1920_25fps.mp4",
  "https://videos.pexels.com/video-files/30328849/30328849-hd_1920_1080_25fps.mp4",
];

function AuthVideoBackdrop({ scale }: { scale: Animated.Value }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const failedVideos = useRef(0);
  const nextVideo = () => {
    failedVideos.current = 0;
    setVideoIndex((index) => (index + 1) % AUTH_BACKGROUND_VIDEOS.length);
  };
  const handleVideoError = () => {
    failedVideos.current += 1;
    if (failedVideos.current >= AUTH_BACKGROUND_VIDEOS.length) {
      setVideoFailed(true);
      return;
    }
    setVideoIndex((index) => (index + 1) % AUTH_BACKGROUND_VIDEOS.length);
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.bgPlate, { transform: [{ scale }] }]}>
        <View style={styles.warmBlob} />
        <View style={styles.goldBlob} />
        <View style={styles.amberBlob} />
      </Animated.View>
      {!videoFailed ? (
        <Video
          key={AUTH_BACKGROUND_VIDEOS[videoIndex]}
          source={{ uri: AUTH_BACKGROUND_VIDEOS[videoIndex] }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          isMuted
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) nextVideo();
          }}
          onError={handleVideoError}
        />
      ) : null}
      <View style={styles.veil} />
    </View>
  );
}

type Props = {
  isDark: boolean;
  C: any;
  onSignIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string; requiresConfirmation?: boolean }>;
  onSignUp: (email: string, username: string, password: string, kind: AccountKind, displayName?: string) => Promise<{ ok: boolean; error?: string; requiresConfirmation?: boolean }>;
  onPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  recoveryToken?: string | null;
  onPasswordUpdate: (token: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
  show: (m: string) => void;
};

export function AuthScreen({ onSignIn, onSignUp, onPasswordReset, recoveryToken, onPasswordUpdate, onGuest, show }: Props) {
  const [mode, setMode] = useState<"welcome" | "in" | "up" | "reset">(recoveryToken ? "reset" : "welcome");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind>("member");
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (recoveryToken) {
      setMode("reset");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [recoveryToken]);

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

  if (mode === "welcome") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <AuthVideoBackdrop scale={scale} />
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeMark}>
            <Text style={styles.welcomeWordmark}>KILODE<Text style={styles.welcomeAccent}>!</Text></Text>
          </View>
          <View style={styles.welcomePanel}>
            <Text style={styles.welcomeTitle}>Everything you need.</Text>
            <Text style={styles.welcomeGold}>One platform.</Text>
            <Text style={styles.welcomeSubtitle}>Discover, create, connect and find your people.</Text>
            <TouchableOpacity style={styles.welcomePrimary} onPress={() => setMode("up")} accessibilityRole="button">
              <Text style={styles.welcomePrimaryText}>Get started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.welcomeLogin} onPress={() => setMode("in")} accessibilityRole="button">
              <Text style={styles.welcomeLoginText}>Already have an account? <Text style={styles.welcomeLoginAccent}>Log in</Text></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guest} onPress={onGuest} accessibilityRole="button" accessibilityLabel="Continue as guest">
              <Text style={styles.guestText}>Continue as guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <AuthVideoBackdrop scale={scale} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {mode !== "reset" ? (
              <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, mode === "in" && styles.tabOn]} onPress={() => setMode("in")}>
                  <Text style={[styles.tabText, mode === "in" && styles.tabTextOn]}>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, mode === "up" && styles.tabOn]} onPress={() => setMode("up")}>
                  <Text style={[styles.tabText, mode === "up" && styles.tabTextOn]}>Create account</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <Text style={styles.title}>{mode === "in" ? "Welcome back" : mode === "reset" ? "Reset your password" : "Join Kilode"}</Text>
            <Text style={styles.hint}>
              {mode === "in" ? "Sign in with your email and password" : mode === "reset" ? "Choose a new password for your account." : "Choose account type · email, username + password"}
            </Text>

            {mode === "up" ? (
              <>
                <Text style={styles.kindLabel}>ACCOUNT TYPE</Text>
                <TouchableOpacity
                  style={styles.kindChooser}
                  onPress={() => setAccountPickerOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Account type: ${ACCOUNT_KINDS.find((item) => item.id === kind)?.label}. Change account type`}
                >
                  <View style={styles.kindChooserCopy}>
                    <Text style={styles.kindChooserTitle}>{ACCOUNT_KINDS.find((item) => item.id === kind)?.label}</Text>
                    <Text style={styles.kindChooserHint} numberOfLines={2}>
                      {ACCOUNT_KINDS.find((item) => item.id === kind)?.hint}
                    </Text>
                  </View>
                  <Text style={styles.kindChooserAction}>Change⌄</Text>
                </TouchableOpacity>
                <Modal
                  visible={accountPickerOpen}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setAccountPickerOpen(false)}
                  statusBarTranslucent
                >
                  <View style={styles.pickerBackdrop}>
                    <TouchableOpacity
                      style={styles.pickerDismiss}
                      activeOpacity={1}
                      onPress={() => setAccountPickerOpen(false)}
                      accessibilityLabel="Close account type picker"
                    />
                    <View style={styles.pickerSheet}>
                      <View style={styles.pickerHandle} />
                      <View style={styles.pickerHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pickerTitle}>Choose your space</Text>
                          <Text style={styles.pickerSubtitle}>Pick the role that fits what you do on Kilode.</Text>
                        </View>
                        <TouchableOpacity onPress={() => setAccountPickerOpen(false)} style={styles.pickerClose}>
                          <Text style={styles.pickerCloseText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView
                        style={styles.pickerList}
                        contentContainerStyle={styles.pickerListContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                      >
                        {ACCOUNT_KINDS.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.pickerOption, kind === item.id && styles.pickerOptionOn]}
                            onPress={() => {
                              setKind(item.id);
                              setAccountPickerOpen(false);
                            }}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: kind === item.id }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.pickerOptionTitle, kind === item.id && styles.pickerOptionTitleOn]}>{item.label}</Text>
                              <Text style={styles.pickerOptionHint}>{item.hint}</Text>
                            </View>
                            <View style={[styles.pickerRadio, kind === item.id && styles.pickerRadioOn]}>
                              {kind === item.id ? <View style={styles.pickerRadioDot} /> : null}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <TouchableOpacity style={styles.pickerDone} onPress={() => setAccountPickerOpen(false)}>
                        <Text style={styles.pickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                <TextInput
                  style={styles.field}
                  placeholder="Username (3–30 characters)"
                  placeholderTextColor="#71717A"
                  autoCapitalize="none"
                  autoComplete="username"
                  textContentType="username"
                  value={username}
                  onChangeText={setUsername}
                />
                <TextInput
                  style={styles.field}
                  placeholder="Display name (optional)"
                  placeholderTextColor="#71717A"
                  value={name}
                  onChangeText={setName}
                />
              </>
            ) : null}

            {mode !== "reset" ? (
              <TextInput
                style={styles.field}
                placeholder="Email address"
                placeholderTextColor="#71717A"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
              />
            ) : null}
            {mode === "reset" ? (
              <>
                <TextInput
                  style={styles.field}
                  placeholder="New password (8+ characters)"
                  placeholderTextColor="#71717A"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.field}
                  placeholder="Confirm new password"
                  placeholderTextColor="#71717A"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                />
              </>
            ) : (
              <TextInput
                style={styles.field}
                placeholder={mode === "up" ? "Password (8+)" : "Password"}
                placeholderTextColor="#71717A"
                secureTextEntry
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                textContentType={mode === "up" ? "newPassword" : "password"}
                value={password}
                onChangeText={setPassword}
              />
            )}

            {mode === "in" ? (
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginTop: 6, marginBottom: 4 }}
                accessibilityRole="button"
                onPress={async () => {
                  if (busy) return;
                  setBusy(true);
                  try {
                    const result = await onPasswordReset(email);
                    show(result.ok
                      ? "If an account exists for that email, a password reset link will be sent."
                      : (result.error || "Password recovery is temporarily unavailable."));
                  } catch {
                    show("Could not request a password reset. Please try again.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Text style={styles.switchLink}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.primary, { opacity: busy ? 0.7 : 1 }]}
              disabled={busy}
              onPress={async () => {
                if (busy) return;
                setBusy(true);
                try {
                  if (mode === "reset") {
                    if (!recoveryToken) {
                      show("This recovery link is invalid or expired. Request a new one.");
                    } else if (newPassword.length < 8 || newPassword.length > 72) {
                      show("Password must be between 8 and 72 characters.");
                    } else if (newPassword !== confirmNewPassword) {
                      show("The passwords do not match.");
                    } else {
                      const result = await onPasswordUpdate(recoveryToken, newPassword);
                      if (!result.ok) show(result.error || "Password could not be updated.");
                      else {
                        show("Password updated. Sign in with your new password.");
                        setPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                        setMode("in");
                      }
                    }
                  } else {
                    const result = mode === "up"
                      ? await onSignUp(email, username, password, kind, name || undefined)
                      : await onSignIn(email, password);
                    if (!result.ok) show(result.error || "Authentication failed");
                    else if (result.requiresConfirmation) {
                      show("Check your email for the confirmation link, then sign in.");
                      setMode("in");
                    } else show(mode === "up" ? `Welcome · ${kind}` : "Welcome");
                  }
                } catch {
                  show("Kilode could not complete authentication. Please try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Text style={styles.primaryText}>
                {busy ? "…" : mode === "in" ? "Sign in" : mode === "reset" ? "Update password" : "Create account"}
              </Text>
            </TouchableOpacity>

            {mode === "reset" ? (
              <TouchableOpacity style={{ alignSelf: "center", paddingVertical: 14 }} onPress={() => setMode("in")}>
                <Text style={styles.switchLink}>Back to sign in</Text>
              </TouchableOpacity>
            ) : (
              <>
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
              </>
            )}
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
  welcomeContent: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 52, paddingBottom: 28 },
  welcomeMark: { alignItems: "center", paddingTop: 28 },
  welcomeWordmark: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", letterSpacing: 4 },
  welcomeAccent: { color: "#D4AF37" },
  welcomePanel: { width: "100%", maxWidth: 460, alignSelf: "center", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(212,175,55,0.24)", backgroundColor: "rgba(24,24,27,0.88)" },
  welcomeTitle: { color: "#FFFFFF", fontSize: 27, fontWeight: "800", letterSpacing: -0.7 },
  welcomeGold: { color: "#E5C158", fontSize: 27, fontWeight: "800", letterSpacing: -0.7, marginTop: 1 },
  welcomeSubtitle: { color: "#A1A1AA", fontSize: 14, lineHeight: 21, marginTop: 10 },
  welcomePrimary: { backgroundColor: "#D4AF37", borderRadius: 999, paddingVertical: 15, alignItems: "center", marginTop: 22 },
  welcomePrimaryText: { color: "#0D0D10", fontWeight: "800", fontSize: 15 },
  welcomeLogin: { marginTop: 17, alignItems: "center" },
  welcomeLoginText: { color: "#A1A1AA", fontSize: 13 },
  welcomeLoginAccent: { color: "#E5C158", fontWeight: "700" },
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
  kindLabel: { fontSize: 11, fontWeight: "800", color: "#A1A1AA", marginBottom: 8, letterSpacing: 1.1 },
  kindChooser: { minHeight: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderRadius: 15, borderWidth: 1, borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.08)" },
  kindChooserCopy: { flex: 1, paddingRight: 12 },
  kindChooserTitle: { color: "#F4F4F5", fontSize: 14, fontWeight: "800" },
  kindChooserHint: { color: "#A1A1AA", fontSize: 11, lineHeight: 15, marginTop: 4 },
  kindChooserAction: { color: "#E5C158", fontSize: 12, fontWeight: "800" },
  pickerBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.64)" },
  pickerDismiss: { flex: 1 },
  pickerSheet: { maxHeight: "78%", minHeight: "48%", backgroundColor: "#18181C", borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: "#2A2A30", paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 26 : 18, paddingHorizontal: 18 },
  pickerHandle: { width: 38, height: 4, borderRadius: 4, backgroundColor: "#52525B", alignSelf: "center", marginBottom: 18 },
  pickerHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  pickerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  pickerSubtitle: { color: "#A1A1AA", fontSize: 12, lineHeight: 17, marginTop: 5, paddingRight: 8 },
  pickerClose: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#2A2A30" },
  pickerCloseText: { color: "#D4D4D8", fontSize: 14, fontWeight: "700" },
  pickerList: { flexShrink: 1 },
  pickerListContent: { paddingBottom: 8, gap: 8 },
  pickerOption: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderColor: "#2A2A30", backgroundColor: "#111114" },
  pickerOptionOn: { borderColor: "#D4AF37", backgroundColor: "rgba(212,175,55,0.09)" },
  pickerOptionTitle: { color: "#F4F4F5", fontSize: 13, fontWeight: "700" },
  pickerOptionTitleOn: { color: "#E5C158" },
  pickerOptionHint: { color: "#A1A1AA", fontSize: 11, lineHeight: 15, marginTop: 3 },
  pickerRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#52525B", alignItems: "center", justifyContent: "center" },
  pickerRadioOn: { borderColor: "#D4AF37" },
  pickerRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#D4AF37" },
  pickerDone: { marginTop: 10, borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: "#D4AF37" },
  pickerDoneText: { color: "#0D0D10", fontSize: 14, fontWeight: "800" },
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
  legal: { textAlign: "center", fontSize: 11, color: "#52525B", marginTop: 12, lineHeight: 16 },
  guest: { alignItems: "center", marginTop: 14 },
  guestText: { fontSize: 13, fontWeight: "600", color: "#E5C158" },
});
