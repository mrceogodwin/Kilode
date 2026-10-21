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

## Latest execution audit — 2026-10-21 19:45 WAT

- Latest native app-code commit under test remains `7445ffa44d843d58c43757d6b736e18a140f457b` (`[ios-build] Fix native-incompatible create popover width`). Latest audit-only commit is `2b28f59b234d7fae3cffe3947271b8c5f2b3c4d8`.
- GitHub Actions native validation for audit commit `2b28f59b234d7fae3cffe3947271b8c5f2b3c4d8` passed: dependency installation, TypeScript, Expo Doctor, iOS JavaScript bundle export, and artifact upload. Run: `39654061736`.
- EAS installable iOS preview job `119410206511` FAILED before an EAS build was created. Exact log cause: EAS used remote iOS credentials but could not find credentials suitable for internal distribution in non-interactive mode. Required next action: configure/create an iOS distribution certificate and Ad Hoc provisioning profile for bundle ID `ng.kilode.app` in EAS credentials (one-time interactive setup by an authorized account), then rerun the preview build. Do not report an installable build or artifact until EAS returns a build ID and final successful status.
- The EAS credential presence/project-ID check and dependency installation both passed. The blocker is specifically missing suitable iOS internal-distribution credentials, not missing GitHub `EXPO_TOKEN` or project-ID mismatch.
- EAS also warned that `ios.infoPlist.ITSAppUsesNonExemptEncryption` is unset and manual App Store Connect configuration is required; determine encryption declaration accurately before setting it. EAS noted `ios.buildNumber` is ignored when remote version source is enabled; clean this config after confirming intended version management.
- GitHub Actions web-preview check for commit `2b28f59b234d7fae3cffe3947271b8c5f2b3c4d8` passed: run `39654062019`.
- Vercel deployment `dpl_4newtjVUJ12U6CE81Dam3qeui51o`, tied to commit `2b28f59b234d7fae3cffe3947271b8c5f2b3c4d8`, reached READY and carries the canonical preview alias. This confirms web export deployment only, not native-device verification.
- Native create-popover width was corrected from web-only CSS-style `min(340px, 92%)` to React Native-compatible `width: "92%", maxWidth: 340`.
- Auth source inspection confirms account type is a required step before signup credentials. Actual server-side account permission enforcement and production auth persistence remain unverified.
- `app.json` declares Expo app `Kilode`, slug `kilode`, owner `mudino`, iOS bundle ID `ng.kilode.app`, and EAS project ID `b9f2e786-665d-46e5-9a7c-7af7ab25e0ea`. `eas.json` has development, preview and production profiles.
- Existing native validation workflow: `.github/workflows/native-preview.yml`. It runs npm install, TypeScript, Expo Doctor, and exports an iOS JavaScript bundle. EAS build job runs only after validation and credential checks. Avoid adding another `[ios-build]` trigger until distribution credentials are configured, to avoid repeating the same known failure.
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


## Follow-up audit — 2026-10-21 (EAS signing recovery + master-list tracking)

- Commit `828a93ed497fd6bf522a6b52671638c31f1f0af2` updates `docs/EAS_SETUP_MUDINO.md` with the specific iOS preview signing recovery steps. This is documentation only; it does not create Apple credentials or claim the build is fixed.
- The confirmed blocker remains: the `preview` profile uses `distribution: internal`; EAS needs a valid Apple Distribution certificate and an Ad Hoc provisioning profile, and the tester's device UDID must be registered/included. The authorised Apple Developer account holder/admin (or a suitably authorised App Manager) must complete interactive credential setup. After that, rerun the EAS preview workflow and verify an actual installable `.ipa` and EAS build ID.
- Official reference checked: Expo internal distribution documentation says ad hoc profiles allow only registered device UDIDs and that CI can reuse a valid profile; see https://docs.expo.dev/build/internal-distribution/ and https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/.
- Latest code change remains separate from this docs-only commit. Do not add the `[ios-build]` trigger until signing credentials are confirmed, to avoid repeating a known failure. The native validation workflow runs on pushes, but it is not a substitute for an EAS device build.
- Preview tracking: the Vercel deployment for commit `828a93ed497fd6bf522a6b52671638c31f1f0af2` was still `INITIALIZING` at the last check. Recheck its final state before saying the latest preview is ready. The earlier deployment for `73dee55471757ce77ebeeccefc1d9764f2b475db` was `READY`.
- Master checklist accuracy: this file is the active master requirements audit and currently tracks system-by-system acceptance requirements with checked/unchecked status. The exact 1,000-item numbered Kilode checklist and a verified 1,000-item completion count have **not** been located/confirmed in the repository or retrieved prior context; a previous estimate of ~25% was explicitly an unmeasured planning estimate, not a test-backed completion percentage. Do not claim that 1,000 separate items are already numbered or completed. Next checklist task: convert the complete user-approved requirements into stable numbered acceptance IDs and track each as not started / in progress / implemented / tested / blocked, without inventing requirements or inflating completion.


