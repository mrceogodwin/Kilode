# Kilode Native-First Acceptance Register

Canonical repo: `mrceogodwin/Kilode`
Branch: `preview/web`
Source of truth: Expo React Native iOS/Android. Vercel is only a preview mirror.

## Important scope note

This register gives stable IDs to the explicit checkbox requirements already present in `docs/KILODE_MASTER_REQUIREMENTS_AUDIT.md`. It contains 55 existing acceptance items, not 1,000. No verified 1,000-item Kilode checklist was found in prior context or the repository. The “1,000 curated templates” discussed in prior history referred to a separate Subme template-library target, not a Kilode engineering checklist. Do not merge those projects or claim a 1,000-item Kilode list exists.

Status meanings:
- `NOT STARTED`: no implementation evidence recorded.
- `IN PROGRESS`: partial work exists; acceptance is not complete.
- `IMPLEMENTED — VERIFY`: an implementation claim exists but the acceptance evidence is incomplete.
- `TESTED`: acceptance checks have actually passed; cite the run/device/build evidence.
- `BLOCKED`: needs credentials, backend, external account, or another dependency.

For initial migration, unchecked audit items are `NOT STARTED / VERIFY CURRENT SOURCE`, not proof that no code exists. Checked items are `IMPLEMENTED — VERIFY` until end-to-end evidence is attached. Update statuses only after inspecting the current code and test evidence.

## Register

### KIL-001 — Native app, build and release
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Expo React Native is the product source; web preview only mirrors the app.

### KIL-002 — Native app, build and release
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Verify clean dependency install, TypeScript, lint/tests, Expo export, iOS native build, Android build, and dependency/security audit.

### KIL-003 — Native app, build and release
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Verify EAS project and GitHub Actions secrets (`EXPO_TOKEN`, `EAS_PROJECT_ID`) without exposing secret values.

### KIL-004 — Native app, build and release
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Produce and install a real iOS build; test on an iPhone; validate TestFlight and App Store requirements.

### KIL-005 — Native app, build and release
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Check safe areas, status bars, keyboard, navigation, accessibility, offline/network errors, loading, empty states, crash handling, performance and permissions.

### KIL-006 — Branding and entry
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Integrate the approved final metallic-white entangled Kilode wordmark with green dot, transparent background, correct scale/alignment. Existing approximation is not proof of final asset integration.

### KIL-007 — Branding and entry
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** First launch must show the distinctive native welcome screen with ten short video scenes and a prominent dancing/person scene; test load/offline behaviour and onboarding transitions.

### KIL-008 — Branding and entry
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Remove all unwanted “Good afternoon guest” / “Good morning guest” greetings from app and preview.

### KIL-009 — Branding and entry
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Preserve the premium charcoal/white/gold identity: #0D0D10, #18181C, #2A2A30, #D4AF37/#E5C158, #9A9A9E. No generic blue/white redesign or green-dominant theme.

### KIL-010 — Branding and entry
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Compact typography/cards, natural spacing, no excessive padding, no generic SaaS/glass aesthetic. Theme switch belongs in sliding drawer.

### KIL-011 — Navigation and account architecture
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Exactly five bottom dock items: Home, Media, central +, Activity, My Space.

### KIL-012 — Navigation and account architecture
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** One central create button; opens a slim popover above dock with account-permission-aware choices, not a blocking oversized sheet.

### KIL-013 — Navigation and account architecture
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Sliding menu drawer, haptics/transitions and correct safe-area placement.

### KIL-014 — Navigation and account architecture
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Registration requires explicit account-type selection; persist type and route to the correct distinct architecture/dashboard/tools.

### KIL-015 — Navigation and account architecture
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Enforce permissions on backend and protected routes, not UI hiding alone.

### KIL-016 — Navigation and account architecture
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Account types include the product-supported member, artist, writer, advertiser, cinema, job_poster, job_seeker, vendor, renter, brand as appropriate. Do not advertise removed Rental/Property Listing on the prelaunch banner.

