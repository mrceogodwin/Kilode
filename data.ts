/** Seed — offline until Nine opens JSON. factPct mirrors Nine Fact/Cap. */
export const DESKS = [
  { id: "jobs", label: "Jobs", icon: "💼", blurb: "Roles across Nigeria · Staff approve" },
  { id: "market", label: "Market", icon: "🛍️", blurb: "Buy & sell local" },
  { id: "rent", label: "Rent", icon: "🏠", blurb: "Flats, short-lets, offices" },
  { id: "events", label: "Events", icon: "📅", blurb: "What is on · RSVP free" },
  { id: "cinema", label: "Cinema", icon: "🎬", blurb: "Watch and vote" },
  { id: "music", label: "Music", icon: "🎵", blurb: "Artist links · We embed" },
  { id: "chat", label: "Chat", icon: "💬", blurb: "Live rooms · topics & places" },
  { id: "ads", label: "Ads", icon: "📢", blurb: "Live brand campaigns" },
  { id: "library", label: "Library", icon: "📚", blurb: "10,000 books · read here" },
  { id: "sports", label: "Sports", icon: "⚽", blurb: "Scores & talk" },
  { id: "tech", label: "Tech & Biz", icon: "💻", blurb: "Builders & markets" },
  { id: "videos", label: "Videos", icon: "▶️", blurb: "Clips on Kilode" },
];

export const ROLE_GRID = [
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "market", label: "Market", icon: "🛍️" },
  { id: "rent", label: "Rent", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "cinema", label: "Cinema", icon: "🎬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "ads", label: "Ads", icon: "📢" },
];

export const CAROUSEL = [
  { id: "c1", title: "Lagos is live", sub: "Rooms, music, desks", cta: "Explore", color: "#8B6B35", color2: "#D4AF37" },
  { id: "c2", title: "Ojuelegba Nights", sub: "Simi Sola · New drop", cta: "Play", color: "#5A4728", color2: "#E5C158" },
  { id: "c3", title: "Hire in Naija", sub: "Fresh roles", cta: "Jobs", color: "#3A3021", color2: "#D4AF37" },
  { id: "c4", title: "Cinema Friday", sub: "Vote the next screening", cta: "Cinema", color: "#171613", color2: "#A88A4E" },
];

