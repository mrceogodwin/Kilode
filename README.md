# Kilode — React Native (iOS)

Production native app for Kilode (Nigerian community OS).

**This repo is React Native / Expo only.**  
Web HTML and `vercel.json` have been removed.

Real backend + data live on **Kilode Nine** (Neon Postgres + Supabase).

## Run on iPhone / Simulator

```bash
git clone https://github.com/mrceogodwin/Kilode.git
cd Kilode
npm install
npx expo start --ios
```

Or scan the QR code with **Expo Go** on your iPhone.

## What’s in this build

- Dark (default) + Light themes — toggle from header or My Space
- No website logo — LIVE pill only
- Stable bottom dock — Home · Socials · **+** · Activity · My Space
- More (+) opens all desks + Create sheet
- Home: rooms, music drops, desks
- Socials: composer + post cards with reactions
- Activity: chronological, no algorithm
- My Space: profile shell

## Files

| File | Role |
|------|------|
| `App.tsx` | Screens + navigation shell |
| `themeStyles.ts` | Dark/light palettes + styles |
| `data.ts` | Mock desks, takes, rooms, tracks |
| `app.json` | Expo iOS `ng.kilode.app` |

## Next (production)

Wire screens to Kilode Nine APIs: posts, rooms, chat, music, auth.