### KIL-017 — Home hybrid discovery feed
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** One continuous cross-system discovery feed, not a news-only page or shortcut-card landing screen.

### KIL-018 — Home hybrid discovery feed
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Four compact unique feature cards near top; system discovery grid after Socials; retain all systems’ own pages/tools.

### KIL-019 — Home hybrid discovery feed
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Live, permission-aware content from Socials, Media, Music, Events, Market, Jobs, Communities, Cinema, Creators, Ads/Business and My Space as applicable.

### KIL-020 — Home hybrid discovery feed
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Complete cross-system search (not only currently loaded Home items), correct destinations, refresh/pagination, source labels, natural content-specific layouts.

### KIL-021 — Home hybrid discovery feed
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Like/comment/share/bookmark actions must actually work and persist; do not show fake actions for content types that do not support them.

### KIL-022 — Home hybrid discovery feed
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Validate publish -> server persistence -> originating system -> Home -> reload/reopen. No seed/demo data represented as live.

### KIL-023 — Music discovery, charts, player and artist studio
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Discovery shelves: catalogue search, genres, new releases, singles/EPs/albums, artist pages/discographies, editorial/mood playlists, saved library, recently played, personalised shelves.

### KIL-024 — Music discovery, charts, player and artist studio
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Reliable audio playback, queue, persistent mini-player, playback state and appropriate background/audio-session behaviour.

### KIL-025 — Music discovery, charts, player and artist studio
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Top 100 and Top 50 categories: Overall, Nigeria, Afrobeats, Hip Hop, R&B, Amapiano, Emerging Artists.

### KIL-026 — Music discovery, charts, player and artist studio
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Official charts require qualified verified plays, weekly period/region, unique ranks, deterministic ordering, previous positions/movement, snapshots/history, freshness, refresh, methodology and correct category filtering.

### KIL-027 — Music discovery, charts, player and artist studio
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Artist Studio: direct audio upload, artwork, title/genre/featured artists/release date, singles/EPs/albums, drafts/editing, rights declaration, moderation/review, audio processing/storage, approved publishing, status, discography, verified analytics/earnings and external artist links.

### KIL-028 — Music discovery, charts, player and artist studio
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Do not substitute external audio URLs, sample catalogue items, or raw play_count sorting for verified chart/playback data.

### KIL-029 — Socials and cross-system publishing
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Post composer and full-screen Socials creation flow, media attachments, people-you-may-know, share icons, feed persistence and functional likes/comments/shares/bookmarks.

### KIL-030 — Socials and cross-system publishing
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Publishing should be reusable across systems without requiring app rebuilds for each new post; validate permissions and content lifecycle.

### KIL-031 — Media
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Premium editorial mix (60% editorial, 25% native tactile UI, 15% restrained neo-brutalist treatment); BBC/Windows-like grid, three-item hero carousel, Top 10 circles, subscription article card, ad banners.

### KIL-032 — Media
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Kilode Pulse, Explore Kilode, independent rails/grids, article reader, save/share and subscription access rules.

### KIL-033 — Media
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Remove old footer subscription card. Loading/error/empty states and correct native navigation. Preserve existing business logic/routes/APIs/auth.

### KIL-034 — Events
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Discovery/details, event creation/editing, dates/location/artwork, organizer identity, persistence, publish/share, Home integration.

### KIL-035 — Events
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Tickets/registration only when backed by real supported workflows.

### KIL-036 — Market
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Listing creation/edit, product photos, details, categories, search/filters, seller identity, availability, persistence, save/share, Home integration and vendor tools.

### KIL-037 — Market
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Do not claim checkout works unless payment/order/fulfilment flows are genuinely connected.

### KIL-038 — Jobs
- **Status:** IMPLEMENTED — VERIFY
- **Acceptance:** Removed invented sample vacancies from fallback.

### KIL-039 — Jobs
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Fix and verify the previously reported duplicate “Job” header if it still exists.