export const STORIES = [
  { id: "s0", label: "You", av: "+" },
  { id: "s1", label: "Chioma", av: "C", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s2", label: "Simi", av: "S", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s3", label: "Femi", av: "F", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s4", label: "Amaka", av: "A", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s5", label: "Tunde", av: "T", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s6", label: "Kemi", av: "K", avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&h=120&q=80" },
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
  {
    id: "1",
    name: "Chioma Ade",
    handle: "chioma",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    time: "2h",
    role: "Commerce · Yaba",
    text: "Just shipped v2 of our Lagos commerce toolkit — inventory sync, WhatsApp checkout, instant settlement. Built for market women first. Pilot with 40 stalls on Balogun.",
    likes: 127,
    comments: 8,
    reposts: 19,
    tags: ["take", "spark"],
    factPct: 62,
    media: true,
    mediaTone: "#D4AF37",
    mediaUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  },
  {
    id: "2",
    name: "Simi Sola",
    handle: "simisola",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80",
    time: "6h",
    role: "Artist · Lagos",
    text: "Ojuelegba Nights out now everywhere. Wrote this on a danfo to Yaba. Thank you Lagos for raising me.",
    likes: 342,
    comments: 21,
    reposts: 84,
    tags: ["music"],
    verified: true,
    factPct: 70,
    media: true,
    mediaTone: "#A88A4E",
    mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
  },
  {
    id: "3",
    name: "Femi Bankole",
    handle: "femi_b",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    time: "4h",
    role: "Urbanist · Island",
    text: "Third Mainland at 6pm is a design failure, not a people failure. We mapped 12 informal bus stops that could become BRT Lite with just paint + shade + one marshal.",
    likes: 89,
    comments: 14,
    reposts: 12,
    tags: ["take", "fact"],
    factPct: 88,
    media: true,
    mediaTone: "#8B6B35",
    mediaUrl: "https://images.unsplash.com/photo-1570125909232-eb4e5e5a8a44?w=800&q=80",
  },
  {
    id: "4",
    name: "Amaka Nwosu",
    handle: "amaka",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    time: "8h",
    role: "Founder · Fintech",
    text: "Hiring 2 backend engineers in Lagos. Rust or Go. Real ownership, not ticket farms. DM if you’ve shipped payments under load.",
    likes: 56,
    comments: 31,
    reposts: 9,
    tags: ["jobs"],
    verified: true,
    factPct: 55,
  },
  {
    id: "5",
    name: "Tunde Okoye",
    handle: "tunde",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    time: "11h",
    role: "Film · Nollywood",
    text: "Screening a 22-min short this Friday at Freedom Park. Free. Come argue about the ending with me after.",
    likes: 203,
    comments: 17,
    reposts: 45,
    tags: ["cinema", "events"],
    factPct: 40,
    media: true,
    mediaTone: "#5A4728",
    mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  },
  {
    id: "6",
    name: "Ope",
    handle: "ope",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    time: "1d",
    role: "job_poster",
    text: "Working remotely in Nigeria is actually harder than going to a physical office because of power and data management.",
    likes: 91,
    comments: 1,
    reposts: 4,
    tags: ["take"],
    factPct: 100,
  },
  {
    id: "7",
    name: "Lagos Founders",
    handle: "lagosfounders",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    time: "1d",
    role: "Space · Verified",
    text: "Thursday office hours at Civic Centre. Bring a one-pager. No pitch decks longer than 5 slides. Coffee on us.",
    likes: 94,
    comments: 22,
    reposts: 18,
    tags: ["events"],
    verified: true,
    factPct: 50,
    media: true,
    mediaTone: "#3A3021",
    mediaUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
  },
  {
    id: "8",
    name: "Mudino",
    handle: "mudino",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    time: "2d",
    role: "member",
    text: "Believe!",
    likes: 53,
    comments: 0,
    reposts: 2,
    tags: ["take"],
    factPct: 50,
    media: true,
    mediaTone: "#D4AF37",
    mediaUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80",
  },
];

export const ACTIVITY = [
  { id: "a1", icon: "❤️", text: "Simi Sola and 2,035 others loved your post", time: "30s", lane: "socials", unread: true, action: "none" },
  { id: "a2", icon: "💬", text: "Ahmed Bob Marley commented on your post", time: "2 min", lane: "socials", unread: true, action: "none" },
  { id: "a3", icon: "➕", text: "Amaka Nwosu started following you", time: "1 hr", lane: "socials", unread: true, action: "follow_back" },
  { id: "a4", icon: "🎵", text: "Ojuelegba Nights crossed 12k plays", time: "1d", lane: "music", unread: false, action: "none" },
  { id: "a5", icon: "💬", text: "New reply in #lounge from Femi", time: "3h", lane: "chat", unread: false, action: "none" },
  { id: "a6", icon: "🎬", text: "Cinema Friday · Freedom Park is filling up", time: "4h", lane: "cinema", unread: true, action: "none" },
  { id: "a7", icon: "💼", text: "3 new roles match your profile", time: "6h", lane: "jobs", unread: false, action: "none" },
];

export const ROOMS = [
  { id: "r1", av: "KL", name: "Kilode Lounge", meta: "5.2k · Hot Topics", live: true, speaking: 18 },
  { id: "r2", av: "NP", name: "Naija Pulse", meta: "7.8k · News & talk", live: true, speaking: 11 },
  { id: "r3", av: "MV", name: "Music & Vibes", meta: "2.4k · Drops", live: true, speaking: 6 },
  { id: "r4", av: "LF", name: "Lagos Founders", meta: "2.4k · Builders", live: false, speaking: 0 },
  { id: "r5", av: "HT", name: "Hot Topics", meta: "8.2k · Trending", live: true, speaking: 14 },
];

