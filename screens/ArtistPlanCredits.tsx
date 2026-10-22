import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
};

/**
 * Read-only product explainer for artists.
 * Mirrors docs/ARTIST_MONETISATION_DECISIONS.md — no live balance, no checkout.
 */
export function ArtistPlanCreditsScreen({ s, C, onBack }: Props) {
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
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
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
            <Text style={s.sub}>How releasing will work · not live yet</Text>
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
          Credit balance, checkout, and server upload are not connected. This screen explains the product rules only. Local drafts never charge a credit.
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
        <Text style={[s.meta, { marginBottom: 4 }]}>Server credits</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: C.text3 }}>—</Text>
        <Text style={[s.meta, { marginTop: 8, textAlign: "center", lineHeight: 18 }]}>
          Unavailable until the music API returns entitlements. Proposed free allowance for new artists: 3 release credits (product decision — not granted in this build).
        </Text>
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
          "Live credit balance",
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