### KIL-040 — Jobs
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Live listings, employer identity, search/filters, job poster/job seeker account-specific tools, create/edit/persist, application and status workflows, expired/closed states, Home integration.

### KIL-041 — Jobs
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Do not present local-only saved interest as an application delivered to an employer.

### KIL-042 — Communities, Cinema, Creators, Ads & Business
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Communities: discover/detail, join/membership, posts/activity, create/admin permissions, persistence, Home feed.

### KIL-043 — Communities, Cinema, Creators, Ads & Business
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Cinema: discovery, film details/artwork/metadata/search, publisher identity, valid watch destinations, management tools and publishing state; no fake play buttons.

### KIL-044 — Communities, Cinema, Creators, Ads & Business
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Creators: discovery/profiles/content, follow/engagement where supported, creator tools, publishing/persistence, Home and Push Link.

### KIL-045 — Communities, Cinema, Creators, Ads & Business
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Ads/Business: business profiles, campaigns/placements/targeting, review, trusted payment/server verification, distribution and real reporting.

### KIL-046 — Communities, Cinema, Creators, Ads & Business
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Every system retains its own page, account-aware tools, backend data lifecycle and correct Home discovery integration.

### KIL-047 — Push Link, fan support and Upgrade
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Push Link across eligible Music, Socials, Media, Events, Ads/Business, Market, Creators/profiles and Communities.

### KIL-048 — Push Link, fan support and Upgrade
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Campaign create/target/placement/assets/duration/budget/review, trusted checkout, server-side payment verification, status/approval/distribution, history/receipts and genuine reach/interaction metrics.

### KIL-049 — Push Link, fan support and Upgrade
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Device-only saved Music campaign briefs are drafts, not live campaigns; no fake reach or activation.

### KIL-050 — Push Link, fan support and Upgrade
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Voluntary fan support with trusted checkout, server-side verification, receipts, artist earnings, verified payouts/history/status, and error/refund handling where supported; no pay-per-stream reward.

### KIL-051 — Push Link, fan support and Upgrade
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Upgrade plans require real pricing, server entitlements, payment, receipts, renewal/cancellation and enforcement. Do not represent purchase buttons as completed checkout.

### KIL-052 — Backend, privacy and data integrity
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Dedicated native-app backend; do not default to Kilode v2 or kilode-nine. Keep repos/projects separate until migration/deployment is explicitly verified.

### KIL-053 — Backend, privacy and data integrity
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Configure and verify auth/session, profile/account kind, database schema/migrations, row-level security, storage, API contracts, error handling, rate limits, authorization, backups and observability.

### KIL-054 — Backend, privacy and data integrity
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** No hardcoded secrets, no fabricated live data, no local-only action described as server-persisted.

### KIL-055 — Backend, privacy and data integrity
- **Status:** NOT STARTED / VERIFY CURRENT SOURCE
- **Acceptance:** Test account isolation, ownership, invalid input, permission-denied cases, failed uploads/payments and network interruption.

## Release gates — tracked separately from feature counts

These gates are not counted among the 55 migrated checklist entries above:
1. Valid EAS iOS signing credentials for bundle ID `ng.kilode.app`.
2. Successful EAS build with build ID and installable `.ipa`.
3. Install and launch on a registered physical iPhone; verify first-launch/welcome experience.
4. Verify sign-in/sign-up and account-type flow on device.
5. Verify App Store Connect/TestFlight processing if submitted.
6. Recheck current GitHub Actions and Vercel deployment after relevant commits.

## Audit discipline
- Keep iOS implementation first; Vercel is not proof of native functionality.
- Preserve existing code; inspect the current SHA before each edit.
- Never label local-only drafts, mock content, fake metrics, or unconnected controls as live.
- For each item marked TESTED, record date, commit SHA, test run/build ID, and device/account context where appropriate.
- Expand this register only from approved requirements and source evidence; do not invent requirements just to reach 1,000.
