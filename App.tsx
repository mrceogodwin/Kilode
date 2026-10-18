import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import { BLUE, BG, WHITE, BORDER, BLACK, GRAY, GRAY2, TEXT } from "./theme";
import { styles } from "./styles";

const DESKS = [
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "market", label: "Market", icon: "🛍️" },
  { id: "rent", label: "Rent", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "cinema", label: "Cinema", icon: "🎬" },
  { id: "teams", label: "Teams", icon: "👥" },
  { id: "ads", label: "Ads", icon: "📢" },
  { id: "spaces", label: "Spaces", icon: "🏢" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "music", label: "Music", icon: "🎵" },
];

const CREATE = [
  { label: "Post", sub: "Share a take", icon: "✏️", tab: "socials" },
  { label: "Track", sub: "Drop music", icon: "🎵", tab: "music" },
  { label: "Film", sub: "Add cinema", icon: "🎬", tab: "cinema" },
  { label: "Job", sub: "Post job", icon: "💼", tab: "jobs" },
  { label: "Market", sub: "Sell product", icon: "🛍️", tab: "market" },
  { label: "Ad", sub: "Place ad", icon: "📢", tab: "ads" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [createOpen, setCreateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [session, setSession] = useState<null | { user: string }>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notes] = useState([{ id: "1", seen: false }]);

  const show = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };
  const go = (next: string) => {
    setTab(next);
    setSearchOpen(false);
    setCreateOpen(false);
    setMoreOpen(false);
    show(next);
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.live}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.search} onPress={() => setSearchOpen(true)}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go("activity")} style={styles.bell}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          {notes.some((n) => !n.seen) ? <View style={styles.dot} /> : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.k} onPress={() => (session ? go("myspace") : setAuthOpen(true))}>
          <Text style={styles.kText}>{session ? session.user.slice(0, 1).toUpperCase() : "K"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <View style={styles.main}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={styles.pad}>
            <Text style={styles.h1}>Good morning, Lagos</Text>
            <Text style={styles.sub}>Native iOS shell · no website logo · stable dock · More opens Kilode services.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.h2}>Home · {tab}</Text>
            <Text style={styles.body}>
              Header logo removed. Bottom dock no longer floats. Middle + opens More (desks + Create).
              Premium type scale, cards, and buttons applied via styles.ts.
            </Text>
            <TouchableOpacity style={styles.primary} onPress={() => setMoreOpen(true)}>
              <Text style={styles.primaryText}>Open More</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <View style={styles.dock}>
        {[
          ["home", "Home", "⌂"],
          ["socials", "Socials", "◫"],
        ].map(([id, label, icon]) => (
          <TouchableOpacity key={id} style={styles.dockBtn} onPress={() => go(id)} activeOpacity={0.7}>
            <Text style={{ fontSize: 20, color: tab === id ? BLUE : GRAY2 }}>{icon}</Text>
            <Text style={[styles.dockLabel, tab === id && styles.dockLabelOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.moreBtn} onPress={() => setMoreOpen(true)} activeOpacity={0.85}>
          <Text style={styles.moreBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dockBtn} onPress={() => go("activity")} activeOpacity={0.7}>
          <Text style={{ fontSize: 20, color: tab === "activity" ? BLUE : GRAY2 }}>◐</Text>
          <Text style={[styles.dockLabel, tab === "activity" && styles.dockLabelOn]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dockBtn} onPress={() => go("myspace")} activeOpacity={0.7}>
          <Text style={{ fontSize: 20, color: tab === "myspace" ? BLUE : GRAY2 }}>○</Text>
          <Text style={[styles.dockLabel, tab === "myspace" && styles.dockLabelOn]}>My Space</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.between}>
              <Text style={styles.h2}>More on Kilode</Text>
              <TouchableOpacity onPress={() => setMoreOpen(false)}>
                <Text style={{ fontSize: 18, color: GRAY }}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.create, { width: "100%", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }]}
              onPress={() => {
                setMoreOpen(false);
                setCreateOpen(true);
              }}
            >
              <Text style={{ fontSize: 18 }}>✏️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>Create</Text>
                <Text style={styles.meta}>Post, track, film, job, ad…</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.grid}>
              {DESKS.map((d) => (
                <TouchableOpacity key={d.id} style={styles.create} onPress={() => go(d.id)}>
                  <Text style={{ fontSize: 18 }}>{d.icon}</Text>
                  <Text style={styles.name}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.between}>
              <Text style={styles.h2}>Create</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}>
                <Text style={{ fontSize: 18, color: GRAY }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.grid}>
              {CREATE.map((o) => (
                <TouchableOpacity key={o.label} style={styles.create} onPress={() => { go(o.tab); show(o.label); }}>
                  <Text style={{ fontSize: 18 }}>{o.icon}</Text>
                  <Text style={styles.name}>{o.label}</Text>
                  <Text style={styles.meta}>{o.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={authOpen} transparent animationType="fade" onRequestClose={() => setAuthOpen(false)}>
        <View style={styles.authWrap}>
          <View style={styles.card}>
            <Text style={styles.h2}>Join Kilode</Text>
            <Text style={styles.sub}>Username + password · real iOS session shell</Text>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => {
                setSession({ user: "Kelechi" });
                setAuthOpen(false);
                show("Signed in");
              }}
            >
              <Text style={styles.primaryText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
