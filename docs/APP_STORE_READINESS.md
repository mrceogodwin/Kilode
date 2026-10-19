# Kilode — App Store / Play readiness assessment

**Repo:** `mrceogodwin/Kilode` (Expo RN)  
**Identity:** Dark-first, green accent `#22C55E` — do not replace with blue/white.

## A. Already implemented (code present)

| Item | Evidence |
|------|----------|
| Expo RN iOS/Android | `package.json`, `app.json` bundle `ng.kilode.app` |
| EAS profiles | `eas.json` development / preview / production |
| Session auth (local + optional API) | `lib/auth.tsx` AsyncStorage |
| Guest + sign-in / sign-up UI | `screens/Auth.tsx` |
| Report + block (local) | `lib/moderation.ts` |
| Account deletion **UI** + local wipe | `screens/Settings.tsx` |
| Community guidelines + support mailto | `screens/Settings.tsx` |
| API client with live/error/mock distinction | `lib/api.ts` |
| Tab nav + Create sheet | `KilodeTabBar`, `KilodeRoot` |
| Camera/photo usage strings | `app.json` infoPlist |

## B. Missing before submission

| Item | Notes |
|------|-------|
| Live privacy policy + terms URLs | Placeholders `kilode.ng/privacy` |
| Server-side account deletion API | Local-only today |
| Password recovery | Not implemented |
| Server report queue / moderation tooling | Local reports only |
| App icon + splash assets | `assets/` empty |
| App Privacy nutrition labels | Need data inventory |
| StoreKit / IAP classification | Push Link, ads, digital goods |
| Production privacy manifest | iOS 17+ |
| Demo account for App Review | |

## C. Requires backend

- Real Socials/Music/Media APIs (mobile bridge on Kilode-v2 not live → 406)
- Cloud account delete
- Report intake + admin review
- Payments / Push Link metrics

## D. Requires your Apple / decisions

- Apple Developer Program ($99/yr)
- App Store Connect app record
- Expo `eas login` as **mudino** + `eas init` projectId
- Privacy policy hosting
- Payment product classification (IAP vs external)

## E. App Review risks (honest)

1. **UGC without server moderation** — local report/block is a start; Apple may ask for server-side handling.
2. **Incomplete features advertised as full product** — hide unfinished systems from store screenshots.
3. **Payments** — do not ship Paystack for digital IAP-like features without StoreKit review.
4. **Permissions** — camera/photos declared; request only at feature use (not on launch).
5. **Minimum viable** — ship a coherent subset (Home + Socials + My Space + Settings) rather than empty desks.

*This document is an assessment, not a guarantee of approval.*
