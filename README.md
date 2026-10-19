# Kilode Native (Expo)

**Repository:** `mrceogodwin/Kilode`  
**Stack:** Expo SDK 51 · React Native 0.74 · TypeScript  
**iOS bundle ID:** `ng.kilode.app`  
**Android application ID:** `ng.kilode.app`

This is the **mobile app only**. Build and distribute with **Expo EAS**, not Vercel.

| Product | Repo | Deploy |
|---------|------|--------|
| Website + API | `mrceogodwin/Kilode-v2` | Vercel |
| Native iOS / Android | `mrceogodwin/Kilode` (this repo) | Expo EAS |

Do **not** connect this repository to Vercel as the Kilode website. That misconfiguration deploys the RN shell instead of Kilode-v2.

## Run (development)

```bash
npm install
cp .env.example .env   # optional
npx expo start --tunnel
```

Open with **Expo Go** on a device.

## Production / TestFlight (EAS)

```bash
npm i -g eas-cli
eas login
eas build:configure   # once — writes EAS projectId into app.json
eas build --platform ios --profile production
eas build --platform android --profile production
```

Apple credentials are configured via `eas credentials` / App Store Connect — not committed.

## Backend

Client calls Kilode-v2 mobile bridge:

- `GET /api/mobile/health`
- `GET /api/mobile/takes`
- `POST /api/mobile/takes` (authenticated)
- `GET /api/mobile/tracks`

Base URL: `EXPO_PUBLIC_API_URL` (default `https://kilode-nine.vercel.app`).

If the bridge is not deployed on that host, the app reports **error** (not fake “live”). Seed data may still render for layout only.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run eas:build:ios` | EAS iOS production |
| `npm run eas:build:android` | EAS Android production |
