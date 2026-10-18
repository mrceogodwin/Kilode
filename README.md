# Kilode — Production React Native (Expo) iOS

This repository is a **real native iOS app** built with **Expo SDK 51 + React Native 0.74**.
It is **not** a website and **not** the HTML preview used in chat.

## Stack

- TypeScript
- Expo managed workflow
- React Native `SafeAreaView`, native `Modal`, `RefreshControl`, `AsyncStorage`
- Bundle ID: `ng.kilode.app`

## Run on a real iPhone

```bash
npm install
npx expo start --tunnel
```

Open **Expo Go** → scan QR. That is native JS running on iOS, not Safari.

## Production build (TestFlight / App Store)

```bash
npm i -g eas-cli
eas login
eas build --platform ios --profile production
```

Configure Apple credentials in `eas.json` before submit.

## Backend (Kilode Nine)

Production web: https://kilode-nine.vercel.app

Today those routes answer **HTML only** (`406 Only HTML requests are supported` for `Accept: application/json`).
Until Nine ships public JSON for mobile, the native client uses **local seed data as fallback** so the app is usable offline and in TestFlight.

The product goal is **live Nine data** — not mock-as-product. Wire path: `lib/api.ts` → `EXPO_PUBLIC_API_URL`.

## Structure

```
App.tsx              # Root + tabs + sheets
screens/Auth.tsx     # Sign in / Create / Google stub
screens/Chat.tsx     # Threads + send
screens/Cinema.tsx   # Films + vote
lib/api.ts           # Production fetch + fallback
lib/auth.tsx         # Session + AsyncStorage
lib/config.ts        # API base URL
data.ts              # Seed / offline
themeStyles.ts       # Dark-first design system
```

## Status

Native shell is production-oriented. Full feature parity with Kilode v2 / Nine (wallets, ads, realtime chat, media upload, OAuth) continues on this same RN codebase.
