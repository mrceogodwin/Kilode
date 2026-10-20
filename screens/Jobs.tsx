import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Job = {
  id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  color: string;
};

type Props = { s: any; C: any; onBack: () => void; show: (m: string) => void };

const FILTERS = ["All", "Full-time", "Part-time", "Remote"];

const JOBS: Job[] = [
  { id: "j1", title: "Frontend Developer", location: "Kano, Nigeria", type: "Full-time", salary: "₦250k – ₦400k/month", color: "#3B82F6" },
  { id: "j2", title: "Marketing Executive", location: "Lagos, Nigeria", type: "Full-time", salary: "₦150k – ₦250k/month", color: "#A855F7" },
  { id: "j3", title: "UI/UX Designer", location: "Remote", type: "Full-time", salary: "₦200k – ₦350k/month", color: "#06B6D4" },
  { id: "j4", title: "Business Analyst", location: "Abuja, Nigeria", type: "Full-time", salary: "₦180k – ₦300k/month", color: "#F59E0B" },
  { id: "j5", title: "Content writer — Abuja", location: "Abuja, Nigeria", type: "Part-time", salary: "Contract", color: "#10B981" },
];

export function JobsScreen({ s, C, onBack, show }: Props) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Job | null>(null);

  const list = useMemo(() => {
    let rows = JOBS;
    if (filter === "Full-time") rows = rows.filter((j) => j.type === "Full-time");
    if (filter === "Part-time") rows = rows.filter((j) => j.type === "Part-time");
    if (filter === "Remote") rows = rows.filter((j) => /remote/i.test(j.location));
    if (q.trim()) rows = rows.filter((j) => j.title.toLowerCase().includes(q.toLowerCase()));
    return rows;
  }, [filter, q]);

  if (active) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => setActive(null)}><Text style={{ color: C.accent, fontWeight: "600" }}>‹ Jobs</Text></TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", marginTop: 16 }}>{active.title}</Text>
        <Text style={{ color: C.text2, marginTop: 8 }}>{active.location} · {active.type}</Text>
        <Text style={{ color: C.accent, fontWeight: "800", marginTop: 12, fontSize: 16 }}>{active.salary}</Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 16, alignItems: "center" }}
          onPress={() => show("Application saved locally. Employer inbox connects when Jobs API is live.")}
        >
          <Text style={{ color: "#111", fontWeight: "800" }}>Apply now</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: C.accent, fontWeight: "600" }}>‹ Home</Text></TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Jobs</Text>
        <Ionicons name="search" size={20} color={C.text2} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: filter === f ? C.accent : "transparent",
              borderWidth: 1,
              borderColor: filter === f ? C.accent : C.border,
            }}
          >
            <Text style={{ color: filter === f ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ marginHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: C.elevated, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 44 }}>
        <Ionicons name="search" size={18} color={C.text3} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search jobs..." placeholderTextColor={C.text3} style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 15 }} />
      </View>

      {list.map((j) => (
        <TouchableOpacity
          key={j.id}
          onPress={() => setActive(j)}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            padding: 14,
            borderRadius: 16,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: j.color + "33", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="briefcase-outline" size={20} color={j.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{j.title}</Text>
            <Text style={{ color: C.text2, fontSize: 12, marginTop: 3 }}>{j.location} · {j.type}</Text>
            <Text style={{ color: C.text, fontSize: 13, fontWeight: "700", marginTop: 4 }}>{j.salary}</Text>
          </View>
          <TouchableOpacity
            onPress={() => show("Application saved locally until Jobs API is live.")}
            style={{ backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}
          >
            <Text style={{ color: "#111", fontWeight: "800", fontSize: 12 }}>Apply</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
