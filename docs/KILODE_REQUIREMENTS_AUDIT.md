# Kilode Requirements Audit

**Repository:** `mrceogodwin/Kilode`  
**Primary product:** Expo React Native (iOS first)  
**Working branch inspected:** `preview/web`  
**Audit date:** 2026-10-20  
**Latest commit visible in repository history:** `721d38ea0f733e6b95dd0532d00f9a79c9e2e805` — `refine socials into a cleaner, media-first native feed`

This document records verified source-code findings, not assumptions about what works on a device. Update it after each milestone.

---

## 1. Source of truth

| Item | Verified value / status |
|---|---|
| Native repository | `mrceogodwin/Kilode` |
| Branch inspected | `preview/web` |
| App entry | `App.tsx` renders `KilodeRoot` from `KilodeRoot.tsx` |
| App stack | Expo / React Native; `package.json` has Expo ~51 and RN 0.74.5 |
| Web preview | Vercel export of this code is not proof of a successful native iOS build |
| Current source baseline | `721d38ea0f733e6b95dd0532d00f9a79c9e2e805` |

Do not connect the native app to an unverified legacy host or claim backend readiness without a current health check and successful end-to-end test.

## 2. Product systems map

| System | Current evidence / status |
|---|---|
| Home | `screens/Home.tsx`; discovery rails exist, but Home content is limited to Media, Music and one Socials post |
| Media | Dedicated screen and article selection route exist |
| Socials | Dedicated feed, post detail and profile navigation have recent commits; some actions still use local client state |
| Music | Dedicated screen plus track and artist detail routes exist |
| Events | Dedicated screen route exists; live data and full actions need verification |
| Market | Dedicated screen route exists; checkout is not verified |
| Jobs | Dedicated screen route exists; apply/post workflows need verification |
| Communities | Dedicated screen route exists; membership flows need verification |
| Cinema | Dedicated screen route exists; submissions/streaming rights not verified |
| Creators | Dedicated screen route exists; creator tools need verification |
| Ads & Business | Home rail can route to a system ID; a complete dedicated business dashboard was not verified |
| My Space | Inline screen in `KilodeRoot.tsx`; shows account kind and kind-specific tool descriptors, but is not yet a proven distinct full dashboard per kind |
| Push Link | No working end-to-end implementation verified in this pass |
| Super Admin | No secure, working Super Admin flow verified in this pass |

The app uses a custom tab/state model in `KilodeRoot.tsx`, rather than React Navigation. Device-level back/gesture behavior still needs testing.

## 3. Home screen findings (source inspected)

### Confirmed issues
1. **Search is disconnected.** In `screens/Home.tsx`, submitting a non-empty query displays “Search is not connected yet.” It does not navigate to or execute search.
2. **Home discovery is incomplete.** The visible feed sections are Media, Music and Socials. Other systems appear as a horizontal rail, not as discovery content in the feed.
3. **Socials preview is capped at one post.** Home renders `takes[0]` only, despite the Socials system having its own feed.
4. **The hero carousel can contain only two cards**: the first Media story and first Music track. It is not a cross-system discovery carousel.
5. **The Home rail contains all major system destinations**, and the callbacks route to dedicated tabs or system IDs. This is useful navigation, but does not by itself satisfy the hybrid discovery-feed requirement.
6. **No fake event/people recommendations should be reintroduced.** Use real API data or an honest empty state.

### Next Home implementation requirements
- Preserve the existing charcoal-and-gold theme and compact native layout.
- Add cross-system discovery only where real data contracts exist; never fabricate events, users, posts, jobs or listings.
- Make search a real, clearly scoped search flow, or keep it explicitly disabled with an accessible reason until a backend route exists.
- Keep cards compact; avoid a stack of large boxed widgets and oversized headings.
- Provide loading, empty, error and refresh states for each data-backed section.
- Test every Home tap target and verify it opens the intended system/detail screen.

## 4. Account types and dashboards

The existing audit/source identifies these account kinds: `member`, `artist`, `writer`, `advertiser`, `cinema`, `job_poster`, `job_seeker`, `vendor`, `renter`, and `brand`. Re-verify against the current account-kind source before changing the list.

Registration has an account-type step according to the existing source audit. My Space uses account-kind labels/tool descriptors, but distinct full dashboard architectures and post-registration onboarding remain unverified/incomplete.

**Security requirement:** Client capability gates are UI behavior only. Permissions must be validated by the backend for every protected action. Never allow public self-promotion to admin.

## 5. Interaction/navigation findings

- `App.tsx` directly renders `KilodeRoot`.
- `KilodeRoot.tsx` holds tab state and selected-detail state for articles, posts, profiles, tracks, artists and desk items.
- Compose posting checks for a token and reports whether the response came from live or preview; this distinction must remain honest.
- My Space “Edit” currently shows a message that the profile editor opens next; it is not a working editor.
- “Saved” currently shows a message that sync is not live; it is not a working saved-items screen.
- Some likes/follows are managed in local React state; persistence across devices/users is not verified.
- Notification UI has a local sample fallback when the activity list is empty. Do not present sample notifications as real user activity in production.
- Report/block flows require verification that reports reach a protected backend moderation queue and blocks persist server-side. A local toast alone is not proof of moderation.
- Screen transitions, iOS swipe-back, Android hardware back, keyboard/safe-area behavior, and every visible button have not been device-tested in this audit.

## 6. Backend and release readiness

This source inspection did not perform a new live backend health probe or a native build. Therefore the following remain **unverified in this pass**:
- Live auth and durable sessions
- Live feed/post/comment/like/follow persistence
- Real search across supported systems
- Real Market checkout or job application
- Report/block moderation persistence
- Account deletion with server-side data removal
- Server-enforced role/capability checks and admin audit logs
- EAS project linking, iOS build, TestFlight, and on-device QA

Never mark these as complete based only on a web deployment marked READY.

## 7. Visual requirements (preserve)

- Background `#0D0D10`; cards `#18181C`; border `#2A2A30`
- Gold `#D4AF37` / `#E5C158`; text `#F5F5F5`; muted text `#9A9A9E`
- Premium, compact, iOS-native interaction; preserve Kilode identity.
- No blue-and-white rebrand, pitch-black empty layouts, generic SaaS look, excessive text, or oversized boxed Home sections.

## 8. Prioritised work queue

1. Home: real cross-system discovery contracts, compact layout, working/disabled search decision, empty/error/loading states.
2. Navigation audit: list every interactive element and confirm route/action, permission, backend call, and back behavior.
3. Account architecture: validate supported account kinds; implement genuinely distinct dashboards/onboarding based on verified capabilities.
4. Backend verification: health probe, auth, real data, durable writes, authorization and moderation.
5. Super Admin: locate any existing secure implementation; if absent, design server-enforced roles, protected entry, moderation queue and audit logs before exposing UI.
6. App Store readiness: account deletion, privacy, UGC report/block/moderation, payment classification, media rights, icon/splash/versioning.
7. Native verification: link EAS project, run typecheck/tests/build and test on a real iPhone. Keep Vercel preview as a secondary visual check.

## 9. Change log

| Date | Source | Note |
|---|---|---|
| 2026-10-20 | Source review at `721d38ea` | Added specific Home, interaction and verification findings; no code behavior changed by this audit document |
