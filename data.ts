export const DESKS = [
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "market", label: "Market", icon: "🛍️" },
  { id: "rent", label: "Rent", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "cinema", label: "Cinema", icon: "🎬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "teams", label: "Teams", icon: "👥" },
  { id: "ads", label: "Ads", icon: "📢" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "spaces", label: "Spaces", icon: "🏢" },
];

export const CREATE = [
  { label: "Post", sub: "Share a take", icon: "✏️", tab: "socials" },
  { label: "Track", sub: "Drop music", icon: "🎵", tab: "music" },
  { label: "Film", sub: "Add cinema", icon: "🎬", tab: "cinema" },
  { label: "Job", sub: "Post job", icon: "💼", tab: "jobs" },
  { label: "Market", sub: "Sell product", icon: "🛍️", tab: "market" },
  { label: "Event", sub: "Host event", icon: "📅", tab: "events" },
];

export const TAKES = [
  {
    id: "1",
    name: "Chioma Ade",
    handle: "chioma",
    time: "2h",
    role: "Commerce toolkit",
    text: "Just shipped v2 of our Lagos commerce toolkit — inventory sync, WhatsApp checkout, instant settlement. Built for market women first.",
    likes: 127,
    comments: 8,
    reposts: 19,
    tags: ["take", "spark"],
  },
  {
    id: "2",
    name: "Simi Sola",
    handle: "simisola",
    time: "6h",
    role: "Artist · Lagos",
    text: "Ojuelegba Nights out now everywhere. Wrote this on a danfo to Yaba. Thank you Lagos for raising me.",
    likes: 342,
    comments: 21,
    reposts: 84,
    tags: ["music"],
    verified: true,
  },
  {
    id: "3",
    name: "Femi Bankole",
    handle: "femi_b",
    time: "4h",
    role: "Urbanist · Third Mainland",
    text: "Third Mainland traffic at 6pm is a design failure, not a people failure. We mapped 12 informal bus stops that could become BRT Lite with just paint + shade.",
    likes: 89,
    comments: 3,
    reposts: 12,
    tags: ["take", "fact"],
  },
];

export const ACTIVITY = [
  { id: "a1", icon: "❤️", text: "Simi Sola liked your take", time: "2h", lane: "socials", unread: true },
  { id: "a2", icon: "💬", text: "New reply in #lounge from Femi", time: "3h", lane: "chat", unread: true },
  { id: "a3", icon: "🏠", text: "Lagos Founders posted a new room", time: "5h", lane: "home", unread: false },
  { id: "a4", icon: "🎵", text: "Your track Ojuelegba Nights hit 12k", time: "1d", lane: "music", unread: false },
];

export const ROOMS = [
  { id: "r1", av: "LF", name: "Lagos Founders", meta: "2.4k · House for builders", live: true },
  { id: "r2", av: "AL", name: "Afrobeats Lab", meta: "1.2k · Studio, samples", live: true },
  { id: "r3", av: "TX", name: "Tech Lagos", meta: "3.1k · Builders only", live: false },
];

export const TRACKS = [
  { id: "t1", title: "Ojuelegba Nights", artist: "Simi Sola", color: "#2563EB" },
  { id: "t2", title: "Eko Energy", artist: "Femi + Liza", color: "#059669" },
  { id: "t3", title: "Water & Light", artist: "Ayo Blue", color: "#7C3AED" },
];
