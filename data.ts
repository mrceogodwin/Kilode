/** Seed / offline catalogue — never reported as live API data. */

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
] as const;

export const DESK_SHORT = [
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "market", label: "Market", icon: "🛍️" },
  { id: "rent", label: "Rent", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "cinema", label: "Cinema", icon: "🎬" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "ads", label: "Ads", icon: "📢" },
] as const;

export const STORIES = [
  { id: "s0", label: "You", av: "+" },
  { id: "s1", label: "Chioma", av: "C", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s2", label: "Simi", av: "S", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s3", label: "Femi", av: "F", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s4", label: "Amaka", av: "A", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s5", label: "Tunde", av: "T", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80" },
  { id: "s6", label: "Kemi", av: "K", avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&h=120&q=80" },
];

/** Create sheet options — capability gates client UI; server must enforce. */
export const CREATE = [
  { label: "Post", sub: "Share a take", icon: "✏️", tab: "socials", capability: "feed_post" as const },
  { label: "Track", sub: "Drop music", icon: "🎵", tab: "music", capability: "music_list" as const },
  { label: "Film", sub: "Add cinema", icon: "🎬", tab: "cinema", capability: "cinema_submit" as const },
  { label: "Job", sub: "Post a role", icon: "💼", tab: "jobs", capability: "jobs_post" as const },
  { label: "Market", sub: "List a product", icon: "🛍️", tab: "market", capability: "market_sell" as const },
  { label: "Event", sub: "Host something", icon: "📅", tab: "events", capability: "feed_post" as const },
  { label: "Ad", sub: "Place a campaign", icon: "📢", tab: "ads", capability: "ads_place" as const },
];

export const TAKES = [
  {
    id: "1",
    name: "Chioma Ade",
    handle: "chioma",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    time: "2h",
    text: "Lagos after the rain hits different. Who else is out on the Island tonight?",
    likes: 128,
    comments: 24,
    mediaUrl: "https://images.unsplash.com/photo-1533929736458-ca588d81b36b?w=800&q=80",
  },
  {
    id: "2",
    name: "Femi Okafor",
    handle: "femiok",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    time: "4h",
    text: "Just dropped a new Afrobeats mix. Stream on Kilode Music when the bridge is live — for now enjoy the vibe locally.",
    likes: 89,
    comments: 11,
  },
  {
    id: "3",
    name: "Amaka Nwosu",
    handle: "amakan",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&h=120&q=80",
    time: "6h",
    text: "Hiring junior designers in Abuja. DM if you ship Figma fast.",
    likes: 56,
    comments: 18,
  },
  {
    id: "4",
    name: "Tunde Bakare",
    handle: "tundebuilds",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    time: "8h",
    role: "Creator",
    text: "Spent the weekend building a tiny tool for Nigerian freelancers to track invoices. What would you want in a first version?",
    likes: 43,
    comments: 9,
  },
];

export const ROOMS = [
  { id: "r1", name: "#afrobeats", preview: "New chart talk", time: "now" },
  { id: "r2", name: "#lagos-tech", preview: "Funding thread", time: "12m" },
];

export const NEWS = [
  {
    id: "n1",
    title: "Afrobeats continues to shape global sound",
    kicker: "Entertainment",
    time: "3m ago",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    body: "Nigerian artists are leading a new wave across charts and festivals worldwide.",
  },
  {
    id: "n2",
    title: "Wizkid hints at new album in 2026",
    kicker: "Entertainment",
    time: "2h ago",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-6697288d5b28?w=600&q=80",
  },
  {
    id: "n3",
    title: "Chelsea edge past Man United",
    kicker: "Sports",
    time: "4h ago",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
  },
  {
    id: "n4",
    title: "Apple's next iPhone leaks online",
    kicker: "Tech",
    time: "6h ago",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  },
  {
    id: "n5",
    title: "Best trips you must visit",
    kicker: "Lifestyle",
    time: "6h ago",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  },
];

export const TRACKS = [
  { id: "t1", title: "Hunter of Africa", artist: "Mudino", color: "#B45309", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", previewKind: "sample" },
  { id: "t2", title: "We Want a Party", artist: "Mudino", color: "#7C3AED", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", previewKind: "sample" },
  { id: "t3", title: "Calm Down", artist: "Rema", color: "#D97706" },
  { id: "t4", title: "Water & Light", artist: "Ayo Blue", color: "#2563EB" },
];

export const ACTIVITY = [
  { id: "a1", icon: "❤️", text: "Rema liked your post", time: "2m", unread: true, lane: "socials" },
  { id: "a2", icon: "💬", text: "Ayra commented on your take", time: "18m", unread: true, lane: "socials" },
  { id: "a3", icon: "👤", text: "Burna Boy started following you", time: "1h", unread: false, lane: "socials" },
];

export const LISTINGS: Record<string, any[]> = {
  events: [
    { id: "e1", title: "Lagos Music Festival 2025", meta: "Sat · Eko Convention", price: "From ₦15,000", tag: "Music" },
    { id: "e2", title: "Tech Summit", meta: "Tue · Landmark", price: "Register", tag: "Tech" },
  ],
  jobs: [
    { id: "j1", title: "Frontend Developer", meta: "Lagos · Full-time", price: "₦250k–₦400k" },
  ],
  market: [
    { id: "m1", title: "Nike Air Force 1", meta: "Fashion", price: "₦85,000" },
  ],
};

export const CHAT_THREADS = [
  { id: "c1", name: "Chioma Ade", preview: "See you at the show", time: "2m" },
  { id: "c2", name: "#afrobeats", preview: "Chart update dropped", time: "15m" },
  { id: "c3", name: "Femi Okafor", preview: "Sending the stems", time: "1h" },
];

export const CAROUSEL = NEWS.slice(0, 3);
