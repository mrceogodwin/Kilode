# Kilode Native (Expo)

**Repository:** `mrceogodwin/Kilode`  
**Expo account (intended):** [mudino](https://expo.dev/accounts/mudino)  
**Stack:** Expo SDK 51 · React Native 0.74 · TypeScript  
**iOS bundle ID:** `ng.kilode.app`  
**Android application ID:** `ng.kilode.app`

This is the **mobile app only**. Build with **Expo EAS**. Do not deploy this repo on Vercel as the website.

| Product | Repo | Deploy |
|---------|------|--------|
| Website + API | `mrceogodwin/Kilode-v2` | Vercel |
| Native iOS / Android | `mrceogodwin/Kilode` | Expo EAS (`mudino`) |

## Develop

```bash
npm install
npx expo start --tunnel
```

## EAS build (your machine — requires Expo login as mudino)

Full steps: [docs/EAS_SETUP_MUDINO.md](docs/EAS_SETUP_MUDINO.md)

```bash
npm i -g eas-cli
eas login
eas whoami          # must show: mudino
eas init            # once — link or create project under mudino
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Backend

`EXPO_PUBLIC_API_URL` → Kilode-v2 host (default `https://kilode-nine.vercel.app`)

Mobile routes: `/api/mobile/health`, `/api/mobile/takes`, `/api/mobile/tracks`
