import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Palette } from "../themeStyles";
import { ACCOUNT_KINDS } from "../lib/accountKinds";
import { capabilitiesFor } from "../lib/permissions";

type Props = {
  s: any;
  C: Palette;
  isDark: boolean;
  onBack: () => void;
  onDeleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  show: (m: string) => void;
  sessionHandle: string;
  sessionKind?: string;
  localOnly?: boolean;
};

const SUPPORT_EMAIL = "support@kilode.ng";
const PRIVACY_URL = "https://kilode.ng/privacy";
const TERMS_URL = "https://kilode.ng/terms";

export function SettingsScreen({
  s,
  C,
  onBack,
  onDeleteAccount,
  show,
  sessionHandle,
  sessionKind = "member",
  localOnly = false,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const kindMeta = ACCOUNT_KINDS.find((k) => k.id === sessionKind);
  const caps = capabilitiesFor(sessionKind);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const r = await onDeleteAccount();
      setDeleteOpen(false);
      if (r.ok) show("Account deleted");
      else show(r.error || "Could not delete account");
    } catch {
      show("Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      show("Could not open link");
    }
  };

  const row = (
    label: string,
    onPress: () => void,
    opts?: { danger?: boolean; icon?: keyof typeof Ionicons.glyphMap; sub?: string }
  ) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        gap: 12,
      }}
    >
      {opts?.icon ? (
        <Ionicons name={opts.icon} size={20} color={opts.danger ? C.danger || "#ff6b6b" : C.text2} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: opts?.danger ? C.danger || "#ff6b6b" : C.text, fontWeight: "600", fontSize: 15 }}>
          {label}
        </Text>
        {opts?.sub ? (
          <Text style={{ color: C.text3, fontSize: 12, marginTop: 2 }}>{opts.sub}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.text3} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Settings</Text>
      </View>

      <Text style={{ color: C.text3, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, paddingHorizontal: 16, marginTop: 20, marginBottom: 6 }}>
        ACCOUNT
      </Text>
      <View style={{ marginHorizontal: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
        {row(`Signed in as @${sessionHandle || "guest"}`, () => show("Profile editor opens from My Space."), {
          icon: "person-outline",
          sub: localOnly ? "Device session — not a live server account" : "Live account",
        })}
        {row(
          kindMeta?.label || sessionKind,
          () =>
            show(
              localOnly
                ? "Account type is stored on this device. Live role sync needs the mobile API."
                : "Account type is managed by Kilode when the profile API is available."
            ),
          {
            icon: "ribbon-outline",
            sub: kindMeta?.hint || "Account type",
          }
        )}
        {row("Your tools", () => show(caps.length ? caps.join(" · ") : "member"), {
          icon: "construct-outline",
          sub: caps.slice(0, 4).join(" · ") + (caps.length > 4 ? "…" : ""),
        })}
        {row("Notifications", () => show("Notification preferences sync when backend is live."), {
          icon: "notifications-outline",
        })}
        {row("Privacy", () => openUrl(PRIVACY_URL), { icon: "shield-outline" })}
      </View>

      <Text style={{ color: C.text3, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, paddingHorizontal: 16, marginTop: 20, marginBottom: 6 }}>
        SUPPORT
      </Text>
      <View style={{ marginHorizontal: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
        {row("Help & support", () => openUrl(`mailto:${SUPPORT_EMAIL}`), { icon: "help-circle-outline" })}
        {row("Community guidelines", () => setGuidelinesOpen(true), { icon: "document-text-outline" })}
        {row("Terms of use", () => openUrl(TERMS_URL), { icon: "reader-outline" })}
      </View>

      <Text style={{ color: C.text3, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, paddingHorizontal: 16, marginTop: 20, marginBottom: 6 }}>
        DANGER ZONE
      </Text>
      <View style={{ marginHorizontal: 12, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
        {row("Delete account", () => setDeleteOpen(true), { danger: true, icon: "trash-outline" })}
      </View>

      <Text style={{ color: C.text3, fontSize: 11, textAlign: "center", marginTop: 24 }}>
        Kilode · {Platform.OS} · v1.0
      </Text>

      <Modal visible={guidelinesOpen} transparent animationType="slide" onRequestClose={() => setGuidelinesOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Community guidelines</Text>
              <TouchableOpacity onPress={() => setGuidelinesOpen(false)}>
                <Ionicons name="close" size={22} color={C.text2} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={{ color: C.text2, lineHeight: 22, fontSize: 14 }}>
                Be respectful. No hate speech, harassment, scams, or illegal content. Report posts that break the rules. Kilode moderators may remove content and suspend accounts that violate these guidelines.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: C.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Delete account?</Text>
            <Text style={{ color: C.text2, marginTop: 10, lineHeight: 21, fontSize: 14 }}>
              This permanently removes your Kilode account and associated data where required. This action cannot be undone.
              {localOnly ? " Device sessions are cleared from this phone only." : ""}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                disabled={deleting}
                onPress={() => setDeleteOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: C.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: C.text, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={deleting}
                onPress={confirmDelete}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 999,
                  backgroundColor: C.danger || "#ff6b6b",
                  alignItems: "center",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>{deleting ? "Deleting…" : "Delete"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
