export const DESKS = [
  { id: "jobs", label: "Jobs", icon: "💼", blurb: "Roles across Lagos & remote" },
  { id: "market", label: "Market", icon: "🛍️", blurb: "Buy & sell local" },
  { id: "rent", label: "Rent", icon: "🏠", blurb: "Flats, short-lets, offices" },
  { id: "events", label: "Events", icon: "📅", blurb: "Tonight in the city" },
  { id: "cinema", label: "Cinema", icon: "🎬", blurb: "Vote & discover film" },
  { id: "music", label: "Music", icon: "🎵", blurb: "New drops & playlists" },
  { id: "teams", label: "Teams", icon: "👥", blurb: "Find collaborators" },
  { id: "ads", label: "Ads", icon: "📢", blurb: "Reach Naija audiences" },
  { id: "chat", label: "Chat", icon: "💬", blurb: "Rooms & DMs" },
  { id: "spaces", label: "Spaces", icon: "🏢", blurb: "Brand & business pages" },
];

export const ROLE_GRID = [
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "market", label: "Market", icon: "🛍️" },
  { id: "rent", label: "Rent", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "cinema", label: "Cinema", icon: "🎬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "teams", label: "Teams", icon: "👥" },
  { id: "spaces", label: "Spaces", icon: "🏢" },
];

export const CAROUSEL = [
  { id: "c1", title: "Lagos is live", sub: "Rooms, music, desks — your city OS", cta: "Explore", color: "#1D4ED8", color2: "#3B82F6" },
  { id: "c2", title: "Ojuelegba Nights", sub: "New drop from Simi Sola", cta: "Play", color: "#7C3AED", color2: "#A78BFA" },
  { id: "c3", title: "Hire in Naija", sub: "Fresh roles from Lagos founders", cta: "Browse jobs", color: "#047857", color2: "#34D399" },
  { id: "c4", title: "Cinema Friday", sub: "Vote the next screening", cta: "Open cinema", color: "#B45309", color2: "#FBBF24" },
];

export const CREATE = [
  { label: "Post", sub: "Share a take", icon: "✏️", tab: "socials" },
  { label: "Track", sub: "Drop music", icon: "🎵", tab: "music" },
  { label: "Film", sub: "Add cinema", icon: "🎬", tab: "cinema" },
  { label: "Job", sub: "Post a role", icon: "💼", tab: "jobs" },
  { label: "Market", sub: "List a product", icon: "🛍️", tab: "market" },
  { label: "Event", sub: "Host something", icon: "📅", tab: "events" },
];

export const TAKES = [
  { id: "1", name: "Chioma Ade", handle: "chioma", time: "2h", role: "Commerce · Yaba", text: "Just shipped v2 of our Lagos commerce toolkit — inventory sync, WhatsApp checkout, instant settlement. Built for market women first. Pilot with 40 stalls on Balogun.", likes: 127, comments: 8, reposts: 19, tags: ["take", "spark"] },
  { id: "2", name: "Simi Sola", handle: "simisola", time: "6h", role: "Artist · Lagos", text: "Ojuelegba Nights out now everywhere. Wrote this on a danfo to Yaba. Thank you Lagos for raising me.", likes: 342, comments: 21, reposts: 84, tags: ["music"], verified: true },
  { id: "3", name: "Femi Bankole", handle: "femi_b", time: "4h", role: "Urbanist · Island", text: "Third Mainland at 6pm is a design failure, not a people failure. We mapped 12 informal bus stops that could become BRT Lite with just paint + shade + one marshal.", likes: 89, comments: 14, reposts: 12, tags: ["take", "fact"] },
  { id: "4", name: "Amaka Nwosu", handle: "amaka", time: "8h", role: "Founder · Fintech", text: "Hiring 2 backend engineers in Lagos. Rust or Go. Real ownership, not ticket farms. DM if you’ve shipped payments under load.", likes: 56, comments: 31, reposts: 9, tags: ["jobs"], verified: true },
  { id: "5", name: "Tunde Okoye", handle: "tunde", time: "11h", role: "Film · Nollywood", text: "Screening a 22-min short this Friday at Freedom Park. Free. Come argue about the ending with me after.", likes: 203, comments: 17, reposts: 45, tags: ["cinema", "events"] },
];

export const ACTIVITY = [
  { id: "a1", icon: "❤️", text: "Simi Sola liked your take", time: "2h", lane: "socials", unread: true },
  { id: "a2", icon: "💬", text: "New reply in #lounge from Femi", time: "3h", lane: "chat", unread: true },
  { id: "a3", icon: "🏠", text: "Lagos Founders posted a new room note", time: "5h", lane: "home", unread: false },
  { id: "a4", icon: "🎵", text: "Ojuelegba Nights crossed 12k plays", time: "1d", lane: "music", unread: false },
  { id: "a5", icon: "👥", text: "Amaka started following you", time: "1d", lane: "socials", unread: false },
  { id: "a6", icon: "📢", text: "Your ad draft is ready for review", time: "2d", lane: "ads", unread: false },
];

export const ROOMS = [
  { id: "r1", av: "LF", name: "Lagos Founders", meta: "2.4k · House for builders", live: true, speaking: 12 },
  { id: "r2", av: "AL", name: "Afrobeats Lab", meta: "1.2k · Studio & samples", live: true, speaking: 8 },
  { id: "r3", av: "TX", name: "Tech Lagos", meta: "3.1k · Builders only", live: false, speaking: 0 },
  { id: "r4", av: "CN", name: "Cinema Club", meta: "890 · Friday screenings", live: false, speaking: 0 },
];

