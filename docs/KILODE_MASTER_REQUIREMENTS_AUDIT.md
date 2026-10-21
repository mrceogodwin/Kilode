# Kilode Master Requirements & Release Audit

Last checked: 2026-10-21
Canonical repository: `mrceogodwin/Kilode`
Working branch: `preview/web`
Product source of truth: Expo React Native iOS/Android. Vercel web export is a mirror for preview only; it is not the native app and must not be treated as a replacement.
Backend constraint: do not silently default the native app to Kilode v2 or kilode-nine. Do not describe local/device-only data or sample content as live.

## Execution rules
- Inspect the current file and SHA before every edit; make narrow changes and preserve existing business logic, routes, APIs, auth, and work.
- After each change, verify the resulting commit and check Vercel deployment state/logs. Run typecheck/native build/tests when a connected runner supports them; never claim tests passed unless they were actually run.
- Separate implemented, connected, and verified. A screen or UI button is not proof of a working end-to-end feature.
- No invented content, fake metrics, fabricated companies/salaries, misleading enabled controls, or fake "live" status.
- Keep this document current when audit work or release status materially changes.

## Current verified repository/deployment observations
- The last checked Vercel deployment for commit `2da635bed6a4cb8c6d0af3b69b2c7043baa96cee` reached READY. It is a web export, not an iOS build.
- Vercel build output reported 62 npm audit vulnerabilities: 3 low, 17 moderate, 41 high, 1 critical. Dependency remediation needs investigation; do not blindly run breaking upgrades.
- No verified installable iOS build, physical iPhone test, or TestFlight upload is established by this audit.
- The current welcome screen uses a remote Unsplash portrait plus an error fallback. The required ten-video welcome montage is NOT implemented/verified.
- Music Top 50/Top 100 currently ranks available catalogue tracks by available play-count fields; official weekly verified-listening chart backend, historical positions, and methodology enforcement are NOT verified.
- Jobs sample vacancies were removed. Jobs list depends on supplied rows. Job publishing/application APIs and end-to-end flows are NOT verified.
- Supabase scaffolding exists, but live dedicated backend configuration, production auth/session, persistent cross-system feed, storage and RLS are NOT verified.
- Home has hybrid discovery/system cards and partial feed-source integration. Complete live feed aggregation, cross-system search, persistence, and all destinations are NOT verified.

## Master product requirements and status

### Native app, build and release
- [ ] Expo React Native is the product source; web preview only mirrors the app.
- [ ] Verify clean dependency install, TypeScript, lint/tests, Expo export, iOS native build, Android build, and dependency/security audit.
- [ ] Verify EAS project and GitHub Actions secrets (`EXPO_TOKEN`, `EAS_PROJECT_ID`) without exposing secret values.
- [ ] Produce and install a real iOS build; test on an iPhone; validate TestFlight and App Store requirements.
- [ ] Check safe areas, status bars, keyboard, navigation, accessibility, offline/network errors, loading, empty states, crash handling, performance and permissions.

### Branding and entry
- [ ] Integrate the approved final metallic-white entangled Kilode wordmark with green dot, transparent background, correct scale/alignment. Existing approximation is not proof of final asset integration.
- [ ] First launch must show the distinctive native welcome screen with ten short video scenes and a prominent dancing/person scene; test load/offline behaviour and onboarding transitions.
- [ ] Remove all unwanted “Good afternoon guest” / “Good morning guest” greetings from app and preview.
- [ ] Preserve the premium charcoal/white/gold identity: #0D0D10, #18181C, #2A2A30, #D4AF37/#E5C158, #9A9A9E. No generic blue/white redesign or green-dominant theme.
- [ ] Compact typography/cards, natural spacing, no excessive padding, no generic SaaS/glass aesthetic. Theme switch belongs in sliding drawer.

### Navigation and account architecture
- [ ] Exactly five bottom dock items: Home, Media, central +, Activity, My Space.
- [ ] One central create button; opens a slim popover above dock with account-permission-aware choices, not a blocking oversized sheet.
- [ ] Sliding menu drawer, haptics/transitions and correct safe-area placement.
- [ ] Registration requires explicit account-type selection; persist type and route to the correct distinct architecture/dashboard/tools.
- [ ] Enforce permissions on backend and protected routes, not UI hiding alone.
- [ ] Account types include the product-supported member, artist, writer, advertiser, cinema, job_poster, job_seeker, vendor, renter, brand as appropriate. Do not advertise removed Rental/Property Listing on the prelaunch banner.

