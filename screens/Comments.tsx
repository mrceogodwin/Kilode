import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { postComment } from "../lib/api";

type Comment = { id: string; name: string; text: string; time: string };

type Props = {
  visible: boolean;
  takeId: string;
  takePreview?: string;
  token?: string | null;
  C: any;
  onClose: () => void;
  show: (m: string) => void;
};

const SEED: Record<string, Comment[]> = {
  "1": [
    { id: "c1", name: "Femi", text: "This is the real commerce play for Yaba.", time: "1h" },
    { id: "c2", name: "Amaka", text: "Would use this for our pilot stalls.", time: "45m" },
  ],
  "2": [{ id: "c3", name: "Chioma", text: "Stream on loop since morning.", time: "3h" }],
};

export function CommentsSheet({ visible, takeId, takePreview, token, C, onClose, show }: Props) {
  const [list, setList] = useState<Comment[]>(SEED[takeId] || []);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]}>
        <View style={[styles.head, { borderBottomColor: C.border }]}>
          <Text style={[styles.title, { color: C.text }]}>Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: C.accent, fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </View>
        {takePreview ? (
          <Text style={[styles.preview, { color: C.text2 }]} numberOfLines={2}>
            {takePreview}
          </Text>
        ) : null}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 12 }}>
          {list.length === 0 ? (
            <Text style={{ color: C.text3, textAlign: "center", marginTop: 40 }}>No comments yet</Text>
          ) : (
            list.map((c) => (
              <View key={c.id} style={[styles.row, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[styles.name, { color: C.text }]}>{c.name}</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{c.text}</Text>
                <Text style={{ color: C.text3, fontSize: 11, marginTop: 4 }}>{c.time}</Text>
              </View>
            ))
          )}
        </ScrollView>
        <View style={[styles.composer, { borderTopColor: C.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: C.input, color: C.text, borderColor: C.border }]}
            placeholder="Add a comment…"
            placeholderTextColor={C.text3}
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity
            style={[styles.send, { backgroundColor: C.accent, opacity: draft.trim() && !busy ? 1 : 0.5 }]}
            disabled={!draft.trim() || busy}
            onPress={async () => {
              setBusy(true);
              const r = await postComment(takeId, draft, token);
              setBusy(false);
              if (r.ok && r.comment) {
                setList((prev) => [
                  ...prev,
                  {
                    id: (r.comment as any).id,
                    name: (r.comment as any).name || "You",
                    text: (r.comment as any).text || draft,
                    time: (r.comment as any).time || "now",
                  },
                ]);
                setDraft("");
                show(r.source === "live" ? "Comment live" : "Comment saved");
              }
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: "700" },
  preview: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 13 },
  row: { padding: 12, borderRadius: 14, borderWidth: 1 },
  name: { fontWeight: "700", fontSize: 13, marginBottom: 4 },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  send: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
});
