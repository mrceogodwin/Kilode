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
| Music | PARTIALLY IMPLEMENTED | Discover / Charts / Artists / Library / Genres; queue player; saved + recent; sample audio offline |
| Artist release drafts | PARTIALLY IMPLEMENTED | Local: releaseType, metadata, optional localAudioUri, rights; Create → Track + My Space. No server upload |
| Artist upload monetisation | DOCUMENTED, NOT IMPLEMENTED | See `docs/ARTIST_UPLOADS_MONETISATION.md` |
| Events | PARTIALLY IMPLEMENTED | Local drafts (title, venue, city, when, price, notes) via AsyncStorage; Create → Event + My Space + Events desk entry. Seed listings remain. No publish, RSVP, or tickets |
| Market | UI ONLY / SEED | Desk exists; live listings/orders not verified |
| Jobs | UI ONLY / SEED | Desk exists; live posting/applications not verified |
| Ads / business | NOT IMPLEMENTED / INCOMPLETE | Desk entry exists; campaign backend not verified |
| Cinema | UI ONLY / SEED | Screen exists; live hosting not verified |
| My Space | PARTIALLY IMPLEMENTED | Profile, settings, artist releases shortcut, event drafts shortcut; wallet placeholder |
| Ten public account kinds | VERIFIED IN CODE | Stable IDs and capability map |
| Account-specific server permissions | NOT VERIFIED | Backend must enforce |
| Upgrade / paid entitlements | NOT IMPLEMENTED | |
| Authentication | PARTIALLY IMPLEMENTED | Guest works locally; real auth needs dedicated API |
| Password reset / Google sign-in | NOT IMPLEMENTED / STUB | |
| Report / block | PARTIALLY IMPLEMENTED | Local helpers |
| Account deletion | PARTIALLY IMPLEMENTED | Local session clear |
| Notifications | UI ONLY / SEED | |
| Chat / messaging | UI ONLY / SEED | |
| Search | NOT IMPLEMENTED | |
| Payments | NOT IMPLEMENTED | |
| Dedicated mobile API | BLOCKED | |
| EAS / TestFlight | BLOCKED / UNVERIFIED | |
| Welcome video background | NOT VERIFIED | |

## Architecture guardrails

- Native Expo React Native iOS is the product source of truth; web preview is only a mirror.
- Do not point the native app at `kilode-v2` or `kilode-nine.vercel.app` as a mobile JSON API.
- Preserve the ten account-kind IDs. Creators/Communities are Socials sections, not account types.
- Super Admin is a protected staff permission, not a public registration choice.
- Do not treat seeded content or local drafts as live backend functionality.
- Backend must independently enforce permissions, ownership, quotas, and paid entitlements.

## Recent notes (2026-10-22)

- Artist: releaseType + local audio attach (device URI only)
- Events: `lib/eventDrafts.ts` + `screens/EventDrafts.tsx`; Create → Event; My Space; Events desk shortcut
- Event drafts are device-only — not discoverable, ticketed, or published
