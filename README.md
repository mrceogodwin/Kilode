# Kilode Native (Expo)

**Expo account:** [mudino](https://expo.dev/accounts/mudino)  
**Repo:** `mrceogodwin/Kilode`  
**Stack:** Expo SDK 51 · React Native 0.74  
**iOS / Android ID:** `ng.kilode.app`

Build with **Expo EAS**. Website is **Kilode-v2** on Vercel — separate.

## Dev

```bash
npm install
npx expo start --tunnel
```

## EAS (you must be logged in as mudino)

See [docs/EAS_SETUP_MUDINO.md](docs/EAS_SETUP_MUDINO.md).

```bash
eas login && eas whoami   # mudino
eas init                 # once, if not linked
eas build --platform ios --profile production
eas build --platform android --profile production
```
