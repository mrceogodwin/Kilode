import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { CHAT_THREADS } from "../data";

type Props = {
  s: any;
  C: any;
  onBack: () => void;
  show: (m: string) => void;
};

export function ChatScreen({ s, C, onBack, show }: Props) {
  const [active, setActive] = useState<(typeof CHAT_THREADS)[0] | null>(null);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [threads, setThreads] = useState(CHAT_THREADS);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return threads;
    return threads.filter(
      (x) => x.name.toLowerCase().includes(t) || x.preview.toLowerCase().includes(t)
    );
  }, [threads, q]);

  if (active) {
    const thread = threads.find((t) => t.id === active.id) || active;
    return (
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <View style={[s.header, { borderBottomWidth: 1, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => setActive(null)}>
            <Text style={s.link}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{thread.name}</Text>
          <TouchableOpacity onPress={() => show("Thread info")}>
            <Text style={s.meta}>•••</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.flex} contentContainerStyle={{ padding: 14, gap: 10 }} keyboardShouldPersistTaps="handled">
          {thread.messages.map((m) => (
            <View
              key={m.id}
              style={{
                alignSelf: m.me ? "flex-end" : "flex-start",
                maxWidth: "80%",
                backgroundColor: m.me ? C.accent : C.card,
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: m.me ? 0 : 1,
                borderColor: C.border,
              }}
            >
              {!m.me ? <Text style={[s.meta, { marginBottom: 2 }]}>{m.from}</Text> : null}
              <Text style={{ color: m.me ? "#fff" : C.text, fontSize: 15, lineHeight: 21 }}>{m.text}</Text>
              <Text style={{ color: m.me ? "rgba(255,255,255,0.7)" : C.text3, fontSize: 11, marginTop: 4 }}>
                {m.time}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: C.border,
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => show("Attach")} style={s.iconBtn}>
            <Text style={s.iconBtnText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: C.input,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: C.text,
              borderWidth: 1,
              borderColor: C.border,
            }}
            placeholder="Type a message"
            placeholderTextColor={C.text3}
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            style={[s.postBtn, { opacity: draft.trim() ? 1 : 0.5 }]}
            onPress={() => {
              if (!draft.trim()) return;
              const msg = {
                id: `local-${Date.now()}`,
                from: "You",
                text: draft.trim(),
                time: "now",
                me: true,
              };
              setThreads((prev) =>
                prev.map((t) =>
                  t.id === thread.id
                    ? { ...t, messages: [...t.messages, msg], preview: draft.trim(), unread: 0 }
                    : t
                )
              );
              setDraft("");
              show("Sent");
            }}
          >
            <Text style={s.postBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={s.flex} contentContainerStyle={s.scrollPad}>
      <View style={s.padH}>
        <Text style={s.h1}>Chat</Text>
        <Text style={s.sub}>Rooms & DMs</Text>
      </View>
      <View style={{ paddingHorizontal: 14, marginTop: 10, marginBottom: 6 }}>
        <TextInput
          style={{
            backgroundColor: C.input,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: C.text,
            borderWidth: 1,
            borderColor: C.border,
            fontSize: 14,
          }}
          placeholder="Search chats"
          placeholderTextColor={C.text3}
          value={q}
          onChangeText={setQ}
        />
      </View>
      <TouchableOpacity
        style={[s.primaryBtn, { marginHorizontal: 14, marginVertical: 8 }]}
        onPress={() => show("New chat · pick people next")}
      >
        <Text style={s.primaryBtnText}>New message</Text>
      </TouchableOpacity>
      {filtered.map((t) => (
        <TouchableOpacity key={t.id} style={s.roomRow} onPress={() => setActive(t)}>
          <View style={s.roomAv}>
            <Text style={s.roomAvText}>{t.name.replace("#", "").slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={s.flex}>
            <Text style={s.roomName}>{t.name}</Text>
            <Text style={s.meta} numberOfLines={1}>
              {t.preview}
            </Text>
          </View>
          {t.unread > 0 ? (
            <View
              style={{
                backgroundColor: C.accent,
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{t.unread}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[s.ghostBtn, { marginHorizontal: 14, alignItems: "center", marginTop: 12 }]} onPress={onBack}>
        <Text style={s.ghostBtnText}>Back home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
