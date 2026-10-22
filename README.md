# Kilode Native (Expo)

**Expo account:** [mudino](https://expo.dev/accounts/mudino)  
**Repository:** `mrceogodwin/Kilode`  
**Stack:** Expo SDK 51 · React Native 0.74  
**iOS / Android ID:** `ng.kilode.app`

This repository is the native Kilode app. The Vercel preview is a web rendering of the app source from the `preview/web` branch; it is not a separate product or backend.

The dedicated Kilode API is not configured yet. Do not point the app at an unrelated legacy web app. Keep `EXPO_PUBLIC_API_URL` unset until the dedicated API is deployed and its authentication endpoints are verified.

## Development

```bash
npm install
npx expo start --tunnel
```

## EAS builds

Use the [EAS setup guide](docs/EAS_SETUP_MUDINO.md). Authenticate as the `mudino` Expo account and confirm the existing Kilode EAS project is linked before building.

```bash
npx eas-cli project:info
npx eas-cli build --platform ios --profile preview
```
