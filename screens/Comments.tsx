import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { postComment } from "../lib/api";

export type Comment = {
  id: string;
  takeId: string;
  text: string;
  name: string;
  time: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  takeId: string;
  takeAuthor: string;
  takeText: string;
  token?: string | null;
  C: any;
  isDark: boolean;
  show: (m: string) => void;
};

const SEED: Record<string, Comment[]> = {
  "1": [
    { id: "c1", takeId: "1", text: "This is what Lagos needs — real tools for market women.", name: "Femi Bankole", time: "1h" },
    { id: "c2", takeId: "1", text: "When is the public pilot?", name: "Amaka Nwosu", time: "45m" },
  ],
  "2": [
    { id: "c3", takeId: "2", text: "On repeat already 🔥", name: "Tunde Okoye", time: "3h" },
  ],
};

export function CommentsSheet({
  visible,
  onClose,
  takeId,
  takeAuthor,
  takeText,
  token,
  C,
  isDark,
  show,
}: Props) {
  const [list, setList] = useState<Comment[]>(() => SEED[takeId] || []);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setList(SEED[takeId] || []);
    setDraft("");
  }, [takeId, visible]);

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    title: { fontSize: 17, fontWeight: "700", color: C.text },
    close: { fontSize: 15, fontWeight: "600", color: C.accent },
    origin: {
      margin: 14,
      padding: 12,
      backgroundColor: C.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.border,
    },
    originAuthor: { fontSize: 13, fontWeight: "700", color: C.text },
    originText: { fontSize: 13, color: C.text2, marginTop: 4, lineHeight: 18 },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    name: { fontSize: 13, fontWeight: "700", color: C.text },
    time: { fontSize: 11, color: C.text3, marginLeft: 8 },
    body: { fontSize: 14, color: C.text, marginTop: 4, lineHeight: 20 },
    empty: { textAlign: "center", color: C.text3, marginTop: 40, fontSize: 14 },
    composer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: C.border,
      backgroundColor: C.bg,
    },
    input: {
      flex: 1,
      backgroundColor: C.input,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: C.text,
      borderWidth: 1,
      borderColor: C.border,
      fontSize: 14,
    },
    send: {
      backgroundColor: C.accent,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
    },
    sendText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <View style={styles.head}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.origin}>
          <Text style={styles.originAuthor}>{takeAuthor}</Text>
          <Text style={styles.originText} numberOfLines={3}>
            {takeText}
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {list.length === 0 ? (
            <Text style={styles.empty}>No comments yet — be first</Text>
          ) : (
            list.map((c) => (
              <View key={c.id} style={styles.row}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.time}>{c.time}</Text>
                </View>
                <Text style={styles.body}>{c.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment…"
              placeholderTextColor={C.text3}
              value={draft}
              onChangeText={setDraft}
            />
            <TouchableOpacity
              style={[styles.send, { opacity: draft.trim() && !sending ? 1 : 0.5 }]}
              disabled={!draft.trim() || sending}
              onPress={async () => {
                setSending(true);
                const r = await postComment(takeId, draft, token);
                setSending(false);
                if (r.ok) {
                  const saved = (r as any).data?.comment || (r as any).data?.reply || (r as any).data;
                  if (!saved) {
                    show("Comment response was empty");
                    return;
                  }
                  setList((prev) => [
                    ...prev,
                    {
                      id: String(saved.id || `local-${Date.now()}`),
                      takeId,
                      text: saved.text || saved.body || draft.trim(),
                      name: saved.name || "You",
                      time: saved.time || "now",
                    },
                  ]);
                  setDraft("");
                  show(r.source === "live" ? "Comment posted" : "Comment added in this preview");
                } else {
                  show(`Comment failed: ${r.error || "service unavailable"}`);
                }
              }}
            >
              <Text style={styles.sendText}>{sending ? "…" : "Send"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
