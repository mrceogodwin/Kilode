# Kilode — React Native (iOS)

**This is the native Expo / React Native app.**  
`kilodenew.vercel.app` is the **web** shell — different codebase surface. Do not judge the mobile app from Safari.

## Run on iPhone / Simulator

```bash
npm install
npx expo start --ios
```

Or scan the QR with Expo Go.

## What’s in this build

- **Dark (default) + Light** themes — toggle from header ☀/☾ or My Space
- **No website logo** — LIVE pill only in header
- **Stable bottom dock** — Home · Socials · **+ More** · Activity · My Space (no floating offset)
- **More (+)** → all Kilode desks + Create
- Screens: Home (rooms, music, desks), Socials feed, Activity, My Space, desk stubs
- Premium cards, type, sheets (reference-inspired dark social UI)

## Files

| File | Role |
|------|------|
| `App.tsx` | Screens + navigation shell |
| `themeStyles.ts` | Dark/light palettes + StyleSheet factory |
| `data.ts` | Desks, takes, rooms, tracks |
| `app.json` | Expo iOS bundle `ng.kilode.app` |

## Not this repo

- Web product: [Kilode-v2](https://github.com/mrceogodwin/Kilode-v2) → vercel
- Web UI you recorded: **Safari → kilodenew.vercel.app** (not RN)
