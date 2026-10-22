# Kilode feature status (native repository inspection)

This is a code-inspection audit, not a claim of complete production readiness. Automated bundle checks are not the same as testing on a physical iPhone or verifying live backend/payment workflows.

Status legend:
- **VERIFIED IN CODE** — source behavior or invariant checked; not physical-device E2E
- **PARTIALLY IMPLEMENTED** — UI plus partial/local logic
- **UI ONLY / SEED** — interface exists, but uses seed data or lacks a connected backend
- **NOT IMPLEMENTED** — no complete feature found in the native source
- **BLOCKED / UNVERIFIED** — requires backend credentials, external setup, or device/build verification

| System / capability | Current assessment | Notes |
|---|---|---|
| Home hybrid discovery | PARTIALLY IMPLEMENTED | Native feed combines carousel, chips, discovery cards, news, rooms and posts; seed fallback remains |
| Media / news | UI ONLY / SEED | News cards exist; a complete live article-reader/publishing backend is not verified |
| Socials | PARTIALLY IMPLEMENTED | Composer, post actions and comments UI exist; likes/follows/join states include local behavior; live persistence is not verified |
| Creators | SOCIALS SECTION | Creator discovery belongs inside Socials; not a separate top-level system or account kind |
| Communities | SOCIALS SECTION | Community discovery belongs inside Socials; joining/persistence is not verified live |
| Music | PARTIALLY IMPLEMENTED | Discover / Charts / Artists / Library / Genres; queue player (next/prev); saved + recent via AsyncStorage; seed tracks include sample audio for offline playback. Live catalogue/streaming API not connected |
| Artist release drafts | PARTIALLY IMPLEMENTED | Local-only drafts with releaseType (single / ep / album), title, artist, genre, notes, rights ack; My Space + Create → Track for musicReleaseManagement. No multi-track files, no server upload, no credits, no publish |
| Artist upload monetisation | DOCUMENTED, NOT IMPLEMENTED | Hybrid credit/subscription design in `docs/ARTIST_UPLOADS_MONETISATION.md` — no live prices, checkout, or earnings |
| Push Link | NOT IMPLEMENTED | Paid promotion lifecycle, checkout, review, activation and reporting are not connected |
| Events | UI ONLY / SEED | Desk exists; live event creation/RSVP persistence is not verified |
| Market | UI ONLY / SEED | Desk exists; live listings, orders, payments and dispute workflows are not verified |
| Jobs | UI ONLY / SEED | Desk exists; live posting, applications and recruitment workflows are not verified |
| Ads / business | NOT IMPLEMENTED / INCOMPLETE | Desk entry exists in seed navigation; actual campaign backend, billing, review and reporting are not verified |
| Cinema | UI ONLY / SEED | Screen exists; live content hosting, rights and payment workflows are not verified |
| My Space | PARTIALLY IMPLEMENTED | Profile, settings, wallet placeholder and account-aware workspace shortcuts exist; wallet is not a live balance |
| Ten public account kinds | VERIFIED IN CODE | Stable IDs and typed capability map exist; shortcut relevance is not authorization |
| Account-specific server permissions | NOT VERIFIED | Must be enforced by the dedicated backend, not just native UI |
| Upgrade / paid entitlements | NOT IMPLEMENTED | Exact plans, prices, quotas, checkout and entitlement enforcement are not connected |
| Authentication | PARTIALLY IMPLEMENTED | Guest mode works locally; real sign-in/sign-up requires a dedicated API and valid server-issued session |
| Password reset / Google sign-in | NOT IMPLEMENTED / STUB | No complete verified production flow |
| Report / block | PARTIALLY IMPLEMENTED | Local moderation helpers; backend enforcement is not verified |
| Account deletion | PARTIALLY IMPLEMENTED | Local session clear exists; server-side deletion and retention workflow are not verified |
| Notifications | UI ONLY / SEED | Activity list exists; push delivery and durable notification service are not verified |
| Chat / messaging | UI ONLY / SEED | Screen exists; durable real-time messaging is not verified |
| Search | NOT IMPLEMENTED | Complete native search flow/API not verified |
| Payments | NOT IMPLEMENTED | Do not show purchase success or grant entitlements until verified |
| Dedicated mobile API | BLOCKED | Previous production `/api/mobile/*` probes returned 406; no working dedicated native backend is verified |
| EAS / TestFlight | BLOCKED / UNVERIFIED | Workflow needs valid EAS setup and secrets; no installable TestFlight build is verified here |
| Welcome video background | NOT VERIFIED | Desired launch/auth flow must be checked on a real iPhone; do not claim the video experience is finished based on web preview |

## Architecture guardrails

- Native Expo React Native iOS is the product source of truth; web preview is only a mirror.
- Do not point the native app at `kilode-v2` or `kilode-nine.vercel.app` as if either were a dedicated mobile JSON API.
- Preserve the ten account-kind IDs. Do not add Creators or Communities as public account types; they are Socials sections.
- Super Admin is a protected staff permission, not a public registration choice.
- Do not treat seeded content, local toggles, or UI placeholders as live backend functionality.
- Account workspace shortcuts are convenience navigation only. The backend must independently enforce permissions, ownership, quotas and paid entitlements.
- Run typecheck, account-capability invariants, Expo Doctor and iOS bundle export against the exact commit. Separately verify physical-device behavior, EAS/TestFlight, backend and payments before marking those items complete.

## Music + artist notes (2026-10-22)

- `lib/musicLibrary.ts` — saved + recently played (AsyncStorage)
- `lib/musicPlayer.ts` — expo-av, queue, next/prev, dual-signature subscribe
- `screens/Music.tsx` — Discover / Charts / Artists / Library / Genres + track/artist/genre detail
- Seed `TRACKS` include public sample audio URLs so playback works offline
- `lib/artistReleases.ts` — local draft store; `releaseType`: single | ep | album
- `screens/ArtistReleases.tsx` — type picker + form + list; rights declaration; `initialCompose` from Create → Track
- Create modal **Track** → Artist Releases compose when `musicReleaseManagement` is true
- Live music API, multi-track EP/Album files, credits, checkout, royalties, and publish remain out of scope until dedicated backend is ready