### Home hybrid discovery feed
- [ ] One continuous cross-system discovery feed, not a news-only page or shortcut-card landing screen.
- [ ] Four compact unique feature cards near top; system discovery grid after Socials; retain all systems’ own pages/tools.
- [ ] Live, permission-aware content from Socials, Media, Music, Events, Market, Jobs, Communities, Cinema, Creators, Ads/Business and My Space as applicable.
- [ ] Complete cross-system search (not only currently loaded Home items), correct destinations, refresh/pagination, source labels, natural content-specific layouts.
- [ ] Like/comment/share/bookmark actions must actually work and persist; do not show fake actions for content types that do not support them.
- [ ] Validate publish -> server persistence -> originating system -> Home -> reload/reopen. No seed/demo data represented as live.

### Music discovery, charts, player and artist studio
- [ ] Discovery shelves: catalogue search, genres, new releases, singles/EPs/albums, artist pages/discographies, editorial/mood playlists, saved library, recently played, personalised shelves.
- [ ] Reliable audio playback, queue, persistent mini-player, playback state and appropriate background/audio-session behaviour.
- [ ] Top 100 and Top 50 categories: Overall, Nigeria, Afrobeats, Hip Hop, R&B, Amapiano, Emerging Artists.
- [ ] Official charts require qualified verified plays, weekly period/region, unique ranks, deterministic ordering, previous positions/movement, snapshots/history, freshness, refresh, methodology and correct category filtering.
- [ ] Artist Studio: direct audio upload, artwork, title/genre/featured artists/release date, singles/EPs/albums, drafts/editing, rights declaration, moderation/review, audio processing/storage, approved publishing, status, discography, verified analytics/earnings and external artist links.
- [ ] Do not substitute external audio URLs, sample catalogue items, or raw play_count sorting for verified chart/playback data.

### Socials and cross-system publishing
- [ ] Post composer and full-screen Socials creation flow, media attachments, people-you-may-know, share icons, feed persistence and functional likes/comments/shares/bookmarks.
- [ ] Publishing should be reusable across systems without requiring app rebuilds for each new post; validate permissions and content lifecycle.

### Media
- [ ] Premium editorial mix (60% editorial, 25% native tactile UI, 15% restrained neo-brutalist treatment); BBC/Windows-like grid, three-item hero carousel, Top 10 circles, subscription article card, ad banners.
- [ ] Kilode Pulse, Explore Kilode, independent rails/grids, article reader, save/share and subscription access rules.
- [ ] Remove old footer subscription card. Loading/error/empty states and correct native navigation. Preserve existing business logic/routes/APIs/auth.

### Events
- [ ] Discovery/details, event creation/editing, dates/location/artwork, organizer identity, persistence, publish/share, Home integration.
- [ ] Tickets/registration only when backed by real supported workflows.

### Market
- [ ] Listing creation/edit, product photos, details, categories, search/filters, seller identity, availability, persistence, save/share, Home integration and vendor tools.
- [ ] Do not claim checkout works unless payment/order/fulfilment flows are genuinely connected.

### Jobs
- [x] Removed invented sample vacancies from fallback.
- [ ] Fix and verify the previously reported duplicate “Job” header if it still exists.
- [ ] Live listings, employer identity, search/filters, job poster/job seeker account-specific tools, create/edit/persist, application and status workflows, expired/closed states, Home integration.
- [ ] Do not present local-only saved interest as an application delivered to an employer.

### Communities, Cinema, Creators, Ads & Business
- [ ] Communities: discover/detail, join/membership, posts/activity, create/admin permissions, persistence, Home feed.
- [ ] Cinema: discovery, film details/artwork/metadata/search, publisher identity, valid watch destinations, management tools and publishing state; no fake play buttons.
- [ ] Creators: discovery/profiles/content, follow/engagement where supported, creator tools, publishing/persistence, Home and Push Link.
- [ ] Ads/Business: business profiles, campaigns/placements/targeting, review, trusted payment/server verification, distribution and real reporting.
- [ ] Every system retains its own page, account-aware tools, backend data lifecycle and correct Home discovery integration.

### Push Link, fan support and Upgrade
- [ ] Push Link across eligible Music, Socials, Media, Events, Ads/Business, Market, Creators/profiles and Communities.
- [ ] Campaign create/target/placement/assets/duration/budget/review, trusted checkout, server-side payment verification, status/approval/distribution, history/receipts and genuine reach/interaction metrics.
- [ ] Device-only saved Music campaign briefs are drafts, not live campaigns; no fake reach or activation.
- [ ] Voluntary fan support with trusted checkout, server-side verification, receipts, artist earnings, verified payouts/history/status, and error/refund handling where supported; no pay-per-stream reward.
- [ ] Upgrade plans require real pricing, server entitlements, payment, receipts, renewal/cancellation and enforcement. Do not represent purchase buttons as completed checkout.

### Backend, privacy and data integrity
- [ ] Dedicated native-app backend; do not default to Kilode v2 or kilode-nine. Keep repos/projects separate until migration/deployment is explicitly verified.
- [ ] Configure and verify auth/session, profile/account kind, database schema/migrations, row-level security, storage, API contracts, error handling, rate limits, authorization, backups and observability.
- [ ] No hardcoded secrets, no fabricated live data, no local-only action described as server-persisted.
- [ ] Test account isolation, ownership, invalid input, permission-denied cases, failed uploads/payments and network interruption.

