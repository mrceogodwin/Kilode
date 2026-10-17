/**
 * Kilode Premium — React Native Expo (iOS first)
 * Blue #1877F2 · white cards · bg #F6F8FB
 * See docs/SHIP_STATUS.md — full App is being staged.
 * Run: npm i && npx expo start
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  SafeAreaView, StatusBar, Modal, Pressable,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const BLUE = '#1877F2';
const BG = '#F6F8FB';
const WHITE = '#FFFFFF';
const BORDER = '#E7ECF2';
const BLACK = '#111827';
const GRAY = '#64748B';
const GRAY2 = '#94A3B8';
const GREEN_BG = '#ECFDF3';
const GREEN_BORDER = '#ABEFC6';
const GREEN_TEXT = '#067647';
const BLUE_SOFT = '#EFF6FF';

export default function App() {
  const [tab, setTab] = useState('home');
  const [toast, setToast] = useState('');
  const showToast = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 2000); }, []);
  const go = (id) => setTab(id);

  return (
    <SafeAreaView style={s.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.logo}>kilode</Text>
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.searchPill}><Text style={{ color: GRAY, fontSize: 13 }}>Search Kilode</Text></View>
          <TouchableOpacity onPress={() => go('activity')}><Text>Bell</Text></TouchableOpacity>
          <TouchableOpacity style={s.avatarK} onPress={() => go('myspace')}>
            <Text style={{ color: WHITE, fontWeight: '800' }}>K</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.main} contentContainerStyle={{ paddingBottom: 100 }}>
        {tab === 'home' && (
          <View>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: BLACK }}>Good morning, Lagos</Text>
              <Text style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Catch up on rooms, stories, and drops.</Text>
            </View>
            <View style={s.card}>
              <Text style={{ fontSize: 15, fontWeight: '700', textAlign: 'center' }}>No posts yet</Text>
              <Text style={{ fontSize: 12, color: GRAY, textAlign: 'center', marginTop: 6 }}>Be first — share a take for Nigeria.</Text>
              <TouchableOpacity style={[s.btnPrimary, { marginTop: 14, alignSelf: 'center' }]} onPress={() => showToast('Create')}>
                <Text style={s.btnPrimaryText}>Create post</Text>
              </TouchableOpacity>
            </View>
            <View style={s.card}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: BLUE }}>FEATURED · BUSINESS</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', marginTop: 8 }}>How Kilode is rebuilding discovery for Nigerian creators without an algorithm</Text>
              <Text style={{ fontSize: 13, color: GRAY, marginTop: 8 }}>Rooms, editorial curation, chronological feeds.</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', paddingHorizontal: 16, marginTop: 8 }}>Desks</Text>
            <ScrollView horizontal contentContainerStyle={{ padding: 12, gap: 10 }}>
              {['Jobs','Market','Events','Cinema','Music','Chat','Ads','Spaces'].map((d) => (
                <TouchableOpacity key={d} style={s.deskCard} onPress={() => { go(d.toLowerCase()); showToast(d); }}>
                  <Text style={{ fontWeight: '700', fontSize: 12 }}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {tab !== 'home' && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{tab}</Text>
            <Text style={{ color: GRAY, marginTop: 8 }}>Screen active — full UI in next push (local App.tsx has complete desks).</Text>
            <TouchableOpacity style={[s.btnPrimary, { marginTop: 16 }]} onPress={() => go('home')}>
              <Text style={s.btnPrimaryText}>Back home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={s.dock}>
        {[
          { id: 'home', label: 'Home', icon: 'H' },
          { id: 'socials', label: 'Socials', icon: 'S' },
          { id: 'create', label: '+', icon: '+' },
          { id: 'activity', label: 'Activity', icon: 'A' },
          { id: 'myspace', label: 'My Space', icon: 'M' },
        ].map((item) => {
          if (item.id === 'create') {
            return (
              <TouchableOpacity key="create" onPress={() => showToast('Create sheet')} style={s.plusBtn}>
                <Text style={{ color: WHITE, fontSize: 28 }}>+</Text>
              </TouchableOpacity>
            );
          }
          const active = tab === item.id;
          return (
            <TouchableOpacity key={item.id} onPress={() => go(item.id)} style={s.dockBtn}>
              <Text style={[s.dockIcon, active && { color: BLUE }]}>{item.icon}</Text>
              <Text style={[s.dockLabel, active && { color: BLUE, fontWeight: '700' }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!!toast && (
        <View style={s.toast}><Text style={{ color: WHITE, fontSize: 12, fontWeight: '700' }}>{toast}</Text></View>
      )}
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
  searchPill: { backgroundColor: BG, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  avatarK: { width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  main: { flex: 1, backgroundColor: BG },
  card: { backgroundColor: WHITE, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16, marginHorizontal: 12, marginTop: 10 },
  btnPrimary: { backgroundColor: BLUE, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  btnPrimaryText: { color: WHITE, fontWeight: '700', fontSize: 13 },
  deskCard: { width: 72, backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER, borderRadius: 16, padding: 12, alignItems: 'center' },
  dock: { height: 72, backgroundColor: WHITE, borderTopWidth: 1, borderColor: BORDER, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 8 },
  dockBtn: { alignItems: 'center', minWidth: 56 },
  dockIcon: { fontSize: 16, color: GRAY2 },
  dockLabel: { fontSize: 10, color: GRAY2 },
  plusBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', marginTop: -16 },
  toast: { position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: BLACK, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, zIndex: 60 },
});