## Follow-up execution — 2026-10-21 (acceptance register)

- Created `docs/KILODE_ACCEPTANCE_REGISTER.md` in commit `a7b1fee1e058142f6abec89fbd17238ff3777d4f`.
- The register assigns stable IDs `KIL-001`–`KIL-055` to the 55 explicit checkbox requirements already present in this master audit. The audit currently has 1 checked checkbox and 54 unchecked checkboxes; these are tracking markers, not a verified completion percentage.
- Important clarification: retrieved prior context does not contain a 1,000-item Kilode engineering checklist. The “1,000 curated templates” discussion found in prior history refers to a separate Subme template-library target. The register records this distinction so those projects and their counts are not mixed. Do not invent 945 additional items merely to reach 1,000. Expand only from approved Kilode requirements and verified source.
- Initial register statuses are intentionally conservative: previously checked items are `IMPLEMENTED — VERIFY`; unchecked items are `NOT STARTED / VERIFY CURRENT SOURCE`. These do not assert that uninspected code is absent, nor that implementation is tested.
- EAS signing remains blocked pending authorised Apple Developer/EAS credential setup. Official Expo docs confirm iOS internal distribution needs an Ad Hoc profile listing registered device UDIDs; CI can reuse valid credentials, and profile refresh requires the appropriate supported credential setup. Reference: https://docs.expo.dev/build/internal-distribution/.
- Native validation and web preview workflows are running for commit `2957b3d2ba7352bf79a424b33c362dd0528921e2` at last check; the previous commit `828a93ed497fd6bf522a6b52671638c31f1f0af2` passed dependency install, TypeScript, Expo Doctor and iOS bundle export. That run's EAS installable build was skipped, not passed, because it was a docs-only commit without the `[ios-build]` trigger.
- Next native implementation work remains: investigate dependency audit findings; trace Music charts without inventing backend data; inspect the current Jobs and first-launch UI; audit Home integration; complete approved welcome video/logo assets; then run the EAS build once credentials are valid.


## Latest verification — 2026-10-21 (after acceptance-register commits)

- Verified latest docs commit `6406f70986069ac421e15efac12c36b75ae1facb` has a READY Vercel deployment: `dpl_6vYHcjnwNtNENcP4zoSJ3b2ReE6s`, alias `kilodenew-git-preview-web-godwin-oriabure.vercel.app`. This confirms the web preview deployment completed; it does not confirm the native app's visual correctness or an iOS installation.
- GitHub Actions for `6406f709`: native validation run `39656453123` completed successfully, and web preview check `39656453196` completed successfully. Native job `119418451366` passed dependency installation, TypeScript, Expo Doctor, iOS JS bundle export, and artifact upload. EAS job `119419119601` was **skipped**; no installable `.ipa` was created by this run.
- The prior native run `39656437566` was cancelled during dependency installation after a newer run superseded it. Do not count it as a test failure or a pass; use the completed successful run above.
- Acceptance tracking: `docs/KILODE_ACCEPTANCE_REGISTER.md` currently has stable IDs `KIL-001`–`KIL-055`. This is a traceable starting register, not the 1,000-item list the user refers to. The exact historical 1,000-item Kilode list has not been recoverable from repository files or prior-context retrieval. Do not claim it is tracked; continue preserving the user's expectation by expanding only from approved, evidenced Kilode requirements and keeping this discrepancy visible until the original list is recovered or a clearly labelled reconstructed register is agreed.
- Native-first remaining release gate: Apple/EAS signing credentials still need authorised setup before a genuine internal iOS build can be run. No physical-device install, TestFlight processing, or real-iPhone welcome-screen verification is established by these workflow results.
