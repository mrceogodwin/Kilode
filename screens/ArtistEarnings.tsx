import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { Palette } from "../themeStyles";

type Props = { s: any; C: Palette; onBack: () => void };

const sources = [
  ["Paid music", "Track and release purchases"],
  ["Fan subscriptions", "Recurring fan support"],
  ["Tips & support", "Direct contributions from fans"],
  ["Exclusive content", "Paid access to artist-only content"],
  ["Tickets & merchandise", "Eligible event and product sales"],
] as const;

export function ArtistEarningsScreen({ s, C, onBack }: Props) {
  const row = (title: string, detail: string) => (
    <View key={title} style={{ paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
      <Text style={{ color: C.text, fontSize: 14, fontWeight: "700" }}>{title}</Text>
      <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{detail}</Text>
    </View>
  );
  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" style={{ paddingVertical: 10, alignSelf: "flex-start" }}>
          <Text style={{ color: C.accent, fontWeight: "700" }}>‹ Back to Artist Studio</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 25, fontWeight: "800", marginTop: 6 }}>Fan earnings</Text>
        <Text style={{ color: C.text2, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
          Track money earned directly from your fans through Kilode. Balances will appear only after verified payment records are connected.
        </Text>
        <View style={{ marginTop: 18, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: "800" }}>Earnings are not connected yet</Text>
          <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
            No balance or payout amount is shown because Kilode has not connected a verified artist-payment ledger here. This avoids misleading you with sample figures.
          </Text>
        </View>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 8 }}>Fan-powered income</Text>
        <View style={{ borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: "hidden", backgroundColor: C.card }}>
          {sources.map(([title, detail]) => row(title, detail))}
        </View>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 8 }}>Your transaction record</Text>
        <View style={{ borderWidth: 1, borderColor: C.border, borderRadius: 16, backgroundColor: C.card, padding: 14 }}>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>No verified transactions available</Text>
          <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18, marginTop: 5 }}>When payment processing is connected, this area will show each charge, fees, refunds, net earnings and status.</Text>
        </View>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 8 }}>Streaming royalties</Text>
        <View style={{ borderWidth: 1, borderColor: C.border, borderRadius: 16, backgroundColor: C.card, padding: 14 }}>
          <Text style={{ color: C.text, fontSize: 13, fontWeight: "700" }}>Separate from fan earnings</Text>
          <Text style={{ color: C.text2, fontSize: 12, lineHeight: 18, marginTop: 5 }}>Traditional streaming royalties will be reported separately only when Kilode has the required licensing, distribution and royalty-accounting arrangements. They are not included in fan earnings.</Text>
        </View>
        <Text style={{ color: C.text3, fontSize: 11, lineHeight: 16, marginTop: 16 }}>Payouts, payment fees, refunds, tax handling and eligibility must be configured and verified before real balances can be displayed.</Text>
      </View>
    </ScrollView>
  );
}