export const TRACKS = [
  { id: "t1", title: "Ojuelegba Nights", artist: "Simi Sola", color: "#D4AF37" },
  { id: "t2", title: "Last Last", artist: "Burna Boy", color: "#8B6B35" },
  { id: "t3", title: "Essence", artist: "Wizkid", color: "#5A4728" },
  { id: "t4", title: "Danfo Dreams", artist: "Kemi Wave", color: "#3A3021" },
  { id: "t5", title: "Joro", artist: "Wizkid", color: "#A88A4E" },
  { id: "t6", title: "Balogun Bounce", artist: "Market Band", color: "#171613" },
];

export const NEWS = [
  { id: "n1", kicker: "NAIJA · 885", title: "Police arrest 60 over assault of officer", time: "2h", tone: "#5A4728", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=240&h=180&q=80" },
  { id: "n2", kicker: "BUSINESS · 691", title: "Oil spill hits Akwa Ibom oil community as NOSDRA probes source", time: "5h", tone: "#3A3021", imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=240&h=180&q=80" },
  { id: "n3", kicker: "POLITICS", title: "2027: Wike says Otti backing Tinubu; Abla", time: "8h", tone: "#8B6B35", imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=240&h=180&q=80" },
  { id: "n4", kicker: "EDUCATION", title: "King’s College: Glory, decay and battle over", time: "3h", tone: "#D4AF37", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=240&h=180&q=80" },
  { id: "n5", kicker: "NEWS", title: "When rain becomes a governance test", time: "9h", tone: "#A88A4E", imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=240&h=180&q=80" },
];

export const LISTINGS: Record<string, { id: string; title: string; meta: string; price?: string; tag?: string }[]> = {
  jobs: [
    { id: "j1", title: "Content writer — Abuja", meta: "Kilode Desk · 30d", price: "Abuja", tag: "JOB" },
    { id: "j2", title: "Frontend designer — Lagos", meta: "Kilode Studio · 30d", price: "Lagos", tag: "JOB" },
    { id: "j3", title: "Backend Engineer (Rust/Go)", meta: "Fintech · Lagos", price: "₦8–12M", tag: "Hot" },
    { id: "j4", title: "iOS Engineer", meta: "Social · Lagos", price: "₦7–10M", tag: "New" },
  ],
  market: [
    { id: "m1", title: "Vintage Ankara set", meta: "Yaba · Seller verified", price: "₦18,000" },
    { id: "m2", title: "iPhone 13 · 128GB", meta: "Ikeja · Good condition", price: "₦420,000", tag: "Deal" },
  ],
  rent: [
    { id: "re1", title: "2-bed Lekki Phase 1", meta: "Short-let · WiFi · Generator", price: "₦45k/night", tag: "Popular" },
  ],
  events: [
    { id: "e1", title: "Freedom Park short film", meta: "Fri 7pm · Free", tag: "Tonight" },
    { id: "e2", title: "Lagos Founders meetup", meta: "Sat · Civic Centre", price: "₦5,000" },
  ],
  cinema: [],
  music: [],
  chat: [],
  ads: [
    { id: "ad1", title: "Feed takeover · 24h", meta: "Lagos geo · From ₦25k", tag: "Boost" },
  ],
  library: [
    { id: "lb1", title: "Public-domain shelf", meta: "Project Gutenberg · 32 at a time" },
  ],
  sports: [
    { id: "sp1", title: "Matchday thread · Super Eagles", meta: "Live chat · 2.1k" },
  ],
  tech: [
    { id: "tc1", title: "Weekly Lagos builders standup", meta: "Thu · Hybrid" },
  ],
  videos: [
    { id: "v1", title: "Clips on Kilode", meta: "Coming from Nine" },
  ],
};

export const FILMS = [
  { id: "f1", title: "Ojuelegba Cut", runtime: "22 min", votes: 128, synopsis: "A night bus, a sample pack, and the city that refuses to sleep." },
  { id: "f2", title: "Third Mainland", runtime: "48 min", votes: 86, synopsis: "Documentary on informal transit design and the people who move Lagos." },
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
    name: "Kilode Lounge",
    preview: "Pinned: Paystack for hustle",
    unread: 0,
    messages: [
      { id: "m4", from: "System", text: "Pinned · Paystack for hustle — Collect payments in Naira.", time: "1d", me: false },
      { id: "m5", from: "KILODEAFRICA08099", text: "Testing", time: "16 Oct", me: false },
    ],
  },
];
