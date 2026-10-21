import React, { useState } from "react";
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import {
  completeMusicUpload,
  getMusicUploadStatus,
  publishMusicTrack,
  requestMusicUpload,
  uploadMusicAsset,
} from "../lib/api";

type PickedAudio = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
};

type Props = {
  visible: boolean;
  token: string;
  C: any;
  onClose: () => void;
  show: (message: string) => void;
  onPublished: () => void;
};

const MAX_AUDIO_BYTES = 100 * 1024 * 1024;

function normalizeState(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[ -]+/g, "_") : "";
}

export function MusicUploadSheet({ visible, token, C, onClose, show, onPublished }: Props) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [audio, setAudio] = useState<PickedAudio | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [message, setMessage] = useState("");
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null);

  const fail = (text: string) => {
    setMessage(text);
    show(text);
  };

  const chooseAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri || !asset.name) {
        fail("Kilode could not read that audio file. Please select it again.");
        return;
      }
      if (typeof asset.size === "number" && asset.size > MAX_AUDIO_BYTES) {
        fail("Audio files must be 100 MB or smaller for this upload flow.");
        return;
      }
      const extension = asset.name.split(".").pop()?.toLowerCase() || "";
      const mimeByExtension: Record<string, string> = {
        mp3: "audio/mpeg",
        m4a: "audio/mp4",
        mp4: "audio/mp4",
        aac: "audio/aac",
        wav: "audio/wav",
        flac: "audio/flac",
        ogg: "audio/ogg",
        opus: "audio/opus",
        aiff: "audio/aiff",
        aif: "audio/aiff",
      };
      const extensionMime = mimeByExtension[extension];
      const reportedMime = asset.mimeType?.toLowerCase() || "";
      if (!reportedMime.startsWith("audio/") && !extensionMime) {
        fail("Choose an audio file such as MP3, M4A, WAV, FLAC or AAC.");
        return;
      }
      let fileSize = typeof asset.size === "number" ? asset.size : 0;
      if (!fileSize) {
        try {
          const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
          if (info.exists && "size" in info && typeof info.size === "number") {
            fileSize = info.size;
          }
        } catch {
          // The server still validates the actual uploaded object and size.
        }
      }
      if (fileSize > MAX_AUDIO_BYTES) {
        fail("Audio files must be 100 MB or smaller for this upload flow.");
        return;
      }
      setAudio({
        uri: asset.uri,
        name: asset.name,
        mimeType: reportedMime.startsWith("audio/") ? reportedMime : (extensionMime || "application/octet-stream"),
        size: fileSize,
      });
      setMessage("");
    } catch {
      fail("Could not open the audio picker. Please try again.");
    }
  };

  const publishIfReady = async (trackId: string) => {
    setStage("Submitting track for review…");
    const result = await publishMusicTrack(token, trackId, {
      title: title.trim(),
      genre: genre.trim() || undefined,
      rightsConfirmation: true,
    });
    if (!result.ok) {
      fail(result.error || "The audio is processed, but Kilode could not submit it for review yet.");
      return false;
    }
    const state = normalizeState(result.data?.state) || "submitted";
    setMessage(`Track submitted · status: ${state.replace(/_/g, " ")}`);
    show(`Track submitted · ${state.replace(/_/g, " ")}`);
    setPendingUploadId(null);
    onPublished();
    return true;
  };

  const checkProcessing = async () => {
    if (!pendingUploadId || busy) return;
    setBusy(true);
    setStage("Checking audio processing…");
    try {
      const result = await getMusicUploadStatus(token, pendingUploadId);
      if (!result.ok || !result.data) {
        fail(result.error || "Could not check processing status. Try again.");
        return;
      }
      const state = normalizeState(result.data.state);
      const trackId = result.data.trackId;
      if (["failed", "rejected", "error"].includes(state)) {
        fail(`Kilode could not process this audio (${state.replace(/_/g, " ")}).`);
      } else if (["processed", "ready", "ready_to_publish", "complete", "completed"].includes(state) && trackId) {
        await publishIfReady(String(trackId));
      } else if (state === "published" && trackId) {
        setMessage("This track is already published.");
        setPendingUploadId(null);
        onPublished();
      } else {
        setMessage(`Audio status: ${state.replace(/_/g, " ") || "processing"}. Check again shortly.`);
      }
    } catch {
      fail("Could not check processing status. Try again.");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const submitUpload = async () => {
    if (busy) return;
    if (!token.trim() || ["guest", "local", "live"].includes(token)) {
      fail("Sign in with a real Kilode Artist account before uploading music.");
      return;
    }
    if (title.trim().length < 2) {
      fail("Enter a track title first.");
      return;
    }
    if (!audio) {
      fail("Choose an audio file first.");
      return;
    }
    if (!rightsConfirmed) {
      fail("Confirm that you own or have permission to distribute this recording.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      setStage("Preparing secure upload…");
      const ticket = await requestMusicUpload(token, {
        fileName: audio.name,
        contentType: audio.mimeType,
        sizeBytes: audio.size,
        title: title.trim(),
        genre: genre.trim() || undefined,
      });
      const uploadId = ticket.data?.uploadId;
      const uploadUrl = ticket.data?.uploadUrl;
      if (!ticket.ok || !uploadId || !uploadUrl) {
        fail(ticket.error || "The dedicated Kilode music upload service is not connected.");
        return;
      }

      setStage("Uploading original audio…");
      const uploaded = await uploadMusicAsset(uploadUrl, audio.uri, audio.mimeType);
      if (!uploaded.ok) {
        fail(uploaded.error || "Audio upload failed.");
        return;
      }

      setStage("Sending audio for processing…");
      const completed = await completeMusicUpload(token, uploadId);
      if (!completed.ok || !completed.data) {
        setPendingUploadId(uploadId);
        fail(completed.error || "Audio uploaded, but processing could not be started. Check status to retry.");
        return;
      }
      setPendingUploadId(uploadId);
      const state = normalizeState(completed.data.state);
      const trackId = completed.data.trackId;
      if (["processed", "ready", "ready_to_publish", "complete", "completed"].includes(state) && trackId) {
        await publishIfReady(String(trackId));
      } else if (state === "published" && trackId) {
        setMessage("This track is already published.");
        setPendingUploadId(null);
        onPublished();
      } else if (["failed", "rejected", "error"].includes(state)) {
        fail(`Kilode could not process this audio (${state.replace(/_/g, " ")}).`);
      } else {
        setMessage("Audio uploaded. Kilode is processing it before publication.");
        show("Audio uploaded · processing pending");
      }
    } catch {
      fail("Upload interrupted. Check your connection before retrying.");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const close = () => {
    if (busy) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.64)" }}>
        <TouchableOpacity onPress={close} disabled={busy} activeOpacity={1} style={{ flex: 1 }} accessibilityLabel="Close upload sheet" />
        <View style={{ backgroundColor: C.card || "#18181C", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: C.border || "#2A2A30", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 }}>
          <View style={{ width: 38, height: 4, borderRadius: 3, backgroundColor: C.text3 || "#777", alignSelf: "center", marginBottom: 16 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <View>
              <Text style={{ color: C.text || "#fff", fontSize: 21, fontWeight: "800" }}>Upload a track</Text>
              <Text style={{ color: C.text2 || "#aaa", fontSize: 12, marginTop: 4 }}>Original audio · up to 100 MB</Text>
            </View>
            <TouchableOpacity onPress={close} disabled={busy} accessibilityRole="button" accessibilityLabel="Close upload">
              <Ionicons name="close" size={24} color={C.text || "#fff"} />
            </TouchableOpacity>
          </View>
          <TextInput value={title} onChangeText={setTitle} placeholder="Track title" placeholderTextColor={C.text3 || "#888"} editable={!busy} style={{ color: C.text || "#fff", backgroundColor: C.input || "#101014", borderColor: C.border || "#2A2A30", borderWidth: 1, borderRadius: 12, padding: 13, marginTop: 14 }} />
          <TextInput value={genre} onChangeText={setGenre} placeholder="Genre (optional)" placeholderTextColor={C.text3 || "#888"} editable={!busy} style={{ color: C.text || "#fff", backgroundColor: C.input || "#101014", borderColor: C.border || "#2A2A30", borderWidth: 1, borderRadius: 12, padding: 13, marginTop: 10 }} />
          <TouchableOpacity onPress={() => void chooseAudio()} disabled={busy} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.input || "#101014", borderColor: C.border || "#2A2A30", borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12 }}>
            <Ionicons name="musical-notes" size={21} color={C.accent || "#D4AF37"} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text || "#fff", fontSize: 14, fontWeight: "700" }}>{audio?.name || "Choose audio file"}</Text>
              <Text style={{ color: C.text2 || "#aaa", fontSize: 11, marginTop: 3 }}>{audio ? (audio.size ? `${(audio.size / (1024 * 1024)).toFixed(1)} MB` : audio.mimeType) : "MP3 · M4A · WAV · FLAC · AAC"}</Text>
            </View>
            <Ionicons name="folder-open-outline" size={20} color={C.text2 || "#aaa"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRightsConfirmed((value) => !value)} disabled={busy} accessibilityRole="checkbox" accessibilityState={{ checked: rightsConfirmed }} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 14 }}>
            <Ionicons name={rightsConfirmed ? "checkbox" : "square-outline"} size={22} color={rightsConfirmed ? (C.accent || "#D4AF37") : (C.text2 || "#aaa")} />
            <Text style={{ flex: 1, color: C.text2 || "#aaa", fontSize: 12, lineHeight: 18 }}>I own this recording or have permission to distribute it, and I agree to Kilode’s music rights rules.</Text>
          </TouchableOpacity>
          {message ? <Text accessibilityRole="text" style={{ color: C.text2 || "#aaa", fontSize: 12, lineHeight: 17, marginTop: 12 }}>{message}</Text> : null}
          {busy && stage ? <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}><ActivityIndicator color={C.accent || "#D4AF37"} /><Text style={{ color: C.text2 || "#aaa", fontSize: 12 }}>{stage}</Text></View> : null}
          <TouchableOpacity onPress={() => void submitUpload()} disabled={busy} accessibilityRole="button" style={{ backgroundColor: C.accent || "#D4AF37", borderRadius: 13, padding: 15, alignItems: "center", marginTop: 16, opacity: busy ? 0.6 : 1 }}>
            <Text style={{ color: "#0D0D10", fontWeight: "800", fontSize: 14 }}>{busy ? "Working…" : "Upload track"}</Text>
          </TouchableOpacity>
          {pendingUploadId ? <TouchableOpacity onPress={() => void checkProcessing()} disabled={busy} accessibilityRole="button" style={{ borderColor: C.border || "#2A2A30", borderWidth: 1, borderRadius: 13, padding: 13, alignItems: "center", marginTop: 9, opacity: busy ? 0.6 : 1 }}><Text style={{ color: C.text || "#fff", fontWeight: "700", fontSize: 13 }}>Check processing status</Text></TouchableOpacity> : null}
          <Text style={{ color: C.text3 || "#888", fontSize: 10, lineHeight: 15, marginTop: 12 }}>Tracks are not public until Kilode’s server finishes processing, rights checks and publication review.</Text>
        </View>
      </View>
    </Modal>
  );
}
