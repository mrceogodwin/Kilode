import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { can } from "../lib/permissions";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  color: string;
  tags?: string[];
};

type Props = { s: any; C: any; onBack: () => void; show: (m: string) => void; accountKind?: string };

const FILTERS = ["All", "Full-time", "Part-time", "Remote"];

export const JOBS: Job[] = [
  { id: "j1", title: "Frontend Developer", company: "Paystack Labs", location: "Lagos, Nigeria", type: "Full-time", salary: "₦250k – ₦400k/month", color: "#3B82F6", tags: ["React", "TypeScript"] },
  { id: "j2", title: "Marketing Executive", company: "Flutterwave", location: "Lagos, Nigeria", type: "Full-time", salary: "₦150k – ₦250k/month", color: "#A855F7", tags: ["Growth", "Brand"] },
  { id: "j3", title: "UI/UX Designer", company: "Kuda Bank", location: "Remote", type: "Full-time", salary: "₦200k – ₦350k/month", color: "#06B6D4", tags: ["Figma", "Product"] },
  { id: "j4", title: "Business Analyst", company: "Interswitch", location: "Abuja, Nigeria", type: "Full-time", salary: "₦180k – ₦300k/month", color: "#F59E0B", tags: ["Data", "Strategy"] },
  { id: "j5", title: "Content Writer", company: "Kilode Media", location: "Abuja, Nigeria", type: "Part-time", salary: "Contract", color: "#10B981", tags: ["Editorial"] },
  { id: "j6", title: "React Native Engineer", company: "Andela", location: "Remote", type: "Full-time", salary: "₦400k – ₦650k/month", color: "#E5C158", tags: ["Expo", "iOS"] },
];

export function JobsScreen({ s, C, onBack, show, accountKind }: Props) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Job | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const canPost = can(accountKind, "jobs_post");
  const canApply = can(accountKind, "jobs_apply") || can(accountKind, "feed_post");

  const list = useMemo(() => {
    let rows = JOBS;
    if (filter === "Full-time") rows = rows.filter((j) => j.type === "Full-time");
    if (filter === "Part-time") rows = rows.filter((j) => j.type === "Part-time");
    if (filter === "Remote") rows = rows.filter((j) => /remote/i.test(j.location));
    if (q.trim()) {
      const n = q.toLowerCase();
      rows = rows.filter((j) => `${j.title} ${j.company}`.toLowerCase().includes(n));
    }
    return rows;
  }, [filter, q]);

  if (active) {
    return (
      <ScrollView style={s.flex} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setActive(null)} style={{ marginBottom: 12 }}>
          <Text style={{ color: C.accent, fontWeight: "600" }}>‹ Jobs</Text>
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: active.color, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>{active.company.slice(0, 1)}</Text>
        </View>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: "800", marginTop: 14 }}>{active.title}</Text>
        <Text style={{ color: C.text2, marginTop: 6, fontSize: 15 }}>{active.company}</Text>
        <Text style={{ color: C.text3, marginTop: 4 }}>{active.location} · {active.type}</Text>
        <Text style={{ color: C.accent, fontWeight: "800", marginTop: 14, fontSize: 17 }}>{active.salary}</Text>
        {active.tags ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {active.tags.map((t) => (
              <View key={t} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ color: C.text2, fontSize: 12, fontWeight: "600" }}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={{ color: C.text2, marginTop: 18, lineHeight: 21, fontSize: 14 }}>
          Role posted on Kilode Jobs. Apply saves your interest on this device until the employer inbox API is live.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 24, backgroundColor: canApply ? C.accent : C.elevated, borderRadius: 999, paddingVertical: 16, alignItems: "center", opacity: canApply ? 1 : 0.5 }}
          onPress={() =>
            canApply
              ? show("Application saved locally. Employer inbox connects when Jobs API is live.")
              : show("This account type cannot apply. Register as Job Seeker or Member.")
          }
        >
          <Text style={{ color: canApply ? "#111" : C.text2, fontWeight: "800", fontSize: 16 }}>Apply now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10, borderRadius: 999, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: C.border }}
          onPress={() => {
            setSaved((p) => ({ ...p, [active.id]: !p[active.id] }));
            show(saved[active.id] ? "Removed from saved" : "Saved job");
          }}
        >
          <Text style={{ color: C.text, fontWeight: "700" }}>{saved[active.id] ? "Saved" : "Save job"}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            canPost
              ? show("Job post form when Jobs API is live.")
              : show("Job Poster accounts can list roles.")
          }
        >
          <Ionicons name="add-circle-outline" size={22} color={canPost ? C.accent : C.text3} />
        </TouchableOpacity>
      </View>

      {canPost ? (
        <TouchableOpacity
          onPress={() => show("Post a job when Jobs API is live.")}
          style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: C.accent, borderRadius: 999, paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={{ color: "#111", fontWeight: "800", fontSize: 14 }}>Post a job</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ marginHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: C.elevated, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 42 }}>
        <Ionicons name="search" size={18} color={C.text3} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search roles or companies" placeholderTextColor={C.text3} style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 15 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 8 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: filter === f ? C.accent : "transparent", borderWidth: 1, borderColor: filter === f ? C.accent : C.border }}
          >
            <Text style={{ color: filter === f ? "#111" : C.text2, fontWeight: "700", fontSize: 13 }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {list.map((j) => (
        <TouchableOpacity
          key={j.id}
          activeOpacity={0.88}
          onPress={() => setActive(j)}
          style={{ marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, flexDirection: "row", gap: 12 }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: j.color, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>{j.company.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{j.title}</Text>
            <Text style={{ color: C.text2, fontSize: 13, marginTop: 3 }}>{j.company}</Text>
            <Text style={{ color: C.text3, fontSize: 12, marginTop: 4 }}>{j.location} · {j.type}</Text>
            <Text style={{ color: C.accent, fontWeight: "700", fontSize: 13, marginTop: 6 }}>{j.salary}</Text>
          </View>
          <View style={{ justifyContent: "center" }}>
            <View style={{ backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
              <Text style={{ color: "#111", fontWeight: "800", fontSize: 12 }}>Apply</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {list.length === 0 ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ color: C.text2 }}>No roles match this filter.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
