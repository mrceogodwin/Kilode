import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { accountKindLabel } from "../lib/permissions";

type Props = {
  s: any;
  C: any;
  accountKind?: string;
  onBack: () => void;
  show: (message: string) => void;
};

const BENEFITS: Record<string, string[]> = {
  member: ["Profile customisation and identity tools", "Audience and activity insights when verified data is available", "Access to eligible paid features as they launch"],
  artist: ["Artist release and catalogue tools", "Verified audience, release and earnings reporting when connected", "Push Link promotion campaign tools"],
  writer: ["Editorial and publishing workflow tools", "Verified article and audience insights", "Eligible story promotion placements"],
  advertiser: ["Campaign planning and eligible placements", "Verified delivery, reach and interaction reporting", "Campaign history and receipts when billing is connected"],
  cinema: ["Film and trailer workspace tools", "Verified title performance reporting", "Eligible promotion placements"],
  job_poster: ["Hiring workspace tools", "Job performance insights when verified", "Eligible job promotion placements"],
  job_seeker: ["Career profile and application tools", "Saved search and career tools as available", "Eligible member features"],
  vendor: ["Storefront and listing management tools", "Verified listing performance reporting", "Eligible Market promotion placements"],
  renter: ["Listing management tools", "Verified listing performance reporting", "Eligible Market promotion placements"],
  brand: ["Business profile and workspace tools", "Verified audience and campaign reporting", "Eligible promotion placements"],
};

const PLANS = [
  { id: "free", title: "Free", description: "Core Kilode access", icon: "person-outline" as const },
  { id: "plus", title: "Plus", description: "Enhanced tools for active accounts", icon: "sparkles-outline" as const },
  { id: "pro", title: "Pro", description: "Advanced tools for eligible professional accounts", icon: "diamond-outline" as const },
];

export function UpgradeScreen({ s, C, accountKind, onBack, show }: Props) {
  const kind = accountKind || "member";
  const benefits = BENEFITS[kind] || BENEFITS.member;
  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={{ flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "flex-start", paddingVertical: 7, marginBottom: 12 }}>
        <Ionicons name="chevron-back" size={18} color={C.text2} />
        <Text style={{ color: C.text2, fontSize: 12, fontWeight: "700" }}>Back</Text>
      </TouchableOpacity>
      <View style={{ padding: 17, borderRadius: 17, borderWidth: 1, borderColor: C.accent + "66", backgroundColor: C.card }}>
        <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: C.accent + "20", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="sparkles-outline" size={24} color={C.accent} />
        </View>
        <Text style={{ color: C.text, fontSize: 23, fontWeight: "900", letterSpacing: -0.5, marginTop: 14 }}>Upgrade your Kilode</Text>
        <Text style={{ color: C.text2, fontSize: 13, lineHeight: 19, marginTop: 6 }}>Options for your {accountKindLabel(kind).toLowerCase()} account, with tools relevant to the way you use Kilode.</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: C.elevated }}>
          <Ionicons name="person-circle-outline" size={14} color={C.accent} />
          <Text style={{ color: C.accent, fontSize: 11, fontWeight: "800" }}>{accountKindLabel(kind)}</Text>
        </View>
      </View>

      <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginTop: 22, marginBottom: 10 }}>Built around your account</Text>
      {benefits.map((benefit) => (
        <View key={benefit} style={{ flexDirection: "row", alignItems: "flex-start", gap: 9, marginBottom: 10 }}>
          <Ionicons name="checkmark-circle-outline" size={18} color={C.accent} style={{ marginTop: 1 }} />
          <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18, flex: 1 }}>{benefit}</Text>
        </View>
      ))}

      <Text style={{ color: C.text, fontSize: 15, fontWeight: "800", marginTop: 18, marginBottom: 10 }}>Plans</Text>
      {PLANS.map((plan, index) => (
        <View key={plan.id} style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: index === 1 ? C.accent : C.border, backgroundColor: C.card, marginBottom: 9 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: C.elevated, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={plan.icon} size={20} color={C.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: "800" }}>{plan.title}</Text>
              <Text style={{ color: C.text3, fontSize: 11, marginTop: 3 }}>{plan.description}</Text>
            </View>
            {index === 0 ? <Text style={{ color: C.text3, fontSize: 10, fontWeight: "800" }}>CURRENT BASE</Text> : null}
          </View>
          <TouchableOpacity onPress={() => show("Plan checkout is not connected yet. No plan has been changed and no payment was taken.")} accessibilityRole="button" style={{ marginTop: 12, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: index === 1 ? C.accent : C.elevated, borderWidth: index === 1 ? 0 : 1, borderColor: C.border }}>
            <Text style={{ color: index === 1 ? "#111" : C.text2, fontSize: 12, fontWeight: "800" }}>{index === 0 ? "Current access" : "Plan details unavailable"}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: C.elevated, marginTop: 5 }}>
        <Ionicons name="information-circle-outline" size={18} color={C.accent} />
        <Text style={{ color: C.text2, fontSize: 11, lineHeight: 17, marginTop: 5 }}>This screen is the account-specific upgrade entry point. Pricing, entitlements, trusted checkout, receipts, renewals and cancellation are not connected yet, so no purchase can be completed here.</Text>
      </View>
    </ScrollView>
  );
}