## Latest execution audit — 2026-10-21 19:40 WAT

- Latest app-code commit under test: `7445ffa44d843d58c43757d6b736e18a140f457b` (`[ios-build] Fix native-incompatible create popover width`).
- GitHub Actions native validation job `119406178630` completed SUCCESS for that commit: dependency installation, TypeScript, Expo Doctor, iOS JavaScript bundle export, and artifact upload all passed. This is meaningful native-project validation, but it is not a compiled iOS app.
- EAS installable-preview job `119406731610` passed the EAS credential presence/project-ID match check and dependency installation, but the workflow was cancelled before an installable build result was produced. The branch workflow uses `cancel-in-progress: true`; a later audit commit superseded the running build. This is NOT a successful iOS build. The next `[ios-build]` audit commit deliberately re-triggers validation followed by a fresh EAS preview build.
- GitHub Actions web-preview check `39653075838` completed SUCCESS for commit `7445ffa44d843d58c43757d6b736e18a140f457b`.
- Vercel deployment `dpl_FJsQxvXjaekXeAsKScwH5DYjeGzk`, tied to commit `7445ffa44d843d58c43757d6b736e18a140f457b`, reached READY. This confirms web export deployment only; it is not physical iPhone or TestFlight verification.
- Native create-popover width was corrected from web-only CSS-style `min(340px, 92%)` to React Native-compatible `width: "92%", maxWidth: 340`.
- Auth source inspection confirms account type is a required step before signup credentials. Actual server-side account permission enforcement and production auth persistence remain unverified.
- `app.json` declares Expo app `Kilode`, slug `kilode`, owner `mudino`, iOS bundle ID `ng.kilode.app`, and EAS project ID `b9f2e786-665d-46e5-9a7c-7af7ab25e0ea`. `eas.json` has development, preview and production profiles.
- Existing native validation workflow: `.github/workflows/native-preview.yml`. It runs npm install, TypeScript, Expo Doctor, and exports an iOS JavaScript bundle. The separate EAS job builds an internal iOS preview only after validation and credential checks.
- No `package-lock.json`, `npm-shrinkwrap.json`, or `yarn.lock` exists on `preview/web`; dependency installs are not lockfile-reproducible yet.
- `lib/config.ts` has no default host to Kilode-v2 or kilode-nine; absent dedicated env configuration it resolves to offline mode. Supabase backend setup, migrations/RLS and real-account validation remain unverified.
- The welcome screen still displays one remote Unsplash portrait with a local fallback. The ten-video montage and approved final logo asset are not integrated/verified.
- Jobs sample vacancies are removed, but Apply only saves interest locally and job posting displays an API-not-ready message. Live employer applications/publishing are not implemented/verified. Duplicate Job heading was not reproduced in current Jobs source; verify on the real preview/device before changing navigation blindly.
- Music source still states official chart rules and verified listening aggregation require backend enforcement. No weekly chart API implementation was found in the available source search.
- Dependency security remains unresolved: previous Vercel logs reported 62 npm audit findings (3 low, 17 moderate, 41 high, 1 critical). Full per-package audit details and tested remediation remain pending.

## Native-first release gate
Before any claim of iOS readiness, collect evidence for: (1) current branch commit SHA, (2) Expo Doctor/typecheck results, (3) actual EAS iOS build ID and final status, (4) installable artifact, (5) physical iPhone launch and first-screen test, (6) signup/login and account-type flow, and (7) TestFlight processing if submitted. Vercel READY is only a web-preview result and cannot satisfy this gate.

## Recent commits recorded
- `511c92fcfd794bd93bf2e32d9086edd45770af0f`: Top 50/100 category filtering before ranking limits.
- `e93377771df90f2112cc4adf61d9100fb5e625bc`: Remove sample Jobs fallback vacancies.
- `2da635bed6a4cb8c6d0af3b69b2c7043baa96cee`: Welcome portrait error fallback.
- Vercel deployment for `2da635b` checked READY; it is only the web export.

## Next execution order
1. Inspect/resolve dependency vulnerability report without blindly applying breaking upgrades; run actual available checks.
2. Trace the existing weekly music chart implementation and integrate it only if the real code/contracts are present; otherwise clearly document the missing backend contract rather than inventing one.
3. Fix the remaining Jobs UI issues and verify current first-launch path.
4. Audit Home source-by-source and remove misleading placeholders/actions; connect only to verified backend sources.
5. Complete welcome montage/logo assets, then native build/EAS/device/TestFlight verification.
6. Continue system-by-system until every requirement is implemented and tested; update this file with evidence after each material change.
