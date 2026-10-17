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

const BLUE = "#1877F2";
const BG = "#F6F8FB";
const WHITE = "#FFFFFF";
const BORDER = "#E7ECF2";
const BLACK = "#111827";
const GRAY = "#64748B";
const GRAY2 = "#94A3B8";
const TEXT = "#0F172A";

const ROOMS = [
  { id: "lounge", name: "Lounge", region: "NG" },
  { id: "hot", name: "Hot", region: "NG" },
  { id: "ng", name: "Nigeria", region: "NG" },
  { id: "music", name: "Music", region: "Lagos" },
  { id: "cinema", name: "Cinema", region: "Lagos" },
  { id: "jobs", name: "Jobs", region: "NG" },
  { id: "sport", name: "Sport", region: "NG" },
  { id: "tech", name: "Tech", region: "Lagos" },
  { id: "st-lagos", name: "Lagos", region: "State" },
  { id: "st-fct", name: "FCT", region: "State" },
  { id: "st-rivers", name: "Rivers", region: "State" },
  { id: "north", name: "North", region: "NG" },
];

const AD_VERTICALS = ["Telecom","Banking","Fintech","Fashion","Food","Music","Nollywood","Sports","Jobs","Education","Health","Auto","Real estate","Travel","Beauty","Religion","Politics","NGO","Tech","Retail","Logistics","Agriculture","Energy","Insurance","Betting","Events","Nightlife","Comedy","Podcast","Church","Mosque","School","Hospital","Pharmacy","Hotels","Airlines","Fuel","Cement","Brewery","Soft drinks","Phones","Gadgets","Furniture","Construction","Legal","Media","Government","Startup","Other"];
const CATS = ["Fashion","Beauty","Food","Photography","Tech","Services","Other"];
const KINDS = ["member","writer","artist","advertiser","cinema","job_poster","vendor","renter","brand"];
const KIND_FACE: Record<string, string> = { member: "👤", writer: "✍️", artist: "🎤", advertiser: "📢", cinema: "🎬", job_poster: "💼", vendor: "🛍️", renter: "🏠", brand: "🏢" };
const BANNED = ["scam link", "insult"];

const TRACKS = [
  { id: "t1", title: "Ojuelegba Nights", artist: "Simi Sola", color: "#2563EB" },
  { id: "t2", title: "Eko Energy", artist: "Tayo & Bisi", color: "#059669" },
  { id: "t3", title: "Water & Light", artist: "Obi Dara", color: "#7C3AED" },
  { id: "t4", title: "303 Gidi", artist: "Aje", color: "#EA580C" },
];

const NEWS = [
  { id: "n1", kicker: "Business", place: "Lagos", time: "2h ago", title: "Paystack alumni raise $3.2M to rebuild informal trade rails", tint: "#DBEAFE", filter: "Business" },
  { id: "n2", kicker: "Culture", place: "Nigeria", time: "5h ago", title: "Inside studios keeping highlife alive in Enugu", tint: "#FEF9C3", filter: "Culture" },
  { id: "n3", kicker: "Tech", place: "Lagos", time: "1d ago", title: "How Kilode is rebuilding discovery for Nigerian creators without an algorithm", tint: "#E0E7FF", filter: "Tech" },
];

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
];

const CREATE: { label: string; sub: string; icon: string; tab: string; subtab?: string }[] = [
  { label: "Post", sub: "Share a take", icon: "✏️", tab: "socials" },
  { label: "Article", sub: "Write news", icon: "📰", tab: "home", subtab: "news" },
  { label: "Track", sub: "Drop music", icon: "🎵", tab: "music" },
  { label: "Film", sub: "Add cinema", icon: "🎬", tab: "cinema" },
  { label: "Room", sub: "Start room", icon: "💬", tab: "chat" },
  { label: "Event", sub: "Host event", icon: "📅", tab: "events" },
  { label: "Job", sub: "Post job", icon: "💼", tab: "jobs" },
  { label: "Market", sub: "Sell product", icon: "🛍️", tab: "market" },
  { label: "Rent", sub: "List space", icon: "🏠", tab: "rent" },
  { label: "Ad", sub: "Place ad", icon: "📢", tab: "ads" },
  { label: "Space", sub: "Create space", icon: "🏢", tab: "spaces" },
  { label: "Team", sub: "Create team", icon: "👥", tab: "teams" },
];

function hashOk(value: string) {
  return /^[a-zA-Z0-9]{32,128}$/.test(value.trim());
}
function gateText(value: string) {
  const low = value.toLowerCase();
  const hit = BANNED.find((w) => low.includes(w));
  return hit ? `Held — ${hit}` : "";
}
function adVertical(text: string) {
  const low = text.toLowerCase();
  return AD_VERTICALS.find((v) => low.includes(v.toLowerCase())) || "Other";
}
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type Take = { id: string; name: string; handle: string; time: string; text: string; likes: number; reposts: number; comments: number; kind: string; image?: boolean };
type Msg = { id: string; room: string; mine: boolean; text: string; name: string };
type Job = { id: string; title: string; company: string; place: string; type: string; pay: string };
type Product = { id: string; title: string; price: string; cat: string };
type Rent = { id: string; title: string; place: string; price: string; tag: string };
type Ev = { id: string; title: string; when: string; status: string; hash: string };
type Space = { id: string; name: string; user: string; cat: string; status: string; tagline: string };
type Ad = { id: string; title: string; vertical: string; status: string; views: number };
type Team = { id: string; name: string; members: number; mine: boolean };
type Note = { id: string; text: string; time: string; href: string; seen: boolean; icon: string };

