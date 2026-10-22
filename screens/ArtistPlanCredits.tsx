import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchArtistEntitlements,
  entitlementsStatusLabel,
  PROPOSED_FREE_ALLOWANCE,
  type ArtistEntitlements,
  type MusicApiResult,
} from "../lib/musicReleaseApi";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  token?: string | null;
};

export function ArtistPlanCreditsScreen({ s, C, onBack, token }: Props) {
  const [result, setResult] = useState<MusicApiResult<ArtistEntitlements> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const r = await fetchArtistEntitlements(token);
    setResult(r);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const ent = result?.data;
  const connected = !!(result?.ok && ent?.connected);
  const creditsLabel =
    connected && typeof ent?.releaseCredits === "number"
      ? String(ent.releaseCredits)
      : "—";
  const statusLabel = result ? entitlementsStatusLabel(result) : "…";

  const card = (title: string, body: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 14,
        borderRadius: 14,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: C.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={18} color={C.accent} />
        </View>
        <Text style={[s.roomName, { flex: 1 }]}>{title}</Text>
      </View>
      <Text style={[s.meta, { lineHeight: 20 }]}>{body}</Text>
    </View>
  );

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={s.scrollPad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      <View style={s.padH}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }} accessibilityRole="button">
          <Text style={s.link}>‹ Back to releases</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: C.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="wallet-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.h1}>Plan & credits</Text>
            <Text style={s.sub}>How releasing will work · {statusLabel}</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          backgroundColor: C.accent + "18",
          borderWidth: 1,
          borderColor: C.accent + "40",
        }}
      >
        <Text style={[s.meta, { color: C.accent, lineHeight: 18 }]}>
          {connected
            ? "Entitlements loaded from the server. Checkout still requires a separate billing path."
            : "Credit balance and checkout are not connected. Local drafts never charge a credit. Pull to retry when the music API is live."}
        </Text>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Balance</Text>
      </View>
      <View
        style={{
          marginHorizontal: 16,
          padding: 16,
          borderRadius: 14,
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.border,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color={C.accent} />
        ) : (
          <>
            <Text style={[s.meta, { marginBottom: 4 }]}>Server release credits</Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: connected ? C.text : C.text3,
              }}
            >
              {creditsLabel}
            </Text>
            <Text style={[s.meta, { marginTop: 8, textAlign: "center", lineHeight: 18 }]}>
              {connected
                ? ent?.planLabel
                  ? `Plan: ${ent.planLabel}`
                  : "Plan: free / none reported"
                : `Unavailable (${statusLabel}). Proposed free allowance for new artists: ${PROPOSED_FREE_ALLOWANCE} credits — not granted in this build."}
            </Text>
            {result?.error && !connected ? (
              <Text style={[s.meta, { marginTop: 6, textAlign: "center", color: C.text3 }]}>
                {result.error}
              </Text>
            ) : null}
          </>
        )}
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>How it works</Text>
      </View>

      {card(
        "Being an artist is free",
        "Account kind artist unlocks the Releases workspace. You do not pay just to have an artist profile or use Socials and discovery.",
        "person-outline"
      )}
      {card(
        "One credit = one master",
        "A release credit covers one audio master for Kilode Music review and hosting. Single, EP, and Album are packaging labels — multi-track releases use one credit per track when the server supports them.",
        "musical-note-outline"
      )}
      {card(
        "Local drafts are free",
        "Saving a draft on this device does not use a credit and does not upload. Credits apply only when a real server submit path exists.",
        "save-outline"
      )}
      {card(
        "No artist payouts at launch",
        "Kilode does not pay artists from member activity at launch. Hosting, discovery, and optional promotion only. Tips, royalties, or fan memberships would be a later product.",
        "cash-outline"
      )}
      {card(
        "Push Link is separate",
        "Push Link is paid placement on designated surfaces for a set budget and duration. It does not buy chart position, editorial features, or guaranteed streams.",
        "megaphone-outline"
      )}
      {card(
        "Plans vs credits",
        "Credits are pay-per-release. An Artist plan (when sold) would add recurring credits and tools. Upgrade CTAs will say Get credits, Artist plan, or Push Link — never Upgrade to Artist.",
        "layers-outline"
      )}

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Not available in this build</Text>
      </View>
      <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
        {[
          "Buy credits / subscribe",
          "Server upload & review",
          "Publish to Kilode Music",
          "Push Link campaigns",
          "External store distribution",
        ].map((line) => (
          <View key={line} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Ionicons name="close-circle-outline" size={16} color={C.text3} />
            <Text style={[s.meta, { flex: 1 }]}>{line}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
