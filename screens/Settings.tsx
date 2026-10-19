import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  Platform,
} from "react-native";
import type { Palette } from "../themeStyles";

type Props = {
  s: any;
  C: Palette;
  isDark: boolean;
  onBack: () => void;
  onDeleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  show: (m: string) => void;
  sessionHandle: string;
};

const SUPPORT_EMAIL = "support@kilode.ng";
const PRIVACY_URL = "https://kilode.ng/privacy"; // publish before App Store submit
const TERMS_URL = "https://kilode.ng/terms";

export function SettingsScreen({
  s,
  C,
  onBack,
  onDeleteAccount,
  show,
  sessionHandle,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    const r = await onDeleteAccount();
    setDeleting(false);
    setDeleteOpen(false);
    if (r.ok) show("Account deleted");
    else show(r.error || "Could not delete account");
  };

  const row = (label: string, onPress: () => void, danger?: boolean) => (
    <TouchableOpacity
      style={[s.roomRow, danger && { borderColor: C.danger }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={[s.roomName, danger && { color: C.danger }]}>{label}</Text>
      <Text style={s.meta}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[s.link, { marginBottom: 8 }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.h1}>Settings</Text>
        <Text style={s.sub}>@{sessionHandle}</Text>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Support & legal</Text>
      </View>
      {row("Community guidelines", () => setGuidelinesOpen(true))}
      {row("Contact support", () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Kilode%20support`).catch(() =>
          show(`Email ${SUPPORT_EMAIL}`)
        );
      })}
      {row("Privacy policy", () => {
        Linking.openURL(PRIVACY_URL).catch(() => show("Publish privacy URL before store submit"));
      })}
      {row("Terms of use", () => {
        Linking.openURL(TERMS_URL).catch(() => show("Publish terms URL before store submit"));
      })}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Account</Text>
      </View>
      {row("Delete account", () => setDeleteOpen(true), true)}

      <Text style={[s.meta, s.padH, { marginTop: 16, lineHeight: 18 }]}>
        Deleting your account removes local session data immediately. Server-side deletion
        requires a live backend endpoint — we never claim cloud wipe without a verified API.
      </Text>

      <Modal visible={guidelinesOpen} transparent animationType="slide" onRequestClose={() => setGuidelinesOpen(false)}>
        <View style={s.modalRoot}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setGuidelinesOpen(false)} />
          <View style={[s.sheet, { maxHeight: "80%" }]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>Community guidelines</Text>
              <TouchableOpacity onPress={() => setGuidelinesOpen(false)}>
                <Text style={s.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                "Be respectful. No harassment, hate, or threats.",
                "No spam, scams, or impersonation.",
                "No illegal content or non-consensual intimate imagery.",
                "Credit creators. Do not steal work.",
                "Use Report on posts or profiles that break these rules.",
                "Blocked users cannot interact with you on this device.",
              ].map((line) => (
                <Text key={line} style={[s.body || s.sub, { marginBottom: 10, color: C.text, fontSize: 14, lineHeight: 20 }]}>
                  • {line}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <View style={[s.modalRoot, { justifyContent: "center", padding: 24 }]}>
          <TouchableOpacity style={s.scrim} activeOpacity={1} onPress={() => setDeleteOpen(false)} />
          <View style={[s.sheet, { borderRadius: 16, maxHeight: undefined }]}>
            <Text style={s.sheetTitle}>Delete account?</Text>
            <Text style={[s.sub, { marginVertical: 12 }]}>
              This signs you out and clears local data for @{sessionHandle}. Backend account wipe
              runs only when the server supports it.
            </Text>
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: C.danger, marginBottom: 10 }]}
              disabled={deleting}
              onPress={() => {
                if (Platform.OS === "web") {
                  confirmDelete();
                  return;
                }
                Alert.alert("Confirm deletion", "This cannot be undone from this device.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: confirmDelete },
                ]);
              }}
            >
              <Text style={s.primaryBtnText}>{deleting ? "Deleting…" : "Delete account"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ghostBtn} onPress={() => setDeleteOpen(false)}>
              <Text style={[s.ghostBtnText, { textAlign: "center" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