export default function App() {
  const [tab, setTab] = useState("home");
  const [homeSub, setHomeSub] = useState("foryou");
  const [edFilter, setEdFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [session, setSession] = useState<null | { user: string; kind: string }>(null);
  const [userDraft, setUserDraft] = useState("");
  const [passDraft, setPassDraft] = useState("");
  const [kind, setKind] = useState("member");
  const [year, setYear] = useState("1998");
  const [agreeT, setAgreeT] = useState(false);
  const [agreeR, setAgreeR] = useState(false);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<(typeof TRACKS)[number] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [takes, setTakes] = useState<Take[]>([
    { id: "1", name: "Chioma Ade", handle: "choma", time: "12m", kind: "take", likes: 127, reposts: 19, comments: 8, text: "Just shipped our community commerce toolkit. Small traders in Yaba can now take orders via voice note. No dashboard bloat — just WhatsApp + a ledger. Nigerian problems, Nigerian software." },
    { id: "2", name: "Femi Visuals", handle: "femi.vs", time: "4m", kind: "take", likes: 342, reposts: 42, comments: 31, image: true, text: "Shot this on a busted Infinix at 5:43am on Third Mainland. The light did all the work. Lagos never misses if you wake early enough." },
  ]);
  const [replies, setReplies] = useState<Record<string, { name: string; text: string }[]>>({
    "2": [
      { name: "Tobi Q", text: "That haze is wild. What time do you usually head out? Trying to beat danfo traffic for golden hour." },
      { name: "Femi Visuals", text: "5:15 latest. CMS to Ebute bike is the fastest pin." },
    ],
  });
  const [openReply, setOpenReply] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [newTake, setNewTake] = useState("");
  const [writes, setWrites] = useState<number[]>([]);
  const [roomId, setRoomId] = useState("lounge");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", room: "lounge", mine: false, name: "Amaka", text: "Welcome to Kilode lounge. Chronological, no algorithm." },
    { id: "m2", room: "music", mine: false, name: "Simi", text: "Ojuelegba Nights is up. Drop your first listen." },
  ]);
  const [msgDraft, setMsgDraft] = useState("");
  const [customRoom, setCustomRoom] = useState("");
  const [extraRooms, setExtraRooms] = useState<{ id: string; name: string; region: string; paused?: boolean }[]>([]);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [jobFilter, setJobFilter] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([
    { id: "j1", title: "Frontend", company: "Paystack", place: "Lagos", type: "Lagos", pay: "₦" },
    { id: "j2", title: "Driver", company: "Yaba runs", place: "Yaba", type: "Lagos", pay: "Daily" },
    { id: "j3", title: "Writer", company: "Kilode", place: "Remote", type: "Remote", pay: "Contract" },
  ]);
  const [applyFor, setApplyFor] = useState<string | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [products, setProducts] = useState<Product[]>([
    { id: "p1", title: "Ankara set", price: "₦18,000", cat: "Fashion" },
    { id: "p2", title: "Suya tray", price: "₦4,500", cat: "Food" },
  ]);
  const [cat, setCat] = useState("All");
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [rents, setRents] = useState<Rent[]>([{ id: "r1", title: "Studio, Yaba", place: "Yaba", price: "₦1.2m / year", tag: "WhatsApp on request" }]);
  const [rentTitle, setRentTitle] = useState("");
  const [events, setEvents] = useState<Ev[]>([{ id: "e1", title: "Rooms beta night", when: "Fri 7pm · Yaba", status: "approved", hash: "" }]);
  const [rsvp, setRsvp] = useState<Record<string, number>>({ e1: 24 });
  const [evTitle, setEvTitle] = useState("");
  const [evHash, setEvHash] = useState("");
  const [usedHash, setUsedHash] = useState<string[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceName, setSpaceName] = useState("");
  const [spaceUser, setSpaceUser] = useState("");
  const [spaceCat, setSpaceCat] = useState("Tech");
  const [openSpace, setOpenSpace] = useState<string | null>(null);
  const [followedSpaces, setFollowedSpaces] = useState<Record<string, boolean>>({});
  const [ads, setAds] = useState<Ad[]>([{ id: "a1", title: "Pay small small", vertical: "Fintech", status: "live", views: 1204 }]);
  const [adTitle, setAdTitle] = useState("");
  const [adHash, setAdHash] = useState("");
  const [teams, setTeams] = useState<Team[]>([
    { id: "tm1", name: "Lagos Builders", members: 18, mine: false },
    { id: "tm2", name: "Afrobeats Desk", members: 9, mine: false },
  ]);
  const [teamName, setTeamName] = useState("");
  const [notes, setNotes] = useState<Note[]>([
    { id: "nt1", icon: "❤️", text: "Chioma Ade liked your post", time: "3m", href: "socials", seen: false },
    { id: "nt2", icon: "💬", text: "New reply in Afrobeats Lab", time: "18m", href: "chat", seen: false },
    { id: "nt3", icon: "#️⃣", text: "Lagos Founders room · 12 new messages", time: "1h", href: "chat", seen: true },
    { id: "nt4", icon: "🎵", text: "Simi Sola dropped Ojuelegba Nights", time: "3h", href: "music", seen: true },
    { id: "nt5", icon: "🎬", text: "Eko for Show added to your list", time: "Yesterday", href: "film", seen: true },
  ]);
  const [meTab, setMeTab] = useState("Posts");
  const [listed, setListed] = useState(false);
  const [stars, setStars] = useState(0);
  const [votedOn, setVotedOn] = useState("");
  const [quiz, setQuiz] = useState("");
  const [modAction, setModAction] = useState("mask");
  const [scan, setScan] = useState("");
  const [myPosts, setMyPosts] = useState<string[]>([]);

  const show = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };
  const allowWrite = () => {
    const nowMs = Date.now();
    const recent = writes.filter((t) => nowMs - t < 60000);
    if (recent.length >= 20) {
      show("Rate limited — 20 writes a minute");
      return false;
    }
    setWrites([...recent, nowMs]);
    return true;
  };
  const go = (next: string, sub?: string) => {
    setTab(next);
    if (sub) setHomeSub(sub);
    setSearchOpen(false);
    setCreateOpen(false);
    setMoreOpen(false);
  };
  const rooms = useMemo(() => [...ROOMS, ...extraRooms], [extraRooms]);
  const roomMsgs = msgs.filter((m) => m.room === roomId);
  const visibleJobs = jobs.filter((j) => jobFilter === "All" || j.type === jobFilter);
  const visibleNews = NEWS.filter((n) => edFilter === "All" || n.filter === edFilter || (edFilter === "Lagos" && n.place === "Lagos") || (edFilter === "Policy" && n.filter === "Business"));
  const visibleProducts = products.filter((p) => cat === "All" || p.cat === cat);
  const mineTeams = teams.filter((t) => t.mine).length;
  const activeSpace = spaces.find((s) => s.id === openSpace);

  const postTake = () => {
    const text = newTake.trim();
    if (text.length < 3) return show("Write at least 3 characters");
    const held = gateText(text);
    if (held) return show(held);
    if (!allowWrite()) return;
    const row: Take = { id: String(Date.now()), name: session?.user || "Kelechi Anene", handle: (session?.user || "kelechi").toLowerCase(), time: "now", kind: "take", likes: 0, reposts: 0, comments: 0, text };
    setTakes([row, ...takes]);
    setMyPosts([text, ...myPosts]);
    setNewTake("");
    show("Awaiting backend confirmation");
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.logo}>kilode</Text>
        <View style={styles.live}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.search} onPress={() => setSearchOpen(true)}>
          <Text style={styles.searchText}>🔍  Search Kilode</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go("activity")} style={styles.bell}>
          <Text>🔔</Text>
          {notes.some((n) => !n.seen) ? <View style={styles.dot} /> : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.k} onPress={() => (session ? go("myspace") : setAuthOpen(true))}>
          <Text style={styles.kText}>{session ? session.user.slice(0, 1).toUpperCase() : "K"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Home = () => (
    <View>
      <View style={styles.pad}>
        <View style={styles.between}>
          <View style={{ flex: 1 }}>
            <Text style={styles.h1}>Good morning, Lagos</Text>
            <Text style={styles.sub}>Catch up on rooms, stories, and drops from people you follow.</Text>
          </View>
          <TouchableOpacity style={styles.speaker} onPress={() => show("Audio briefing · 3 rooms active · 2 new drops")}>
            <Text>🔊</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {[
          ["foryou", "For you"],
          ["trending", "Trending"],
          ["rooms", "Rooms"],
          ["news", "News"],
        ].map(([id, label]) => (
          <TouchableOpacity key={id} onPress={() => { setHomeSub(id); show(label + " · chronological"); }} style={[styles.pill, homeSub === id && styles.pillOn]}>
            <Text style={[styles.pillText, homeSub === id && styles.pillTextOn]}>{homeSub === id ? "✓ " : ""}{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {homeSub === "foryou" || homeSub === "trending" ? (
        <View style={styles.card}>
          <View style={styles.between}>
            <Text style={styles.h2}>Latest posts</Text>
            <TouchableOpacity onPress={() => go("socials")}><Text style={styles.link}>See all</Text></TouchableOpacity>
          </View>
          {homeSub === "trending" && takes[0] ? (
            <Text style={styles.body}>{takes[0].text}</Text>
          ) : (
            <View style={styles.center}>
              <View style={styles.iconCircle}><Text>✏️</Text></View>
              <Text style={styles.h2}>No posts yet</Text>
              <Text style={styles.mutedCenter}>Be first — share a take for Nigeria. Your room will see it instantly.</Text>
              <TouchableOpacity style={styles.primary} onPress={() => setCreateOpen(true)}><Text style={styles.primaryText}>Create post</Text></TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}

      <View style={[styles.between, styles.padTight]}>
        <Text style={styles.h2}>Discover rooms</Text>
        <Text style={styles.meta}>2 active · moderated</Text>
      </View>
      {[
        { id: "lagos", av: "LF", name: "Lagos Founders", meta: "Startups · Tech + Funding · 2.4k members" },
        { id: "afro", av: "AL", name: "Afrobeats Lab", meta: "Drops · 8k members" },
      ].map((room) => (
        <View key={room.id} style={styles.room}>
          <View style={styles.row}>
            <View style={styles.av}><Text style={styles.avText}>{room.av}</Text></View>
            <View>
              <Text style={styles.name}>{room.name}</Text>
              <Text style={styles.meta}>{room.meta}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.join, joined[room.id] && styles.joinOn]}
            onPress={() => { setJoined({ ...joined, [room.id]: !joined[room.id] }); show(joined[room.id] ? "Left room" : "Joined room"); }}
          >
            <Text style={[styles.joinText, joined[room.id] && { color: BLACK }]}>{joined[room.id] ? "Joined" : "Join"}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {["All", "Business", "Culture", "Tech", "Policy", "Lagos"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setEdFilter(f)} style={[styles.pill, edFilter === f && styles.pillOn]}>
            <Text style={[styles.pillText, edFilter === f && styles.pillTextOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.card}>
        <View style={styles.kicker}><Text style={styles.kickerText}>FEATURED BUSINESS</Text></View>
        <Text style={styles.feature}>How Kilode is rebuilding discovery for Nigerian creators without an algorithm</Text>
        <Text style={styles.body}>A product note on rooms, editorial curation, and why we are keeping feeds chronological.</Text>
        <Text style={styles.meta}>Kilode Editorial · 6 min · Yesterday</Text>
      </View>

      <View style={styles.ad}>
        <Text style={styles.adLabel}>ADVERTISEMENT · Google AdSense · Media · In-article</Text>
        <Text style={styles.body}>This slot fills when Kilode turns on the ad unit. Layout is preserved. No CLS. No hidden revenue.</Text>
        <Text style={styles.metaCenter}>728 × 90 · Responsive · Protected</Text>
      </View>

      <View style={[styles.between, styles.padTight]}>
        <Text style={styles.h2}>News for you</Text>
        <TouchableOpacity onPress={() => { setHomeSub("news"); show("Open media"); }}><Text style={styles.link}>Open media</Text></TouchableOpacity>
      </View>
      {visibleNews.map((n) => (
        <TouchableOpacity key={n.id} style={styles.news} onPress={() => show(n.title)}>
          <View style={[styles.thumb, { backgroundColor: n.tint }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.meta}>{n.kicker} · {n.place} · {n.time}</Text>
            <Text style={styles.name}>{n.title}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={[styles.between, styles.padTight]}>
        <Text style={styles.h2}>Music new drops</Text>
        <TouchableOpacity onPress={() => go("music")}><Text style={styles.link}>Browse</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {TRACKS.map((t) => (
          <TouchableOpacity key={t.id} style={styles.drop} onPress={() => { setNow(t); setPlaying(true); show("Playing " + t.title); go("music"); }}>
            <View style={[styles.art, { backgroundColor: t.color }]}><View style={styles.play}><Text>▶</Text></View></View>
            <Text style={styles.name}>{t.title}</Text>
            <Text style={styles.meta}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.between, styles.padTight]}>
        <Text style={styles.h2}>Desks</Text>
        <TouchableOpacity onPress={() => setMoreOpen(true)}><Text style={styles.link}>More desks</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {DESKS.map((d) => (
          <TouchableOpacity key={d.id} style={styles.desk} onPress={() => { go(d.id); show(d.label); }}>
            <Text style={{ fontSize: 20 }}>{d.icon}</Text>
            <Text style={styles.meta}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const Socials = () => (
    <View>
      <View style={styles.composer}>
        <View style={styles.av}><Text style={styles.avText}>KA</Text></View>
        <TextInput value={newTake} onChangeText={setNewTake} placeholder="What's happening in Naija?" placeholderTextColor={GRAY2} style={styles.input} />
        <TouchableOpacity style={styles.post} onPress={postTake}><Text style={styles.primaryText}>Post</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        <TouchableOpacity style={styles.story} onPress={() => show("Story composer · jpeg under 180k")}><Text style={{ color: BLUE, fontSize: 22 }}>+</Text></TouchableOpacity>
        {["CA", "FV", "SS", "TQ"].map((s) => (
          <TouchableOpacity key={s} style={styles.story} onPress={() => show("Story · " + s)}><Text style={styles.avText}>{s}</Text></TouchableOpacity>
        ))}
      </ScrollView>
      {takes.map((t) => (
        <View key={t.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.av}><Text style={styles.avText}>{t.name.slice(0, 2).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{t.name} <Text style={styles.meta}>@{t.handle} · {t.time} · {t.kind}</Text></Text>
            </View>
            <TouchableOpacity style={[styles.follow, follows[t.handle] && styles.joinOn]} onPress={() => { setFollows({ ...follows, [t.handle]: !follows[t.handle] }); show(follows[t.handle] ? "Unfollowed" : "Following"); }}>
              <Text style={[styles.joinText, follows[t.handle] && { color: BLACK }]}>{follows[t.handle] ? "Following" : "Follow"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.body}>{t.text}</Text>
          {t.image ? <View style={styles.photo}><Text style={styles.meta}>16:9 · Third Mainland · 5:43am</Text></View> : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => { setLiked({ ...liked, [t.id]: !liked[t.id] }); show(liked[t.id] ? "Unliked" : "Liked"); }}><Text style={{ color: liked[t.id] ? BLUE : GRAY }}>{liked[t.id] ? "♥" : "♡"} {t.likes + (liked[t.id] ? 1 : 0)}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => show("Reposted")}><Text style={styles.meta}>↻ {t.reposts}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setOpenReply(openReply === t.id ? null : t.id)}><Text style={styles.meta}>💬 {t.comments + (replies[t.id]?.length || 0) - (t.id === "2" ? 2 : 0)}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setSaved({ ...saved, [t.id]: !saved[t.id] }); show(saved[t.id] ? "Removed" : "Saved"); }}><Text style={styles.meta}>{saved[t.id] ? "★" : "☆"}</Text></TouchableOpacity>
          </View>
          {(replies[t.id] || []).map((r, i) => (
            <View key={i} style={styles.reply}><Text style={styles.name}>{r.name}</Text><Text style={styles.body}>{r.text}</Text></View>
          ))}
          {openReply === t.id ? (
            <View style={styles.row}>
              <TextInput value={replyDraft} onChangeText={setReplyDraft} placeholder="Reply" placeholderTextColor={GRAY2} style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity style={styles.post} onPress={() => {
                if (replyDraft.trim().length < 2) return show("Write a reply");
                setReplies({ ...replies, [t.id]: [...(replies[t.id] || []), { name: "You", text: replyDraft.trim() }] });
                setReplyDraft("");
                show("Reply sent");
              }}><Text style={styles.primaryText}>Send</Text></TouchableOpacity>
            </View>
          ) : null}
        </View>
      ))}
      <View style={styles.card}>
        <Text style={styles.name}>Kilode Editorial</Text>
        <Text style={styles.body}>We are opening Rooms for beta. Moderated, topic-bound, 200-person limit. No algorithm. Think early Twitter plus a village square.</Text>
      </View>
    </View>
  );

  const Chat = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Chat</Text>
      <Text style={styles.sub}>{rooms.length} rooms · presence · pins · replies</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {rooms.map((r) => (
          <TouchableOpacity key={r.id} onPress={() => setRoomId(r.id)} style={[styles.pill, roomId === r.id && styles.pillOn]}>
            <Text style={[styles.pillText, roomId === r.id && styles.pillTextOn]}>#{r.name}{paused[r.id] ? " · paused" : ""}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.card}>
        <Text style={styles.name}>#{rooms.find((r) => r.id === roomId)?.name} · {rooms.find((r) => r.id === roomId)?.region} · online</Text>
        {roomMsgs.length === 0 ? <Text style={styles.meta}>No messages yet. Say something.</Text> : null}
        {roomMsgs.map((m) => (
          <View key={m.id} style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
            <Text style={{ color: m.mine ? WHITE : TEXT, fontSize: 13 }}>{m.mine ? m.text : m.name + ": " + m.text}</Text>
          </View>
        ))}
        {paused[roomId] ? <Text style={styles.meta}>This room is paused by staff.</Text> : (
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput value={msgDraft} onChangeText={setMsgDraft} placeholder="Message" placeholderTextColor={GRAY2} style={[styles.input, { flex: 1 }]} />
            <TouchableOpacity style={styles.post} onPress={() => {
              const text = msgDraft.trim();
              if (text.length < 1) return;
              const held = gateText(text);
              if (held) return show(held);
              if (!allowWrite()) return;
              setMsgs([...msgs, { id: String(Date.now()), room: roomId, mine: true, name: "You", text }]);
              setMsgDraft("");
              show("Sent · pending until server confirms");
            }}><Text style={styles.primaryText}>Send</Text></TouchableOpacity>
          </View>
        )}
      </View>
      <View style={[styles.row, { marginTop: 8 }]}>
        <TextInput value={customRoom} onChangeText={setCustomRoom} placeholder="New room name" placeholderTextColor={GRAY2} style={[styles.input, { flex: 1 }]} />
        <TouchableOpacity style={styles.primary} onPress={() => {
          const name = customRoom.trim();
          if (name.length < 3) return show("Room name needs 3 letters");
          const id = "c-" + name.toLowerCase().replace(/\s+/g, "-");
          setExtraRooms([...extraRooms, { id, name, region: "Custom" }]);
          setRoomId(id);
          setCustomRoom("");
          show("Room saved locally");
        }}><Text style={styles.primaryText}>Save room</Text></TouchableOpacity>
      </View>
    </View>
  );

  const Music = () => (
    <View style={styles.pad}>
      <TouchableOpacity onPress={() => go("home")}><Text style={styles.link}>← Home</Text></TouchableOpacity>
      <Text style={styles.h1}>Music</Text>
      <View style={styles.spot}>
        <Text style={styles.kickerText}>ARTIST SPOTLIGHT</Text>
        <Text style={styles.spotTitle}>Simi Sola · Lagos</Text>
        <Text style={styles.spotSub}>12k listeners · Afro-soul</Text>
        <View style={styles.row}>
          {["#2563EB", "#059669", "#7C3AED"].map((c) => <View key={c} style={[styles.swatch, { backgroundColor: c }]} />)}
        </View>
      </View>
      <View style={styles.grid}>
        {TRACKS.map((t) => (
          <TouchableOpacity key={t.id} style={styles.gridItem} onPress={() => { setNow(t); setPlaying(true); show("Playing " + t.title); }}>
            <View style={[styles.artLg, { backgroundColor: t.color }]}><View style={styles.play}><Text>▶</Text></View></View>
            <Text style={styles.name}>{t.title}</Text>
            <Text style={styles.meta}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Cinema = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Cinema</Text>
      <View style={styles.screen}><Text style={{ color: WHITE }}>Watching now · trailer</Text></View>
      <TouchableOpacity style={styles.card} onPress={() => go("film")}>
        <View style={styles.row}>
          <View style={styles.poster}><Text style={{ color: WHITE, fontSize: 10 }}>POSTER 2:3</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Eko for Show</Text>
            <Text style={styles.meta}>2024 · 1h 42m · Drama · PG · Lagos</Text>
            <Text style={styles.body}>A bus conductor inherits a failing cinema house.</Text>
            <Text style={styles.link}>Open film</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const Film = () => (
    <View style={styles.pad}>
      <TouchableOpacity onPress={() => go("cinema")}><Text style={styles.link}>← Cinema</Text></TouchableOpacity>
      <View style={[styles.row, { marginTop: 12, alignItems: "flex-start" }]}>
        <View style={styles.poster}><Text style={{ color: WHITE, fontSize: 10 }}>POSTER 2:3</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Eko for Show</Text>
          <Text style={styles.meta}>2024 · 1h 42m · Drama · PG · Lagos</Text>
          <Text style={styles.body}>A bus conductor who inherits a failing cinema house must decide whether to sell to developers or turn it into a community screening space. Warm, funny, very Lagos.</Text>
        </View>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.primary} onPress={() => show("Trailer")}><Text style={styles.primaryText}>Trailer</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.join, listed && styles.joinOn]} onPress={() => { setListed(!listed); show(listed ? "Removed from list" : "Added to list"); }}>
          <Text style={[styles.joinText, listed && { color: BLACK }]}>{listed ? "Listed" : "List"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>Shot in Yaba, CMS, Ikeja · Dir. K. Alabi</Text>
      <Text style={[styles.h2, { marginTop: 16 }]}>Your rating</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => { setStars(n); show("Rated " + n); }}><Text style={{ fontSize: 22, color: n <= stars ? "#F59E0B" : GRAY2 }}>★</Text></TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.primary} onPress={() => {
        if (votedOn === todayKey()) return show("One vote a day");
        setVotedOn(todayKey());
        show("Vote counted for today");
      }}><Text style={styles.primaryText}>{votedOn === todayKey() ? "Voted today" : "Vote"}</Text></TouchableOpacity>
      <Text style={[styles.h2, { marginTop: 12 }]}>Quiz</Text>
      {["A Yaba", "B Abuja", "C Kano", "D Enugu", "E Portharcourt"].map((q) => (
        <TouchableOpacity key={q} onPress={() => { setQuiz(q); show(q.startsWith("A") ? "Correct" : "Not quite"); }} style={[styles.pill, quiz === q && styles.pillOn, { marginTop: 8 }]}>
          <Text style={[styles.pillText, quiz === q && styles.pillTextOn]}>{q}</Text>
        </TouchableOpacity>
      ))}
      <Text style={[styles.h2, { marginTop: 16 }]}>Related</Text>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => <View key={i} style={styles.related}><Text style={styles.meta}>Film #{i}</Text></View>)}
      </View>
    </View>
  );

  const Jobs = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Jobs</Text>
      <View style={styles.row}>
        {["All", "Lagos", "Remote"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setJobFilter(f)} style={[styles.pill, jobFilter === f && styles.pillOn]}><Text style={[styles.pillText, jobFilter === f && styles.pillTextOn]}>{f}</Text></TouchableOpacity>
        ))}
      </View>
      {visibleJobs.map((j) => (
        <View key={j.id} style={styles.card}>
          <Text style={styles.name}>{j.title}</Text>
          <Text style={styles.meta}>{j.company} · {j.place} · {j.pay}</Text>
          {applyFor === j.id ? (
            <View>
              <TextInput value={applyNote} onChangeText={setApplyNote} placeholder="Short note" placeholderTextColor={GRAY2} style={styles.input} />
              <TouchableOpacity style={styles.primary} onPress={() => {
                if (applyNote.trim().length < 3) return show("Add a short note");
                setApplyFor(null); setApplyNote(""); show("Application sent to the poster");
              }}><Text style={styles.primaryText}>Send application</Text></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.primary} onPress={() => setApplyFor(j.id)}><Text style={styles.primaryText}>Apply</Text></TouchableOpacity>
          )}
        </View>
      ))}
      <View style={styles.card}>
        <Text style={styles.h2}>Post a job</Text>
        <Text style={styles.meta}>Free to draft. Listing stays limited until the poster pays.</Text>
        <TextInput value={jobTitle} onChangeText={setJobTitle} placeholder="Role title" placeholderTextColor={GRAY2} style={styles.input} />
        <TouchableOpacity style={styles.primary} onPress={() => {
          if (jobTitle.trim().length < 3) return show("Add a title");
          if (!allowWrite()) return;
          setJobs([{ id: String(Date.now()), title: jobTitle.trim(), company: "You", place: "Lagos", type: "Lagos", pay: "Limited until paid" }, ...jobs]);
          setJobTitle("");
          show("Job posted · limited until payment");
        }}><Text style={styles.primaryText}>Post job</Text></TouchableOpacity>
      </View>
    </View>
  );

  const Market = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Market</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
        {["All", ...CATS].map((c) => (
          <TouchableOpacity key={c} onPress={() => setCat(c)} style={[styles.pill, cat === c && styles.pillOn]}><Text style={[styles.pillText, cat === c && styles.pillTextOn]}>{c}</Text></TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.grid}>
        {visibleProducts.map((p) => (
          <TouchableOpacity key={p.id} style={styles.gridItem} onPress={() => show("WhatsApp the seller")}>
            <View style={[styles.artLg, { backgroundColor: "#E0E7FF" }]} />
            <Text style={styles.name}>{p.title}</Text>
            <Text style={styles.meta}>{p.price} · {p.cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput value={prodTitle} onChangeText={setProdTitle} placeholder="Product title" placeholderTextColor={GRAY2} style={styles.input} />
      <TextInput value={prodPrice} onChangeText={setProdPrice} placeholder="Price" placeholderTextColor={GRAY2} style={styles.input} />
      <TouchableOpacity style={styles.primary} onPress={() => {
        if (prodTitle.trim().length < 2) return show("Add a title");
        setProducts([{ id: String(Date.now()), title: prodTitle.trim(), price: prodPrice.trim() || "Ask", cat: cat === "All" ? "Other" : cat }, ...products]);
        setProdTitle(""); setProdPrice(""); show("Product listed");
      }}><Text style={styles.primaryText}>Add product</Text></TouchableOpacity>
    </View>
  );

  const RentDesk = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Rent</Text>
      {rents.map((r) => (
        <TouchableOpacity key={r.id} style={styles.card} onPress={() => show(r.tag)}>
          <Text style={styles.name}>{r.title}</Text>
          <Text style={styles.meta}>{r.place} · {r.price}</Text>
          <Text style={styles.body}>{r.tag}</Text>
        </TouchableOpacity>
      ))}
      <TextInput value={rentTitle} onChangeText={setRentTitle} placeholder="Space title" placeholderTextColor={GRAY2} style={styles.input} />
      <TouchableOpacity style={styles.primary} onPress={() => {
        if (rentTitle.trim().length < 3) return show("Add a title");
        setRents([{ id: String(Date.now()), title: rentTitle.trim(), place: "Lagos", price: "Ask", tag: "WhatsApp on the listing" }, ...rents]);
        setRentTitle(""); show("Rent listing saved");
      }}><Text style={styles.primaryText}>List space</Text></TouchableOpacity>
    </View>
  );

  const Events = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Events</Text>
      {events.map((e) => (
        <View key={e.id} style={styles.card}>
          <Text style={styles.name}>{e.title}</Text>
          <Text style={styles.meta}>{e.when} · {e.status} · {rsvp[e.id] || 0} going</Text>
          <TouchableOpacity style={styles.primary} onPress={() => { setRsvp({ ...rsvp, [e.id]: (rsvp[e.id] || 0) + 1 }); show("RSVP counted"); }}><Text style={styles.primaryText}>RSVP</Text></TouchableOpacity>
        </View>
      ))}
      <TextInput value={evTitle} onChangeText={setEvTitle} placeholder="Event title" placeholderTextColor={GRAY2} style={styles.input} />
      <TextInput value={evHash} onChangeText={setEvHash} placeholder="Payment hash 32–128 letters or numbers" placeholderTextColor={GRAY2} style={styles.input} autoCapitalize="none" />
      <TouchableOpacity style={styles.primary} onPress={() => {
        if (evTitle.trim().length < 3) return show("Add a title");
        if (!hashOk(evHash)) return show("Hash must be 32–128 letters or numbers");
        if (usedHash.includes(evHash.trim())) return show("That hash is already used");
        setUsedHash([...usedHash, evHash.trim()]);
        setEvents([{ id: String(Date.now()), title: evTitle.trim(), when: "Pending staff", status: "pending", hash: evHash.trim() }, ...events]);
        setEvTitle(""); setEvHash(""); show("Event pending · hash claimed");
      }}><Text style={styles.primaryText}>Submit event</Text></TouchableOpacity>
    </View>
  );

  const Spaces = () => (
    <View style={styles.pad}>
      {activeSpace ? (
        <View>
          <TouchableOpacity onPress={() => setOpenSpace(null)}><Text style={styles.link}>← Spaces</Text></TouchableOpacity>
          <Text style={styles.h1}>{activeSpace.name}</Text>
          <Text style={styles.meta}>@{activeSpace.user} · {activeSpace.cat} · {activeSpace.status}</Text>
          <Text style={styles.body}>{activeSpace.tagline}</Text>
          <TouchableOpacity style={styles.primary} onPress={() => { setFollowedSpaces({ ...followedSpaces, [activeSpace.id]: !followedSpaces[activeSpace.id] }); show(followedSpaces[activeSpace.id] ? "Unfollowed" : "Following space"); }}>
            <Text style={styles.primaryText}>{followedSpaces[activeSpace.id] ? "Following" : "Follow"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.join} onPress={() => show("Enquiry sent")}><Text style={styles.joinText}>Enquire</Text></TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.h1}>Spaces</Text>
          <Text style={styles.sub}>{spaces.length}/5</Text>
          {spaces.map((s) => (
            <TouchableOpacity key={s.id} style={styles.card} onPress={() => setOpenSpace(s.id)}>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.meta}>@{s.user} · {s.cat} · {s.status}</Text>
            </TouchableOpacity>
          ))}
          <TextInput value={spaceName} onChangeText={setSpaceName} placeholder="Business name" placeholderTextColor={GRAY2} style={styles.input} />
          <TextInput value={spaceUser} onChangeText={setSpaceUser} placeholder="Username 3–40" placeholderTextColor={GRAY2} style={styles.input} autoCapitalize="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setSpaceCat(c)} style={[styles.pill, spaceCat === c && styles.pillOn]}><Text style={[styles.pillText, spaceCat === c && styles.pillTextOn]}>{c}</Text></TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.primary} onPress={() => {
            if (spaces.length >= 5) return show("5 spaces max");
            if (spaceName.trim().length < 2 || spaceUser.trim().length < 3) return show("Name and username (3+)");
            if (spaces.some((s) => s.user === spaceUser.trim().toLowerCase())) return show("Username taken");
            setSpaces([...spaces, { id: String(Date.now()), name: spaceName.trim(), user: spaceUser.trim().toLowerCase(), cat: spaceCat, status: "Draft", tagline: "New on Kilode" }]);
            setSpaceName(""); setSpaceUser(""); show("Space saved as draft");
          }}><Text style={styles.primaryText}>Create space</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );

  const Ads = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Ads</Text>
      <Text style={styles.sub}>{AD_VERTICALS.length} verticals · grid, stream, pin</Text>
      {ads.map((a) => (
        <TouchableOpacity key={a.id} style={styles.card} onPress={() => { setAds(ads.map((x) => x.id === a.id ? { ...x, views: x.views + 1 } : x)); show("View counted"); }}>
          <Text style={styles.name}>{a.title}</Text>
          <Text style={styles.meta}>{a.vertical} · {a.status} · {a.views} views</Text>
        </TouchableOpacity>
      ))}
      <TextInput value={adTitle} onChangeText={setAdTitle} placeholder="Ad name" placeholderTextColor={GRAY2} style={styles.input} />
      <Text style={styles.meta}>Detected vertical: {adVertical(adTitle)}</Text>
      <TextInput value={adHash} onChangeText={setAdHash} placeholder="Payment hash" placeholderTextColor={GRAY2} style={styles.input} autoCapitalize="none" />
      <TouchableOpacity style={styles.primary} onPress={() => {
        if (adTitle.trim().length < 3) return show("Add an ad name");
        if (!hashOk(adHash)) return show("Hash must be 32–128 letters or numbers");
        if (usedHash.includes(adHash.trim())) return show("That hash is already used");
        setUsedHash([...usedHash, adHash.trim()]);
        setAds([{ id: String(Date.now()), title: adTitle.trim(), vertical: adVertical(adTitle), status: "pending", views: 0 }, ...ads]);
        setAdTitle(""); setAdHash(""); show("Ad pending review");
      }}><Text style={styles.primaryText}>Place ad</Text></TouchableOpacity>
    </View>
  );

  const Teams = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Teams</Text>
      <Text style={styles.sub}>Yours {mineTeams}/3</Text>
      {teams.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.name}>{t.name}</Text>
          <Text style={styles.meta}>{t.members} members</Text>
          <TouchableOpacity style={[styles.join, t.mine && styles.joinOn]} onPress={() => {
            if (!t.mine && mineTeams >= 3) return show("3 teams max");
            setTeams(teams.map((x) => x.id === t.id ? { ...x, mine: !x.mine, members: x.members + (x.mine ? -1 : 1) } : x));
            show(t.mine ? "Left team" : "Joined team");
          }}><Text style={[styles.joinText, t.mine && { color: BLACK }]}>{t.mine ? "Joined" : "Join"}</Text></TouchableOpacity>
        </View>
      ))}
      <TextInput value={teamName} onChangeText={setTeamName} placeholder="Team name" placeholderTextColor={GRAY2} style={styles.input} />
      <TouchableOpacity style={styles.primary} onPress={() => {
        if (mineTeams >= 3) return show("3 teams max");
        if (teamName.trim().length < 3) return show("Name needs 3 letters");
        setTeams([{ id: String(Date.now()), name: teamName.trim(), members: 1, mine: true }, ...teams]);
        setTeamName(""); show("Team created");
      }}><Text style={styles.primaryText}>Create team</Text></TouchableOpacity>
    </View>
  );

  const Activity = () => (
    <View style={styles.pad}>
      <Text style={styles.h1}>Activity</Text>
      <Text style={styles.sub}>Chronological · no algorithm · unread highlighted</Text>
      {notes.map((n) => (
        <TouchableOpacity key={n.id} style={[styles.card, !n.seen && styles.unread]} onPress={() => { setNotes(notes.map((x) => x.id === n.id ? { ...x, seen: true } : x)); go(n.href); show("Opened"); }}>
          <Text style={styles.name}>{n.icon}  {n.text}</Text>
          <Text style={styles.meta}>{n.time} · {n.href}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const MySpace = () => (
    <View style={styles.pad}>
      <View style={styles.row}>
        <View style={styles.meAv}><Text style={styles.meAvText}>KA</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Kelechi Anene</Text>
          <Text style={styles.meta}>@kelechi · Lagos, NG</Text>
          <Text style={styles.body}>Building Kilode. Product and community. Previously Paystack, Eden.</Text>
        </View>
      </View>
      <Text style={styles.body}><Text style={styles.name}>412</Text> Following   <Text style={styles.name}>2.1k</Text> Followers   <Text style={styles.name}>86</Text> Posts</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.primary, { flex: 1 }]} onPress={() => show("Edit profile")}><Text style={styles.primaryText}>Edit profile</Text></TouchableOpacity>
        <TouchableOpacity style={styles.join} onPress={() => show("Profile link copied")}><Text style={styles.joinText}>Share</Text></TouchableOpacity>
      </View>
      <View style={[styles.row, { marginTop: 12 }]}>
        {["Posts", "Media", "Music", "Likes"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setMeTab(t)} style={[styles.pill, meTab === t && styles.pillOn]}><Text style={[styles.pillText, meTab === t && styles.pillTextOn]}>{t}</Text></TouchableOpacity>
        ))}
      </View>
      <View style={[styles.card, styles.center]}>
        {meTab === "Posts" && myPosts.length ? myPosts.map((p) => <Text key={p} style={styles.body}>{p}</Text>) : (
          <>
            <View style={styles.iconCircle}><Text>✏️</Text></View>
            <Text style={styles.h2}>{meTab === "Posts" ? "Your posts live here" : meTab + " is empty"}</Text>
            <Text style={styles.mutedCenter}>Nothing invented. When you add something, it shows here.</Text>
            <TouchableOpacity style={styles.primary} onPress={() => go("socials")}><Text style={styles.primaryText}>Open composer</Text></TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.row}>
        {[
          ["Posts", "socials", String(takes.length)],
          ["Chats", "chat", String(msgs.length)],
          ["Music", "music", String(TRACKS.length)],
          ["Ads", "ads", String(ads.length)],
        ].map(([label, dest, count]) => (
          <TouchableOpacity key={label} style={styles.stat} onPress={() => go(dest)}>
            <Text style={styles.name}>{count}</Text>
            <Text style={styles.meta}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {[
        ["Jobs", "jobs"],
        ["Events", "events"],
        ["Shop (Market)", "market"],
        ["Settings", ""],
        ["Legal", ""],
        ["Staff desk", "staff"],
      ].map(([label, dest]) => (
        <TouchableOpacity key={label} style={styles.listRow} onPress={() => dest ? go(dest) : show(label)}>
          <Text style={styles.name}>{label}</Text>
          <Text style={styles.meta}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const Staff = () => (
    <View style={styles.pad}>
      <View style={styles.spot}>
        <Text style={styles.spotTitle}>Staff desk</Text>
        <Text style={styles.spotSub}>Role super · mod / admin / super</Text>
      </View>
      <Text style={[styles.h2, { marginTop: 12 }]}>Moderation · {modAction}</Text>
      <View style={styles.row}>
        {["block", "mask", "hold"].map((a) => (
          <TouchableOpacity key={a} onPress={() => { setModAction(a); show("Action " + a); }} style={[styles.pill, modAction === a && styles.pillOn]}>
            <Text style={[styles.pillText, modAction === a && styles.pillTextOn]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput value={scan} onChangeText={setScan} placeholder="Scan text" placeholderTextColor={GRAY2} style={styles.input} />
      <TouchableOpacity style={styles.primary} onPress={() => show(gateText(scan) || "Scanned — clean")}><Text style={styles.primaryText}>Scan</Text></TouchableOpacity>
      <Text style={[styles.h2, { marginTop: 16 }]}>Rooms</Text>
      {rooms.slice(0, 6).map((r) => (
        <View key={r.id} style={styles.between}>
          <Text style={styles.body}>#{r.name} · {r.region} {paused[r.id] ? "· paused" : ""}</Text>
          <TouchableOpacity onPress={() => { setPaused({ ...paused, [r.id]: !paused[r.id] }); show("Pause toggled"); }}><Text style={styles.link}>{paused[r.id] ? "Unpause" : "Pause"}</Text></TouchableOpacity>
        </View>
      ))}
      <Text style={[styles.h2, { marginTop: 16 }]}>Site pulse</Text>
      <Text style={styles.body}>Members 3.2k · Posts {takes.length} · Chats {msgs.length} · Ads {ads.length} · Tracks {TRACKS.length} · Listings {products.length + rents.length}</Text>
    </View>
  );

  const Search = () => {
    const q = query.trim().toLowerCase();
    const hitTakes = takes.filter((t) => !q || t.text.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
    const hitRooms = rooms.filter((r) => !q || r.name.toLowerCase().includes(q));
    return (
      <View style={styles.pad}>
        <View style={styles.between}>
          <Text style={styles.h1}>Search</Text>
          <TouchableOpacity onPress={() => setSearchOpen(false)}><Text style={styles.link}>Close</Text></TouchableOpacity>
        </View>
        <TextInput value={query} onChangeText={setQuery} placeholder="People, rooms, takes" placeholderTextColor={GRAY2} style={styles.input} autoFocus />
        {hitRooms.map((r) => (
          <TouchableOpacity key={r.id} onPress={() => { setRoomId(r.id); go("chat"); }} style={styles.listRow}><Text style={styles.name}>#{r.name}</Text></TouchableOpacity>
        ))}
        {hitTakes.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => go("socials")} style={styles.listRow}><Text style={styles.body}>{t.name}: {t.text.slice(0, 80)}</Text></TouchableOpacity>
        ))}
      </View>
    );
  };

  const screen = () => {
    if (searchOpen) return <Search />;
    if (tab === "home") return <Home />;
    if (tab === "socials") return <Socials />;
    if (tab === "chat") return <Chat />;
    if (tab === "music") return <Music />;
    if (tab === "cinema") return <Cinema />;
    if (tab === "film") return <Film />;
    if (tab === "jobs") return <Jobs />;
    if (tab === "market") return <Market />;
    if (tab === "rent") return <RentDesk />;
    if (tab === "events") return <Events />;
    if (tab === "spaces") return <Spaces />;
    if (tab === "ads") return <Ads />;
    if (tab === "teams") return <Teams />;
    if (tab === "activity") return <Activity />;
    if (tab === "myspace") return <MySpace />;
    if (tab === "staff") return <Staff />;
    return <Home />;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <Header />
      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: now ? 150 : 100 }} showsVerticalScrollIndicator={false}>
        {screen()}
      </ScrollView>
      {now ? (
        <View style={styles.player}>
          <View style={[styles.play, { backgroundColor: now.color }]}><Text style={{ color: WHITE, fontSize: 10 }}>{now.title.slice(0, 2)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: WHITE, fontWeight: "700", fontSize: 12 }} numberOfLines={1}>{now.title} · {now.artist}</Text>
            <Text style={{ color: "#94A3B8", fontSize: 10 }}>Lagos · now playing</Text>
          </View>
          <TouchableOpacity onPress={() => setPlaying(!playing)} style={styles.play}><Text>{playing ? "❚❚" : "▶"}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { setNow(null); setPlaying(false); }} style={styles.play}><Text style={{ color: WHITE }}>✕</Text></TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.dock}>
        {[
          ["home", "Home", "⌂"],
          ["socials", "Socials", "◫"],
        ].map(([id, label, icon]) => (
          <TouchableOpacity key={id} style={styles.dockBtn} onPress={() => go(id)}>
            <Text style={{ fontSize: 18, color: tab === id ? BLUE : GRAY2 }}>{icon}</Text>
            <Text style={[styles.dockLabel, tab === id && { color: BLUE, fontWeight: "700" }]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.plus} onPress={() => setCreateOpen(true)}><Text style={styles.plusText}>+</Text></TouchableOpacity>
        <TouchableOpacity style={styles.dockBtn} onPress={() => go("activity")}>
          <Text style={{ fontSize: 18, color: tab === "activity" ? BLUE : GRAY2 }}>◐</Text>
          <Text style={[styles.dockLabel, tab === "activity" && { color: BLUE, fontWeight: "700" }]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dockBtn} onPress={() => go("myspace")}>
          <Text style={{ fontSize: 18, color: tab === "myspace" ? BLUE : GRAY2 }}>○</Text>
          <Text style={[styles.dockLabel, tab === "myspace" && { color: BLUE, fontWeight: "700" }]}>My Space</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setCreateOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.between}><Text style={styles.h2}>Create on Kilode</Text><TouchableOpacity onPress={() => setCreateOpen(false)}><Text>✕</Text></TouchableOpacity></View>
            <View style={styles.grid}>
              {CREATE.map((o) => (
                <TouchableOpacity key={o.label} style={styles.create} onPress={() => { go(o.tab, o.subtab); show(o.label + " · real flow"); }}>
                  <Text style={{ fontSize: 18 }}>{o.icon}</Text>
                  <Text style={styles.name}>{o.label}</Text>
                  <Text style={styles.meta}>{o.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMoreOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.between}><Text style={styles.h2}>All desks</Text><TouchableOpacity onPress={() => setMoreOpen(false)}><Text>✕</Text></TouchableOpacity></View>
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

      <Modal visible={authOpen} transparent animationType="fade" onRequestClose={() => setAuthOpen(false)}>
        <View style={styles.authWrap}>
          <View style={styles.card}>
            <Text style={styles.h2}>Join Kilode</Text>
            <TextInput value={userDraft} onChangeText={setUserDraft} placeholder="Username 3+ letters" placeholderTextColor={GRAY2} style={styles.input} autoCapitalize="none" />
            <TextInput value={passDraft} onChangeText={setPassDraft} placeholder="Password 8+" placeholderTextColor={GRAY2} secureTextEntry style={styles.input} />
            <TextInput value={year} onChangeText={setYear} placeholder="Birth year" placeholderTextColor={GRAY2} keyboardType="number-pad" style={styles.input} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {KINDS.map((k) => (
                <TouchableOpacity key={k} onPress={() => setKind(k)} style={[styles.pill, kind === k && styles.pillOn]}>
                  <Text style={[styles.pillText, kind === k && styles.pillTextOn]}>{KIND_FACE[k]} {k}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setAgreeT(!agreeT)}><Text style={styles.body}>{agreeT ? "☑" : "☐"} Terms</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setAgreeR(!agreeR)}><Text style={styles.body}>{agreeR ? "☑" : "☐"} Rules</Text></TouchableOpacity>
            <TouchableOpacity style={styles.primary} onPress={() => {
              if (!/^[a-zA-Z]{3,}$/.test(userDraft.trim())) return show("Username needs 3 letters");
              if (passDraft.length < 8) return show("Password needs 8 characters");
              const y = Number(year);
              if (!y || new Date().getFullYear() - y < 15) return show("You must be 15 or older");
              if (!agreeT || !agreeR) return show("Agree to Terms and Rules");
              setSession({ user: userDraft.trim(), kind });
              setAuthOpen(false);
              show("Signed in");
            }}><Text style={styles.primaryText}>Sign up</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setAuthOpen(false)}><Text style={styles.metaCenter}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  header: { height: 56, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  logo: { fontSize: 20, fontWeight: "800", color: BLUE },
  live: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF3", borderWidth: 1, borderColor: "#ABEFC6", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#067647" },
  liveText: { fontSize: 10, fontWeight: "700", color: "#067647" },
  search: { width: 132, backgroundColor: "#F1F5F9", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  searchText: { color: GRAY, fontSize: 12 },
  bell: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: BLUE },
  k: { width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" },
  kText: { color: WHITE, fontWeight: "700", fontSize: 12 },
  main: { flex: 1, backgroundColor: BG },
  pad: { padding: 16 },
  padTight: { paddingHorizontal: 16, marginTop: 16 },
  h1: { fontSize: 22, fontWeight: "800", color: TEXT },
  h2: { fontSize: 14, fontWeight: "700", color: TEXT },
  sub: { fontSize: 13, color: GRAY, marginTop: 4 },
  body: { fontSize: 14, lineHeight: 20, color: TEXT, marginTop: 6 },
  name: { fontSize: 14, fontWeight: "700", color: TEXT },
  meta: { fontSize: 11, color: GRAY, marginTop: 2 },
  metaCenter: { fontSize: 11, color: GRAY, textAlign: "center", marginTop: 8 },
  link: { color: BLUE, fontSize: 12, fontWeight: "700" },
  speaker: { width: 40, height: 40, borderRadius: 20, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  hScroll: { gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  pill: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillOn: { backgroundColor: BLACK, borderColor: BLACK },
  pillText: { fontSize: 13, color: "#334155" },
  pillTextOn: { color: WHITE, fontWeight: "700" },
  card: { backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16, marginHorizontal: 12, marginTop: 12 },
  center: { alignItems: "center", paddingVertical: 8 },
  mutedCenter: { fontSize: 12, color: GRAY, textAlign: "center", maxWidth: 220, marginTop: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: BLUE, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, marginTop: 10, alignItems: "center" },
  primaryText: { color: WHITE, fontWeight: "700", fontSize: 13 },
  room: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 12, marginHorizontal: 12, marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  av: { width: 36, height: 36, borderRadius: 18, backgroundColor: BLACK, alignItems: "center", justifyContent: "center" },
  avText: { color: WHITE, fontWeight: "700", fontSize: 11 },
  join: { backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  joinOn: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  joinText: { color: WHITE, fontWeight: "700", fontSize: 12 },
  kicker: { alignSelf: "flex-start", backgroundColor: "#EFF6FF", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  kickerText: { color: BLUE, fontSize: 10, fontWeight: "700" },
  feature: { fontSize: 18, fontWeight: "800", color: TEXT, marginTop: 8, lineHeight: 24 },
  ad: { backgroundColor: "#F8FAFC", borderWidth: 1, borderStyle: "dashed", borderColor: "#E2E8F0", borderRadius: 20, padding: 12, marginHorizontal: 12, marginTop: 12, minHeight: 120 },
  adLabel: { fontSize: 10, fontWeight: "700", color: GRAY2 },
  news: { backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 12, marginHorizontal: 12, marginTop: 8, flexDirection: "row", gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 12 },
  drop: { width: 110 },
  art: { height: 110, borderRadius: 12, justifyContent: "flex-end", alignItems: "flex-end", padding: 8 },
  artLg: { height: 120, borderRadius: 12, justifyContent: "flex-end", alignItems: "flex-end", padding: 8 },
  play: { width: 28, height: 28, borderRadius: 14, backgroundColor: WHITE, alignItems: "center", justifyContent: "center" },
  desk: { width: 72, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  composer: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  input: { backgroundColor: "#F1F5F9", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginTop: 8, color: TEXT },
  post: { backgroundColor: BLUE, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  story: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: BLUE, alignItems: "center", justifyContent: "center", backgroundColor: WHITE },
  follow: { backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  photo: { marginTop: 8, height: 160, borderRadius: 12, backgroundColor: "#E0E7FF", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  reply: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 8, marginTop: 8 },
  bubble: { borderRadius: 12, padding: 8, marginTop: 8, maxWidth: "80%" },
  mine: { alignSelf: "flex-end", backgroundColor: BLUE },
  theirs: { alignSelf: "flex-start", backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  spot: { backgroundColor: BLACK, borderRadius: 20, padding: 16, marginTop: 12 },
  spotTitle: { color: WHITE, fontSize: 18, fontWeight: "800", marginTop: 6 },
  spotSub: { color: GRAY2, fontSize: 12, marginTop: 4 },
  swatch: { flex: 1, height: 64, borderRadius: 12, marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  gridItem: { width: "47%" },
  screen: { height: 180, borderRadius: 16, backgroundColor: BLACK, alignItems: "center", justifyContent: "center", marginTop: 12 },
  poster: { width: 100, height: 150, borderRadius: 12, backgroundColor: BLACK, alignItems: "center", justifyContent: "center" },
  related: { width: "30%", height: 110, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  unread: { borderColor: "#BFDBFE", backgroundColor: "#F8FAFF" },
  meAv: { width: 64, height: 64, borderRadius: 32, backgroundColor: BLACK, alignItems: "center", justifyContent: "center" },
  meAvText: { color: WHITE, fontSize: 20, fontWeight: "800" },
  stat: { flex: 1, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 10, alignItems: "center", marginTop: 8 },
  listRow: { backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between" },
  player: { position: "absolute", left: 12, right: 12, bottom: 78, backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  dock: { height: 72, backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: BORDER, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingBottom: 8 },
  dockBtn: { width: 64, alignItems: "center" },
  dockLabel: { fontSize: 10, color: GRAY2, marginTop: 2 },
  plus: { width: 56, height: 56, borderRadius: 28, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", marginTop: -18 },
  plusText: { color: WHITE, fontSize: 28, fontWeight: "500", marginTop: -2 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16 },
  create: { width: "30%", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 10 },
  authWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 16 },
  toast: { position: "absolute", bottom: 96, alignSelf: "center", backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  toastText: { color: WHITE, fontSize: 12, fontWeight: "700" },
});
