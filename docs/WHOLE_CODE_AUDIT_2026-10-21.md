# Kilode Native Code Audit — 2026-10-21

Scope: Expo React Native app in `mrceogodwin/Kilode`, working branch `music-compact-create-sheet`. The native iOS app is the product source of truth; the Vercel HTML page is only a secondary visual mirror. This audit distinguishes source inspection from checks actually run.

## Current automated checks

- Latest completed native validation before this audit: TypeScript, Expo Doctor, and iOS JavaScript bundle export passed on commit `0d26214b`.
- Vercel static mirror deployment for that commit is READY. It only copies `docs/kilode-ios-preview.html` to static output; it does not render or build the React Native app.
- Physical-iPhone EAS preview is **not verified**. The last device build reached EAS but failed because no suitable iOS signing credentials were available for internal distribution.
- No real-device end-to-end test or App Store submission/approval has been verified.

## Findings — ordered by risk

### P0 — Must resolve before calling the app production-ready

1. **Dedicated backend is not configured.** `lib/config.ts` leaves `API_BASE` empty unless `EXPO_PUBLIC_API_URL` is explicitly supplied. Auth and API-backed systems consequently fail closed; seed data is not live content. Do not route the native client to Kilode-v2 or Kilode-nine as a shortcut.
2. **Physical-device build is blocked by signing credentials.** `.github/workflows/eas-ios-preview.yml` correctly checks the project ID, but the last EAS run failed at credential setup: no credentials suitable for internal distribution. This needs valid Apple/EAS signing setup, not a TypeScript change.
3. **App Store artwork is incomplete.** The `assets/` directory contains only `.gitkeep`; there is no committed app icon, splash artwork, cinematic welcome video montage, or supplied metallic Kilode logo asset. Current welcome artwork uses a remote Unsplash image and a text wordmark, so it can be missing/offline and does not meet the requested branded opening.
4. **Server-side account lifecycle and safety are incomplete.** Settings currently presents account deletion UI, but this is not proof of backend account deletion. `lib/moderation.ts` explicitly stores reports/blocks locally; staff intake and cross-device enforcement are absent.
5. **Privacy, payments, and store-review requirements remain open.** Confirm working public privacy/terms URLs, data disclosures, reviewer access, applicable digital-goods payment flow, and final SDK/privacy-manifest requirements before release.

### P1 — Correctness, consistency, and reliability

6. **Launch screen differs by branch.** The working branch has the welcome-first gate in `KilodeRoot.tsx` and the welcome experience in `screens/Auth.tsx`; `main` was inspected and still has the older sign-in screen. A build launched from the wrong ref can therefore show the wrong first screen. Keep validation and preview builds pinned to the intended native branch until changes are integrated deliberately.
7. **Welcome screen still does not match the approved design.** It is a single remote photo with four floating feature labels and text `Kilode!`, not the requested ten-scene cinematic opening or metallic entangled logo. The correct brand asset/video files must be committed and then integrated.
8. **Dependency reproducibility needs improvement.** `package.json` had no direct declaration for `@expo/vector-icons` although `screens/Music.tsx` imports it. Added the direct dependency in this audit; validation must complete. No lockfile is present in the branch tree, so installs are not fully pinned.
9. **The Vercel preview is not a native-app preview.** It serves the standalone `docs/kilode-ios-preview.html`. It can help inspect a visual mirror, but cannot prove the iOS welcome flow, navigation, safe areas, native audio, or interactions.
10. **Documentation is stale/inconsistent.** `docs/FEATURE_STATUS.md` labels itself an audit of `main` and does not reflect the current working branch's newer music playback, compact drawer, and welcome-flow work. Update it after the code audit and tests.

### P2 — Feature completeness / human QA

11. **Multiple platform systems remain UI-only or partial** per the repository's feature/status notes: media/article reading, events, market, jobs, communities, cinema, creators, chat, notifications, search, ads/business, Push Link, and payments need end-to-end contracts and backend tests before they can be represented as live.
12. **Music needs a full device/backend pass.** Playback code exists, but live track catalogue/playback depends on the dedicated API. Test interruptions, background/foreground, failed streams, upload persistence, chart freshness/ranking, and artist ownership on a real iPhone.
13. **Manual accessibility and layout testing remains outstanding.** Verify dynamic type, VoiceOver labels/focus, safe areas, keyboard overlap, small-screen signup, account-type selection, drawer/creation-sheet hit targets, offline states, and relaunch/session behavior on supported iOS versions.

## One-by-one remediation order

1. Preserve the intended native branch and complete validation after each change.
2. Integrate the real Kilode logo and bundled cinematic welcome assets; confirm the welcome gate on a cold launch.
3. Fix EAS signing and produce an installable physical-iPhone build.
4. Run a module-by-module code review and add/extend tests around auth, API response validation, music lifecycle, and local persistence.
5. Provision and verify the dedicated backend; do not mark seed data as live.
6. Implement server-side deletion, recovery, moderation, and required payments/privacy work.
7. Refresh feature-status documentation, then run the recorded human QA checklist and TestFlight review.

## Changes made during this audit

- Added `@expo/vector-icons` as a direct dependency because the native Music screen imports it. The first CI run then exposed its missing peer dependency `expo-font`; added SDK-compatible `expo-font` (`~12.0.10`) and verified TypeScript, Expo Doctor, and iOS bundle export all passed on commit `52ad7e17`.
- Previous Vercel config change is kept as a secondary static mirror only; it is not counted as an iOS fix.

## Definition of done

A row is complete only when the implementation exists, automated checks pass, the relevant native flow is exercised, and backend/device-dependent behavior is verified where applicable. A green TypeScript/bundle-export workflow alone is not an installable iPhone build or proof of production readiness.
