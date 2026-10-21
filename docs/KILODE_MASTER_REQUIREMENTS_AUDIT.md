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