export const TRACKS = [
  { id: "t1", title: "Ojuelegba Nights", artist: "Simi Sola", color: "#2563EB" },
  { id: "t2", title: "Eko Energy", artist: "Femi + Liza", color: "#059669" },
  { id: "t3", title: "Water & Light", artist: "Ayo Blue", color: "#7C3AED" },
  { id: "t4", title: "Danfo Dreams", artist: "Kemi Wave", color: "#EA580C" },
];

export const NEWS = [
  { id: "n1", kicker: "Business · Lagos", title: "Paystack alumni raise $3.2M to rebuild discovery for local commerce", time: "2h", tone: "#DBEAFE" },
  { id: "n2", kicker: "Culture · Nigeria", title: "Inside the studios mapping Afrobeats samples from Tejuosho to the world", time: "5h", tone: "#FEF9C3" },
  { id: "n3", kicker: "Policy · Lagos", title: "State opens short-let registration window — what hosts need to know", time: "8h", tone: "#D1FAE5" },
];

export const LISTINGS: Record<string, { id: string; title: string; meta: string; price?: string; tag?: string }[]> = {
  jobs: [
    { id: "j1", title: "Backend Engineer (Rust/Go)", meta: "Fintech · Lagos · Full-time", price: "₦8–12M", tag: "Hot" },
    { id: "j2", title: "Product Designer", meta: "Commerce · Hybrid", price: "₦4–6M", tag: "New" },
    { id: "j3", title: "Community Lead", meta: "Kilode · Remote-friendly", price: "₦3–5M" },
  ],
  market: [
    { id: "m1", title: "Vintage Ankara set", meta: "Yaba · Seller verified", price: "₦18,000" },
    { id: "m2", title: "iPhone 13 · 128GB", meta: "Ikeja · Good condition", price: "₦420,000", tag: "Deal" },
    { id: "m3", title: "Studio monitors pair", meta: "Surulere · Musician", price: "₦95,000" },
  ],
  rent: [
    { id: "re1", title: "2-bed Lekki Phase 1", meta: "Short-let · WiFi · Generator", price: "₦45k/night", tag: "Popular" },
    { id: "re2", title: "Self-contain Yaba", meta: "Monthly · Near UNILAG", price: "₦350k/yr" },
    { id: "re3", title: "Office desk · Co-work", meta: "VI · Day pass", price: "₦8,000/day" },
  ],
  events: [
    { id: "e1", title: "Freedom Park short film", meta: "Fri 7pm · Free", tag: "Tonight" },
    { id: "e2", title: "Lagos Founders meetup", meta: "Sat · Civic Centre", price: "₦5,000" },
    { id: "e3", title: "Afrobeats open mic", meta: "Sun · Muri Okunola", price: "Free" },
  ],
  cinema: [],
  music: [],
  teams: [
    { id: "te1", title: "Need mobile eng for fintech MVP", meta: "3-month · Equity + cash" },
    { id: "te2", title: "Looking for Nollywood editor", meta: "Lagos · Project" },
  ],
  ads: [
    { id: "ad1", title: "Feed takeover · 24h", meta: "Lagos geo · From ₦25k", tag: "Boost" },
    { id: "ad2", title: "Story pack · 7 days", meta: "Nigeria · Brand safe", price: "₦120k" },
  ],
  chat: [],
  spaces: [
    { id: "sp1", title: "Paystack Alumni", meta: "1.2k members · Verified" },
    { id: "sp2", title: "Nollywood Guild", meta: "890 · Film" },
  ],
};

export const FILMS = [
  { id: "f1", title: "Ojuelegba Cut", runtime: "22 min", votes: 128, synopsis: "A night bus, a sample pack, and the city that refuses to sleep." },
  { id: "f2", title: "Third Mainland", runtime: "48 min", votes: 86, synopsis: "Documentary on informal transit design and the people who move Lagos." },
  { id: "f3", title: "Balogun Hour", runtime: "14 min", votes: 201, synopsis: "Market morning in 4K — commerce before the phones wake up." },
];

export const CHAT_THREADS = [
  {
    id: "ct1",
    name: "#lounge",
    preview: "Femi: who is going to Freedom Park Fri?",
    unread: 2,
    messages: [
      { id: "m1", from: "Femi", text: "Who is going to Freedom Park Fri?", time: "3h", me: false },
      { id: "m2", from: "Amaka", text: "I am — bringing the fintech crew", time: "2h", me: false },
      { id: "m3", from: "You", text: "Count me in", time: "1h", me: true },
    ],
  },
  {
    id: "ct2",
    name: "Lagos Founders",
    preview: "New room note pinned",
    unread: 0,
    messages: [
      { id: "m4", from: "Chioma", text: "Pinned: office hours Thu 4pm", time: "5h", me: false },
      { id: "m5", from: "You", text: "Thanks — will join", time: "4h", me: true },
    ],
  },
  {
    id: "ct3",
    name: "Simi Sola",
    preview: "Thanks for the repost 🙏",
    unread: 1,
    messages: [
      { id: "m6", from: "Simi Sola", text: "Thanks for the repost 🙏", time: "6h", me: false },
    ],
  },
];
