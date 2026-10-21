import React, { useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toggleMusicPlayback, seekMusicPlayback } from "../lib/musicPlayer";

type Props = {
  visible: boolean;
  track: any;
  playing: boolean;
  C: any;
  onClose: () => void;
  positionMillis: number;
  durationMillis: number;
  onNext: () => void;
  onPrevious: () => void;
  shuffle: boolean;
  repeat: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
};

export function MusicFullPlayer({ visible, track, playing, C, onClose, positionMillis, durationMillis, onNext, onPrevious, shuffle, repeat, onToggleShuffle, onToggleRepeat }: Props) {
  const [progressWidth, setProgressWidth] = useState(1);
  const [scrubPosition, setScrubPosition] = useState<number | null>(null);
  const progressRef = useRef<View>(null);
  const progressBounds = useRef({ x: 0, width: 1, measured: false });

  const positionForPageX = (pageX: number, bounds = progressBounds.current) => {
    if (!durationMillis || !Number.isFinite(pageX) || !bounds.measured) return null;
    const measuredWidth = Math.max(1, bounds.width || progressWidth);
    const ratio = Math.max(0, Math.min(1, (pageX - bounds.x) / measuredWidth));
    return ratio * durationMillis;
  };

  const measureProgress = (onMeasured?: (x: number, width: number) => void) => {
    progressRef.current?.measureInWindow((x, _y, width) => {
      progressBounds.current = { x, width: Math.max(1, width || progressWidth), measured: true };
      onMeasured?.(x, Math.max(1, width || progressWidth));
    });
  };

  const updateScrubPosition = (pageX: number) => {
    const position = positionForPageX(pageX);
    if (position !== null) {
      setScrubPosition(position);
      return;
    }
    measureProgress(() => {
      const measuredPosition = positionForPageX(pageX);
      if (measuredPosition !== null) setScrubPosition(measuredPosition);
    });
  };
  if (!track) return null;
  const artwork = track.artworkUrl || track.artwork_url || track.coverUrl || track.cover_url || track.image;
  const formatTime = (ms: number) => { const total = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`; };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D10" />
      <View style={{ flex: 1, backgroundColor: "#0D0D10", paddingHorizontal: 26, paddingTop: 24, paddingBottom: 34, justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Minimize player" style={{ padding: 10 }}>
            <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#D4AF37", fontSize: 10, letterSpacing: 2, fontWeight: "700" }}>KILODE MUSIC</Text>
            <Text style={{ color: "#9A9A9E", fontSize: 12, marginTop: 4 }}>NOW PLAYING</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={{ width: "100%", aspectRatio: 1, maxWidth: 340, borderRadius: 24, overflow: "hidden", backgroundColor: track.color || "#18181C", borderWidth: 1, borderColor: "#2A2A30", alignItems: "center", justifyContent: "center" }}>
            {artwork ? <Image source={{ uri: artwork }} resizeMode="cover" style={{ width: "100%", height: "100%" }} /> : <Ionicons name="musical-notes" size={86} color="#D4AF37" />}
          </View>
          <View style={{ width: "100%", maxWidth: 340, marginTop: 30, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text numberOfLines={2} style={{ color: "#FFFFFF", fontSize: 25, lineHeight: 31, fontWeight: "800" }}>{track.title || "Untitled track"}</Text>
              <Text numberOfLines={1} style={{ color: "#9A9A9E", fontSize: 15, marginTop: 7 }}>{track.artist || "Kilode artist"}</Text>
            </View>
            <Ionicons name="musical-note" size={24} color="#D4AF37" />
          </View>
        </View>
        <View style={{ width: "100%", maxWidth: 340, alignSelf: "center" }}>
          <View
            ref={progressRef}
            onLayout={(event) => setProgressWidth(Math.max(1, event.nativeEvent.layout.width))}
            onStartShouldSetResponder={() => durationMillis > 0}
            onMoveShouldSetResponder={() => durationMillis > 0}
            onResponderGrant={(event) => {
              setScrubPosition(positionMillis);
              measureProgress(() => updateScrubPosition(event.nativeEvent.pageX));
            }}
            onResponderMove={(event) => {
              updateScrubPosition(event.nativeEvent.pageX);
            }}
            onResponderRelease={(event) => {
              const pageX = event.nativeEvent.pageX;
              const position = positionForPageX(pageX);
              setScrubPosition(null);
              if (position !== null) {
                void seekMusicPlayback(position);
              } else {
                measureProgress(() => {
                  const measuredPosition = positionForPageX(pageX);
                  if (measuredPosition !== null) void seekMusicPlayback(measuredPosition);
                });
              }
            }}
            onResponderTerminate={() => setScrubPosition(null)}
            accessibilityRole="adjustable"
            accessibilityLabel="Track position"
            style={{ height: 28, justifyContent: "center", borderRadius: 9 }}
          >
            <View style={{ height: 4, borderRadius: 2, backgroundColor: "#2A2A30", overflow: "hidden" }}>
              <View style={{ width: `${durationMillis ? Math.min(100, ((scrubPosition ?? positionMillis) / durationMillis) * 100) : 0}%`, height: 4, backgroundColor: "#D4AF37" }} />
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 0 }}>
            <Text style={{ color: "#9A9A9E", fontSize: 11 }}>{formatTime(positionMillis)}</Text>
            <Text style={{ color: "#9A9A9E", fontSize: 11 }}>{formatTime(durationMillis)}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Shuffle" onPress={onToggleShuffle} style={{ padding: 10 }}><Ionicons name="shuffle" size={22} color={shuffle ? "#D4AF37" : "#9A9A9E"} /></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous track" onPress={onPrevious} style={{ padding: 10 }}><Ionicons name="play-skip-back" size={27} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={playing ? "Pause track" : "Play track"} onPress={() => void toggleMusicPlayback()} style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: "#D4AF37", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={playing ? "pause" : "play"} size={29} color="#0D0D10" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next track" onPress={onNext} style={{ padding: 10 }}><Ionicons name="play-skip-forward" size={27} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Repeat current track" onPress={onToggleRepeat} style={{ padding: 10 }}><Ionicons name="repeat" size={22} color={repeat ? "#D4AF37" : "#9A9A9E"} /></TouchableOpacity>
          </View>
          <Text style={{ color: "#9A9A9E", fontSize: 11, textAlign: "center", marginTop: 22 }}>KILODE · YOUR SOUND, YOUR SPACE</Text>
        </View>
      </View>
    </Modal>
  );
}
