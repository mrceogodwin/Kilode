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
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  storageScope?: string | null;
  C: any;
  isDark: boolean;
  show: (m: string) => void;
};



export function CommentsSheet({
  visible,
  onClose,
  takeId,
  takeAuthor,
  takeText,
  token,
  storageScope,
  C,
  isDark,
  show,
}: Props) {
  const [list, setList] = useState<Comment[]>([]);
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
  const commentStorageKey = `kilode:social-comments:${String(storageScope || "guest").toLowerCase()}:${String(takeId)}`;

  useEffect(() => {
    if (!visible || !takeId) {
      setDraft("");
      return;
    }
    let active = true;
    setLoadingComments(true);
    AsyncStorage.getItem(commentStorageKey)
      .then((raw) => {
        if (!active) return;
        let saved: Comment[] = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              saved = parsed.filter((item) =>
                item && typeof item.id === "string" &&
                typeof item.text === "string" && String(item.takeId) === String(takeId)
              );
            }
          } catch {
            saved = [];
          }
        }
        if (!active) return;
        setLocalComments(saved);
        setList(saved);
      })
      .catch(() => {
        if (active) {
          setLocalComments([]);
          setList([]);
        }
      })
      .finally(() => {
        if (active) setLoadingComments(false);
      });
    setDraft("");
    return () => { active = false; };
  }, [commentStorageKey, takeId, visible]);

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

        <Text style={{ color: C.text3, fontSize: 11, paddingHorizontal: 16, paddingTop: 2 }}>
          Device-saved comments · server history not connected yet
        </Text>

        <ScrollView style={{ flex: 1 }}>
          {loadingComments ? (
            <Text style={styles.empty}>Loading comments…</Text>
          ) : list.length === 0 ? (
            <Text style={styles.empty}>No comments saved on this device yet</Text>
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
              disabled={!draft.trim() || sending || loadingComments}
              onPress={async () => {
                if (sending || loadingComments || !draft.trim()) return;
                setSending(true);
                const submittedText = draft.trim();
                let r;
                try {
                  r = await postComment(takeId, submittedText, token ?? undefined);
                } catch {
                  setSending(false);
                  show("Comment could not be sent. Try again.");
                  return;
                }
                if (r.ok && r.data) {
                  const saved = r.data.comment || r.data.reply || r.data;

                  const nextComment: Comment = {
                    id: String(saved.id || ("local-" + Date.now())),
                    takeId,
                    text: saved.text || saved.body || submittedText,
                    name: saved.name || saved.author?.name || "You",
                    time: saved.time || "now",
                  };
                  setList((prev) => [...prev, nextComment]);
                  const nextLocalComments = [...localComments, nextComment];
                  setLocalComments(nextLocalComments);
                  let cacheFailed = false;
                  try {
                    await AsyncStorage.setItem(commentStorageKey, JSON.stringify(nextLocalComments));
                  } catch {
                    cacheFailed = true;
                  }
                  setDraft("");
                  setSending(false);
                  show(cacheFailed
                    ? "Comment sent, but couldn't save it on this device."
                    : r.source === "live"
                      ? "Comment sent to Kilode"
                      : "Comment added to this preview");
                } else {
                  setSending(false);
                  show(r.error ? ("Comment not sent: " + r.error) : "Comment could not be sent");
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
