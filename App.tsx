/**
 * Kilode Premium — React Native Expo (iOS first)
 * #1877F2 · white cards · #F6F8FB bg · #E7ECF2 border
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  SafeAreaView, StatusBar, Modal, Pressable,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const BLUE = '#1877F2', BG = '#F6F8FB', WHITE = '#FFFFFF', BORDER = '#E7ECF2';
const BLACK = '#111827', GRAY = '#64748B', GRAY2 = '#94A3B8';
const GREEN_BG = '#ECFDF3', GREEN_BORDER = '#ABEFC6', GREEN_TEXT = '#067647', BLUE_SOFT = '#EFF6FF';

const ROOMS = [
  { id: 'lounge', name: 'Lounge', online: 42 }, { id: 'hot', name: 'Hot', online: 128 },
  { id: 'ng', name: 'Nigeria', online: 89 }, { id: 'music', name: 'Music', online: 56 },
  { id: 'cinema', name: 'Cinema', online: 23 }, { id: 'jobs', name: 'Jobs', online: 34 },
  { id: 'sport', name: 'Sport', online: 67 }, { id: 'tech', name: 'Tech', online: 91 },
  { id: 'st-lagos', name: 'Lagos', online: 210 }, { id: 'st-fct', name: 'FCT', online: 45 },
  { id: 'st-rivers', name: 'Rivers', online: 38 }, { id: 'north', name: 'North', online: 52 },
];
const TRACKS = [
  { id: '1', title: 'Ojuelegba Nights', artist: 'Simi Sola', color: '#2563EB' },
  { id: '2', title: 'Eko Energy', artist: 'Tayo & Bisi', color: '#059669' },
  { id: '3', title: 'Water & Light', artist: 'Obi Dara', color: '#7C3AED' },
  { id: '4', title: '303 Gidi', artist: 'Aje', color: '#EA580C' },
];
const DESKS = [
  { id: 'jobs', label: 'Jobs', icon: 'J' }, { id: 'market', label: 'Market', icon: 'M' },
  { id: 'rent', label: 'Rent', icon: 'R' }, { id: 'events', label: 'Events', icon: 'E' },
  { id: 'cinema', label: 'Cinema', icon: 'C' }, { id: 'teams', label: 'Teams', icon: 'T' },
  { id: 'ads', label: 'Ads', icon: 'A' }, { id: 'spaces', label: 'Spaces', icon: 'S' },
  { id: 'chat', label: 'Chat', icon: 'H' }, { id: 'music', label: 'Music', icon: 'U' },
];
const CREATE = [
  { label: 'Post', sub: 'Share a take', icon: 'P', tab: 'socials' },
  { label: 'Article', sub: 'Write news', icon: 'N', tab: 'home' },
  { label: 'Track', sub: 'Drop music', icon: 'U', tab: 'music' },
  { label: 'Film', sub: 'Add cinema', icon: 'C', tab: 'cinema' },
  { label: 'Room', sub: 'Start room', icon: 'R', tab: 'chat' },
  { label: 'Event', sub: 'Host event', icon: 'E', tab: 'events' },
  { label: 'Job', sub: 'Post job', icon: 'J', tab: 'jobs' },
  { label: 'Market', sub: 'Sell product', icon: 'M', tab: 'market' },
  { label: 'Rent', sub: 'List space', icon: 'R', tab: 'rent' },
  { label: 'Ad', sub: 'Place ad', icon: 'A', tab: 'ads' },
  { label: 'Space', sub: 'Create space', icon: 'S', tab: 'spaces' },
  { label: 'Team', sub: 'Create team', icon: 'T', tab: 'teams' },
];
const SEED = [
  { id: '1', name: 'Chioma Ade', handle: 'choma', time: '12m', role: 'Builder',
    text: 'Just shipped our community commerce toolkit. Small traders in Yaba. Nigerian problems, Nigerian software.',
    likes: 127, reposts: 19, comments: 8 },
  { id: '2', name: 'Femi Visuals', handle: 'femi.vs', time: '4m', role: 'Creator',
    text: 'Shot this on a busted Infinix at 5:43am on Third Mainland. Lagos never misses.',
    likes: 342, reposts: 42, comments: 31 },
];
const ACT = [
  { id: '1', icon: '*', text: 'Chioma liked your take', ts: '2m', href: 'socials', seen: false },
  { id: '2', icon: 'C', text: 'New reply in #Lagos Founders', ts: '15m', href: 'chat', seen: false },
  { id: '3', icon: 'U', text: 'Simi Sola dropped Ojuelegba Nights', ts: '1h', href: 'music', seen: true },
  { id: '4', icon: 'F', text: 'Eko for Show approved', ts: '3h', href: 'cinema', seen: true },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [homeSub, setHomeSub] = useState('foryou');
  const [edFilter, setEdFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [desksOpen, setDesksOpen] = useState(false);
  const [joined, setJoined] = useState({});
  const [liked, setLiked] = useState({});
  const [nowPlaying, setNowPlaying] = useState(null);
  const [toast, setToast] = useState('');
  const [takes, setTakes] = useState(SEED);
  const [newTake, setNewTake] = useState('');
  const [chatRoom, setChatRoom] = useState('lounge');
  const [chatMsg, setChatMsg] = useState('');
  const [msgs, setMsgs] = useState({
    lounge: [
      { id: 'm1', n: 'Amaka', text: 'Anyone in Yaba this evening?' },
      { id: 'm2', n: 'Tunde', text: 'Heading to CMS - traffic light today' },
    ],
  });
  const [activity, setActivity] = useState(ACT);

  const showToast = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 2200); }, []);
  const go = (id) => { setTab(id); setCreateOpen(false); setDesksOpen(false); };

  const Header = () => (
    <View style={s.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={s.logo}>kilode</Text>
        <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveText}>LIVE</Text></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity style={s.searchPill} onPress={() => showToast('Search')}>
          <Text style={{ color: GRAY, fontSize: 13 }}>Search Kilode</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('activity')}><Text style={{ fontSize: 16 }}>Bell</Text></TouchableOpacity>
        <TouchableOpacity style={s.avatarK} onPress={() => go('myspace')}>
          <Text style={{ color: WHITE, fontWeight: '800', fontSize: 13 }}>K</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Home = () => (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: BLACK }}>Good morning, Lagos</Text>
        <Text style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Catch up on rooms, stories, and drops from people you follow.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingBottom: 8 }}>
        {['foryou', 'trending', 'rooms', 'news'].map((id) => (
          <TouchableOpacity key={id} onPress={() => { setHomeSub(id); showToast(id); }} style={[s.pill, homeSub === id && { backgroundColor: BLACK }]}>
            <Text style={[s.pillText, homeSub === id && { color: WHITE }]}>{id === 'foryou' ? 'For you' : id[0].toUpperCase() + id.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.card}>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <View style={s.emptyIcon}><Text style={{ fontSize: 20 }}>+</Text></View>
          <Text style={{ fontSize: 15, fontWeight: '700', marginTop: 10 }}>No posts yet</Text>
          <Text style={{ fontSize: 12, color: GRAY, textAlign: 'center', marginTop: 6, maxWidth: 220 }}>Be first - share a take for Nigeria.</Text>
          <TouchableOpacity style={[s.btnPrimary, { marginTop: 14 }]} onPress={() => setCreateOpen(true)}>
            <Text style={s.btnPrimaryText}>Create post</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, fontWeight: '700' }}>Discover rooms</Text>
        <Text style={{ fontSize: 11, color: GRAY }}>2 active</Text>
      </View>
      {[{ id: 'lagos', title: 'Lagos Founders', sub: 'Startups - Tech - Funding', members: '2.4k', initials: 'LF' },
        { id: 'afro', title: 'Afrobeats Lab', sub: 'Drops - Sessions', members: '8k', initials: 'AL' }].map((r) => (
        <View key={r.id} style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
          <View style={s.roomAvatar}><Text style={{ color: WHITE, fontWeight: '800' }}>{r.initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700' }}>{r.title}</Text>
            <Text style={{ fontSize: 11, color: GRAY }}>{r.sub} - {r.members} members</Text>
          </View>
          <TouchableOpacity style={[s.btnJoin, joined[r.id] && s.btnJoined]} onPress={() => { setJoined((j) => ({ ...j, [r.id]: !j[r.id] })); showToast(joined[r.id] ? 'Left' : 'Joined ' + r.title); }}>
            <Text style={[s.btnJoinText, joined[r.id] && { color: BLACK }]}>{joined[r.id] ? 'Joined' : 'Join'}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={s.card}>
        <View style={s.featBadge}><Text style={s.featBadgeText}>FEATURED - BUSINESS</Text></View>
        <Text style={{ fontSize: 17, fontWeight: '800', marginTop: 8, lineHeight: 22 }}>How Kilode is rebuilding discovery for Nigerian creators without an algorithm</Text>
        <Text style={{ fontSize: 13, color: '#475569', marginTop: 8, lineHeight: 20 }}>Rooms, editorial curation, chronological feeds.</Text>
        <Text style={{ fontSize: 11, color: GRAY2, marginTop: 10 }}>Kilode Editorial - 6 min - Yesterday</Text>
      </View>
      <View style={[s.card, { backgroundColor: '#F8FAFC', borderStyle: 'dashed' }]}>
        <Text style={{ fontSize: 10, color: GRAY2, fontWeight: '700' }}>ADVERTISEMENT</Text>
        <Text style={{ fontSize: 12, color: GRAY, marginTop: 6 }}>Slot fills when ad unit is on. Layout preserved - no CLS.</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', paddingHorizontal: 16, marginTop: 8 }}>Music new drops</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10, paddingVertical: 8 }}>
        {TRACKS.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => { setNowPlaying(t); showToast('Playing ' + t.title); go('music'); }} style={{ width: 110 }}>
            <View style={{ width: 110, height: 110, borderRadius: 14, backgroundColor: t.color, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 8 }}>
              <View style={s.playCircle}><Text style={{ color: BLACK, fontSize: 12 }}>Play</Text></View>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 6 }} numberOfLines={1}>{t.title}</Text>
            <Text style={{ fontSize: 11, color: GRAY }}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={{ fontSize: 14, fontWeight: '700', paddingHorizontal: 16, marginTop: 8 }}>Desks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 10, paddingVertical: 8 }}>
        {DESKS.map((d) => (
          <TouchableOpacity key={d.id} onPress={() => go(d.id)} style={s.deskCard}>
            <Text style={{ fontSize: 16, fontWeight: '800' }}>{d.icon}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', marginTop: 4 }}>{d.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setDesksOpen(true)} style={s.deskCard}>
          <Text style={{ fontSize: 16 }}>...</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', marginTop: 4 }}>More</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const Socials = () => (
    <View>
      <View style={s.composer}>
        <View style={s.avatarK}><Text style={{ color: WHITE, fontWeight: '800' }}>K</Text></View>
        <TextInput style={s.composerInput} placeholder="What's happening in Naija?" placeholderTextColor={GRAY2} value={newTake} onChangeText={setNewTake} />
        <TouchableOpacity style={s.postBtn} onPress={() => {
          if (newTake.trim().length < 3) return showToast('Write a bit more');
          setTakes((t) => [{ id: String(Date.now()), name: 'You', handle: 'you', time: 'now', role: 'Member', text: newTake.trim(), likes: 0, reposts: 0, comments: 0 }, ...t]);
          setNewTake(''); showToast('Take posted');
        }}><Text style={{ color: WHITE, fontWeight: '700', fontSize: 13 }}>Post</Text></TouchableOpacity>
      </View>
      {takes.map((t) => (
        <View key={t.id} style={s.card}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={[s.avatarK, { width: 36, height: 36, borderRadius: 18 }]}><Text style={{ color: WHITE, fontWeight: '800', fontSize: 13 }}>{t.name[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700' }}>{t.name} <Text style={{ color: GRAY, fontWeight: '400' }}>@{t.handle}</Text></Text>
              <Text style={{ fontSize: 12, color: GRAY }}>{t.time} - {t.role}</Text>
            </View>
            <TouchableOpacity onPress={() => showToast('Follow')} style={s.followBtn}><Text style={{ fontSize: 12, fontWeight: '700' }}>Follow</Text></TouchableOpacity>
          </View>
          <Text style={{ fontSize: 14, lineHeight: 21, marginTop: 10, color: '#1E293B' }}>{t.text}</Text>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 12 }}>
            <TouchableOpacity onPress={() => { setLiked((l) => ({ ...l, [t.id]: !l[t.id] })); showToast(liked[t.id] ? 'Unliked' : 'Liked'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, color: GRAY }}>{liked[t.id] ? 'Liked' : 'Like'} {t.likes + (liked[t.id] ? 1 : 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showToast('Repost')}><Text style={{ fontSize: 13, color: GRAY }}>Repost {t.reposts}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => showToast('Comment')}><Text style={{ fontSize: 13, color: GRAY }}>Comment {t.comments}</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const Chat = () => {
    const roomMsgs = msgs[chatRoom] || [];
    return (
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 10, gap: 8 }}>
          {ROOMS.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => setChatRoom(r.id)} style={[s.pill, chatRoom === r.id && { backgroundColor: BLACK }]}>
              <Text style={[s.pillText, chatRoom === r.id && { color: WHITE }]}>#{r.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[s.card, { marginTop: 0 }]}>
          <Text style={{ fontSize: 13, fontWeight: '700' }}>#{ROOMS.find((r) => r.id === chatRoom)?.name} - {ROOMS.find((r) => r.id === chatRoom)?.online} online</Text>
        </View>
        <View style={{ paddingHorizontal: 12, gap: 8, paddingBottom: 12 }}>
          {roomMsgs.map((m) => (
            <View key={m.id} style={[s.bubble, m.own ? s.bubbleOwn : s.bubbleOther]}>
              {!m.own && <Text style={{ fontSize: 11, fontWeight: '700', marginBottom: 2 }}>{m.n}</Text>}
              <Text style={{ fontSize: 14, color: m.own ? WHITE : BLACK }}>{m.text}</Text>
            </View>
          ))}
        </View>
        <View style={s.chatInputRow}>
          <TextInput style={s.composerInput} placeholder="Message..." placeholderTextColor={GRAY2} value={chatMsg} onChangeText={setChatMsg} />
          <TouchableOpacity style={s.postBtn} onPress={() => {
            if (!chatMsg.trim()) return;
            setMsgs((prev) => ({ ...prev, [chatRoom]: [...(prev[chatRoom] || []), { id: String(Date.now()), n: 'You', text: chatMsg.trim(), own: true }] }));
            setChatMsg(''); showToast('Sent');
          }}><Text style={{ color: WHITE, fontWeight: '700' }}>Send</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  const Music = () => (
    <View>
      <View style={[s.card, { backgroundColor: BLACK }]}>
        <Text style={{ fontSize: 10, color: GRAY2, fontWeight: '700' }}>ARTIST SPOTLIGHT</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: WHITE, marginTop: 6 }}>Simi Sola - Lagos</Text>
        <Text style={{ fontSize: 12, color: GRAY2, marginTop: 4 }}>12k listeners - Afro-soul</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {['#2563EB', '#059669', '#7C3AED'].map((c) => <View key={c} style={{ flex: 1, height: 64, borderRadius: 12, backgroundColor: c }} />)}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, gap: 10 }}>
        {TRACKS.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => { setNowPlaying(t); showToast(t.title); }} style={{ width: '47%' }}>
            <View style={{ height: 120, borderRadius: 14, backgroundColor: t.color, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 10 }}>
              <View style={s.playCircle}><Text>Play</Text></View>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 6 }}>{t.title}</Text>
            <Text style={{ fontSize: 11, color: GRAY }}>{t.artist}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Cinema = () => (
    <View>
      <View style={[s.card, { backgroundColor: BLACK, height: 180, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: WHITE, fontSize: 24 }}>Play</Text>
        <Text style={{ color: GRAY2, fontSize: 12, marginTop: 8 }}>Watching Now - YouTube embed</Text>
      </View>
      <View style={[s.card, { flexDirection: 'row', gap: 12 }]}>
        <View style={{ width: 90, height: 135, borderRadius: 12, backgroundColor: BLACK, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: WHITE, fontSize: 10 }}>POSTER</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800' }}>Eko for Show</Text>
          <Text style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>2024 - 1h42m - Drama - Lagos</Text>
          <Text style={{ fontSize: 13, color: '#334155', marginTop: 8, lineHeight: 18 }} numberOfLines={3}>A bus conductor inherits a failing cinema house - sell or community screening space.</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={s.btnJoin} onPress={() => showToast('Trailer')}><Text style={s.btnJoinText}>Trailer</Text></TouchableOpacity>
            <TouchableOpacity style={s.followBtn} onPress={() => showToast('Listed')}><Text style={{ fontWeight: '700', fontSize: 12 }}>List</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const ListDesk = ({ title, items }) => (
    <View>
      <Text style={{ fontSize: 18, fontWeight: '800', padding: 16 }}>{title}</Text>
      {items.map((it, i) => (
        <TouchableOpacity key={i} style={s.card} onPress={() => showToast(it.title)}>
          <Text style={{ fontSize: 14, fontWeight: '700' }}>{it.title}</Text>
          <Text style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>{it.sub}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[s.btnPrimary, { margin: 16 }]} onPress={() => showToast('Post ' + title)}>
        <Text style={s.btnPrimaryText}>Post {title.slice(0, -1)}</Text>
      </TouchableOpacity>
    </View>
  );

  const Activity = () => (
    <View style={{ padding: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Activity</Text>
      <Text style={{ fontSize: 12, color: GRAY, marginBottom: 12 }}>Chronological - No algorithm</Text>
      {activity.map((a) => (
        <TouchableOpacity key={a.id} onPress={() => { setActivity((p) => p.map((x) => x.id === a.id ? { ...x, seen: true } : x)); go(a.href); showToast('Opened - ' + a.href); }}
          style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }, !a.seen && { borderColor: BLUE, backgroundColor: BLUE_SOFT }]}>
          <View style={s.emptyIcon}><Text>{a.icon}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700' }}>{a.text} {!a.seen && <Text style={{ color: BLUE }}>.</Text>}</Text>
            <Text style={{ fontSize: 11, color: GRAY }}>{a.ts}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const MySpace = () => (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <View style={[s.avatarK, { width: 64, height: 64, borderRadius: 32 }]}><Text style={{ color: WHITE, fontWeight: '900', fontSize: 22 }}>KA</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800' }}>Kelechi Anene</Text>
          <Text style={{ fontSize: 13, color: GRAY }}>@kelechi - Lagos NG</Text>
          <Text style={{ fontSize: 12, color: BLACK, marginTop: 4 }}>Builder - Writer - City OS</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
        <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '800' }}>412</Text> Following</Text>
        <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '800' }}>2.1k</Text> Followers</Text>
        <Text style={{ fontSize: 13 }}><Text style={{ fontWeight: '800' }}>86</Text> Posts</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <TouchableOpacity style={[s.btnJoin, { flex: 1 }]} onPress={() => showToast('Edit profile')}><Text style={s.btnJoinText}>Edit profile</Text></TouchableOpacity>
        <TouchableOpacity style={[s.followBtn, { flex: 1, alignItems: 'center' }]} onPress={() => showToast('Share')}><Text style={{ fontWeight: '700', fontSize: 13 }}>Share</Text></TouchableOpacity>
      </View>
      {[{ label: 'Jobs', tab: 'jobs' }, { label: 'Events', tab: 'events' }, { label: 'Shop (Market)', tab: 'market' }, { label: 'Staff desk', tab: 'staff' }].map((row) => (
        <TouchableOpacity key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderColor: BORDER }} onPress={() => go(row.tab)}>
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '700' }}>{row.label}</Text>
          <Text style={{ color: GRAY2 }}>></Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const Staff = () => (
    <View style={{ padding: 12 }}>
      <View style={[s.card, { backgroundColor: BLACK }]}>
        <Text style={{ color: WHITE, fontWeight: '700', fontSize: 13 }}>Staff desk - role: super</Text>
        <Text style={{ color: GRAY2, fontSize: 10, marginTop: 4 }}>claimOps - listStaff - sitePulse</Text>
      </View>
      <View style={s.card}>
        <Text style={{ fontWeight: '700', fontSize: 12 }}>SitePulse</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {['Members 3.2k', 'Posts 86', 'Takes 12', 'Ads 2'].map((x) => (
            <Text key={x} style={{ fontSize: 11, color: GRAY, backgroundColor: BG, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>{x}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  const screen = () => {
    switch (tab) {
      case 'home': return <Home />;
      case 'socials': return <Socials />;
      case 'chat': return <Chat />;
      case 'music': return <Music />;
      case 'cinema': return <Cinema />;
      case 'jobs': return <ListDesk title="Jobs" items={[{ title: 'Frontend Engineer - Lagos', sub: 'Paystack - Full-time' }, { title: 'Driver - Yaba', sub: 'Logistics - Contract' }]} />;
      case 'market': return <ListDesk title="Market" items={[{ title: 'Ankara fabric set', sub: 'N18,000 - Fashion' }, { title: 'Used iPhone 12', sub: 'N210,000 - Phones' }]} />;
      case 'rent': return <ListDesk title="Rent" items={[{ title: '2-bed flat - Yaba', sub: 'N1.8M / year' }]} />;
      case 'events': return <ListDesk title="Events" items={[{ title: 'Lagos Founders Meetup', sub: 'Sat 6pm - CMS - Free' }]} />;
      case 'ads': return <ListDesk title="Ads" items={[{ title: 'Telecom promo - Grid', sub: '7 days - Pending' }]} />;
      case 'spaces': return <ListDesk title="Spaces" items={[{ title: 'Yaba Studio', sub: 'Photography - Published' }]} />;
      case 'teams': return <ListDesk title="Teams" items={[{ title: 'Kilode Builders', sub: '12 members - Open' }]} />;
      case 'activity': return <Activity />;
      case 'myspace': return <MySpace />;
      case 'staff': return <Staff />;
      default: return <Home />;
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <Header />
      <ScrollView style={s.main} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>{screen()}</ScrollView>
      {nowPlaying && (
        <View style={s.nowPlaying}>
          <View style={[s.npArt, { backgroundColor: nowPlaying.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: WHITE, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>{nowPlaying.title}</Text>
            <Text style={{ color: GRAY2, fontSize: 10 }}>{nowPlaying.artist} - now playing</Text>
          </View>
          <TouchableOpacity onPress={() => showToast('Pause')}><Text style={{ color: WHITE }}>II</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setNowPlaying(null)} style={{ marginLeft: 12 }}><Text style={{ color: GRAY2 }}>X</Text></TouchableOpacity>
        </View>
      )}
      <View style={s.dock}>
        {[{ id: 'home', label: 'Home', icon: 'H' }, { id: 'socials', label: 'Socials', icon: 'S' }, { id: 'create', label: '', icon: '+' }, { id: 'activity', label: 'Activity', icon: 'A' }, { id: 'myspace', label: 'My Space', icon: 'M' }].map((item) => {
          if (item.id === 'create') return (
            <TouchableOpacity key="create" onPress={() => setCreateOpen(true)} style={s.plusBtn} activeOpacity={0.85}>
              <Text style={{ color: WHITE, fontSize: 28, lineHeight: 30, fontWeight: '300' }}>+</Text>
            </TouchableOpacity>
          );
          const active = tab === item.id;
          return (
            <TouchableOpacity key={item.id} onPress={() => go(item.id)} style={s.dockBtn}>
              <Text style={[s.dockIcon, active && { color: BLUE }]}>{item.icon}</Text>
              <Text style={[s.dockLabel, active && { color: BLUE, fontWeight: '700' }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={s.overlay} onPress={() => setCreateOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800' }}>Create on Kilode</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setCreateOpen(false)}><Text>X</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CREATE.map((o) => (
                <TouchableOpacity key={o.label} style={s.createOpt} onPress={() => { go(o.tab); showToast(o.label); }}>
                  <Text style={{ fontSize: 16, fontWeight: '800' }}>{o.icon}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 6 }}>{o.label}</Text>
                  <Text style={{ fontSize: 10, color: GRAY }}>{o.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={desksOpen} transparent animationType="slide" onRequestClose={() => setDesksOpen(false)}>
        <Pressable style={s.overlay} onPress={() => setDesksOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '800' }}>All desks</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setDesksOpen(false)}><Text>X</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {DESKS.map((d) => (
                <TouchableOpacity key={d.id} style={s.createOpt} onPress={() => go(d.id)}>
                  <Text style={{ fontSize: 16, fontWeight: '800' }}>{d.icon}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 4 }}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {!!toast && <View style={s.toast}><Text style={{ color: WHITE, fontSize: 12, fontWeight: '700' }}>{toast}</Text></View>}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { height: 56, backgroundColor: WHITE, borderBottomWidth: 1, borderColor: BORDER, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 20, fontWeight: '800', color: BLUE },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: GREEN_BG, borderWidth: 1, borderColor: GREEN_BORDER, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN_TEXT },
  liveText: { fontSize: 10, fontWeight: '700', color: GREEN_TEXT },
  searchPill: { backgroundColor: BG, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 150 },
  avatarK: { width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  main: { flex: 1, backgroundColor: BG },
  card: { backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16, marginHorizontal: 12, marginTop: 10 },
  pill: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillText: { fontSize: 13, fontWeight: '600', color: BLACK },
  emptyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  btnPrimary: { backgroundColor: BLUE, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  btnPrimaryText: { color: WHITE, fontWeight: '700', fontSize: 13 },
  btnJoin: { backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  btnJoined: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  btnJoinText: { color: WHITE, fontWeight: '700', fontSize: 12 },
  roomAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: BLACK, justifyContent: 'center', alignItems: 'center' },
  featBadge: { alignSelf: 'flex-start', backgroundColor: BLUE_SOFT, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  featBadgeText: { fontSize: 10, fontWeight: '700', color: BLUE },
  playCircle: { width: 36, height: 28, borderRadius: 14, backgroundColor: WHITE, justifyContent: 'center', alignItems: 'center' },
  deskCard: { width: 72, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 12, alignItems: 'center' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: WHITE, borderBottomWidth: 1, borderColor: BORDER },
  composerInput: { flex: 1, backgroundColor: BG, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  postBtn: { backgroundColor: BLUE, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  followBtn: { borderWidth: 1, borderColor: BORDER, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: WHITE },
  bubble: { borderRadius: 12, padding: 10, maxWidth: '80%' },
  bubbleOwn: { backgroundColor: BLUE, alignSelf: 'flex-end' },
  bubbleOther: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, alignSelf: 'flex-start' },
  chatInputRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: WHITE, borderTopWidth: 1, borderColor: BORDER },
  dock: { height: 72, backgroundColor: WHITE, borderTopWidth: 1, borderColor: BORDER, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 8 },
  dockBtn: { alignItems: 'center', minWidth: 56, gap: 2 },
  dockIcon: { fontSize: 16, color: GRAY2, fontWeight: '700' },
  dockLabel: { fontSize: 10, color: GRAY2 },
  plusBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', marginTop: -16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  nowPlaying: { position: 'absolute', bottom: 80, left: 12, right: 12, backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 25 },
  npArt: { width: 32, height: 32, borderRadius: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '85%' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  createOpt: { width: '30%', backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 12, alignItems: 'center' },
  toast: { position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, zIndex: 60 },
});
