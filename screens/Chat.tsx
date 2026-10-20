import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CHAT_THREADS } from "../data";

type Thread = (typeof CHAT_THREADS)[0] & { messages?: { id: string; from: "me" | "them"; text: string; time: string }[] };

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
};

const ROOMS = [
  { id: "r1", name: "#afrobeats", meta: "1.2k online", color: "#E5C158" },
  { id: "r2", name: "#lagos-tech", meta: "840 online", color: "#3B82F6" },
  { id: "r3", name: "#naija-creatives", meta: "2.1k online", color: "#A855F7" },
];

export function ChatScreen({ s, C, onBack, show }: Props) {
  const [tab, setTab] = useState<"messages" | "rooms">("messages");
  const [active, setActive] = useState<Thread | null>(null);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [threads, setThreads] = useState<Thread[]>(
    CHAT_THREADS.map((t) => ({
      ...t,
      messages: [
        { id: "m1", from: "them" as const, text: t.preview, time: t.time || "1h" },
        { id: "m2", from: "me" as const, text: "Noted — will reply properly when chat is live.", time: "now" },
      ],
    }))
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return threads;
    return threads.filter(
      (x) => x.name.toLowerCase().includes(t) || (x.preview || "").toLowerCase().includes(t)
    );
  }, [threads, q]);

  const send = () => {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setDraft("");
    setThreads((prev) =>
      prev.map((th) =>
        th.id === active.id
          ? {
              ...th,
              preview: text,
              time: "now",
              messages: [...(th.messages || []), { id: `m${Date.now()}`, from: "me" as const, text, time: "now" }],
            }
          : th
      )
    );
    setActive((a) =>
      a
        ? {
            ...a,
            messages: [...(a.messages || []), { id: `m${Date.now()}`, from: "me" as const, text, time: "now" }],
          }
        : a
    );
    show("Message saved on this device. Live delivery needs chat backend.");
  };

  if (active) {
    const thread = threads.find((t) => t.id === active.id) || active;
    return (
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
            gap: 10,
          }}
        >
          <TouchableOpacity onPress={() => setActive(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={22} color={C.accent} />
          </TouchableOpacity>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: C.elevated,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: C.text, fontWeight: "800" }}>{thread.name.replace("#", "").slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{thread.name}</Text>
            <Text style={{ color: C.text3, fontSize: 11 }}>Preview chat · not live</Text>
          </View>
        </View>

        <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 20 }}>
          {(thread.messages || []).map((m) => {
            const mine = m.from === "me";
            return (
              <View
                key={m.id}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                  backgroundColor: mine ? C.accent : C.elevated,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  borderBottomRightRadius: mine ? 4 : 16,
                  borderBottomLeftRadius: mine ? 16 : 4,
                }}
              >
                <Text style={{ color: mine ? "#111" : C.text, fontSize: 14, lineHeight: 19 }}>{m.text}</Text>
                <Text style={{ color: mine ? "rgba(0,0,0,0.45)" : C.text3, fontSize: 10, marginTop: 4, alignSelf: "flex-end" }}>
                  {m.time}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: C.border,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={C.text3}
            style={{
              flex: 1,
              backgroundColor: C.elevated,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
              fontSize: 15,
            }}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={send}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: C.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="send" size={16} color="#111" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: C.accent, fontWeight: "600", fontSize: 14 }}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "800" }}>Chat</Text>
        <TouchableOpacity onPress={() => show("New chat when contacts API is live.")}>
          <Ionicons name="create-outline" size={22} color={C.accent} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginHorizontal: 16, marginTop: 12, gap: 8 }}>
        {(["messages", "rooms"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: tab === t ? C.accent : C.elevated,
              borderWidth: 1,
              borderColor: tab === t ? C.accent : C.border,
            }}
          >
            <Text style={{ color: tab === t ? "#111" : C.text2, fontWeight: "800", fontSize: 13 }}>
              {t === "messages" ? "Messages" : "Rooms"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.elevated,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.border,
          paddingHorizontal: 12,
          height: 42,
        }}
      >
        <Ionicons name="search" size={18} color={C.text3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={tab === "rooms" ? "Search rooms" : "Search chats"}
          placeholderTextColor={C.text3}
          style={{ flex: 1, marginLeft: 8, color: C.text, fontSize: 15 }}
        />
      </View>

      {tab === "rooms" ? (
        <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 10 }}>
          {ROOMS.map((r) => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.88}
              onPress={() =>
                setActive({
                  id: r.id,
                  name: r.name,
                  preview: "Welcome to the room",
                  time: "live",
                  messages: [
                    { id: "rm1", from: "them", text: `Welcome to ${r.name}. Live multi-user chat needs the rooms backend.`, time: "now" },
                  ],
                } as Thread)
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 16,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: r.color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chatbubbles" size={20} color="#111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{r.name}</Text>
                <Text style={{ color: C.text3, fontSize: 12, marginTop: 3 }}>{r.meta}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </TouchableOpacity>
          ))}
          <Text style={{ color: C.text3, fontSize: 12, textAlign: "center", marginTop: 8 }}>
            Room membership is local until Kilode Rooms API is connected.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 8 }}>
          {filtered.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActive(t)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: C.elevated,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: C.text, fontWeight: "800" }}>
                  {t.name.replace("#", "").slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: C.text, fontWeight: "800", fontSize: 15 }}>{t.name}</Text>
                  <Text style={{ color: C.text3, fontSize: 11 }}>{t.time}</Text>
                </View>
                <Text style={{ color: C.text2, fontSize: 13, marginTop: 3 }} numberOfLines={1}>
                  {t.preview}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 ? (
            <Text style={{ color: C.text2, textAlign: "center", marginTop: 24 }}>No chats match.</Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}
