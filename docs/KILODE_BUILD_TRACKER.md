# Kilode build tracker

**Last checked:** 2026-10-20  
**Priority:** Native Expo/React Native iOS first. Web export is a visual mirror, never proof of iOS behaviour.  
**Rule:** A feature is not DONE because a screen/helper exists. Require tests and observed runtime behaviour; mark physical-device/backend work separately.

## Current checkpoint

- **Repository:** `mrceogodwin/Kilode`, branch `preview/web`.
- **Latest work:** Music uses registered artist profiles for its carousel and featured artist card; removed the hardcoded third-party featured artist/image. Avatar failures fall back safely. Header wordmark redesign is also in the branch.
- **Latest completed CI checkpoint `f89e2f4e`:** native validation passed, including TypeScript, Expo Doctor, and iOS JavaScript bundle export. Web Preview Check also passed. Newer source changes must pass CI separately. These are automated checks, not a compiled/installable iOS binary or device test.
- **Physical iPhone install/gesture/audio testing:** NOT VERIFIED.
- **EAS iOS build:** BLOCKED/UNVERIFIED; `app.json` has an empty `extra.eas.projectId`.
- **Live dedicated Supabase backend:** NOT CONFIGURED/VERIFIED. Do not describe seed/offline mode as live.

## Overall completion estimate (honest, not a test result)

- **Estimated whole-product completion: 25%** toward the requested 100% production-grade platform. This is a planning estimate, not a measured metric or release certification.
- **UI/native source foundations:** substantial screens and navigation exist, but many interactions and device behaviours remain unverified.
- **Production backend and real data:** incomplete; dedicated Supabase configuration, migration/RLS verification and end-to-end auth/data workflows are still open.
- **Installable iOS/release validation:** not achieved yet; EAS project ID is empty and no installable build or physical-iPhone test is confirmed.
- **Payments, Push Link, moderation and publishing:** core production-safe server workflows and verification remain incomplete.
- Do not increase the percentage for cosmetic commits or web-only checks. Reassess only when measurable end-to-end gates pass.

## P0 — Release, safety and test gates

- [x] Confirm native validation and web export CI results for current checkpoint `f89e2f4e` (both passed). Re-run after subsequent source changes.
- [ ] Link the app to the owner's Expo project with `eas init` under the correct Expo account; never invent the project ID.
- [ ] Produce and verify an installable iOS build; test on a physical iPhone.
- [ ] Create/confirm the dedicated Supabase project; configure URL and publishable/anon key in build secrets (never client-side service-role keys).
- [ ] Apply migrations to disposable staging first; reconcile existing migration history before applying anything to an existing database.
- [ ] Test signup → profile bootstrap → sign in/out → feed read → post creation and cross-account access denial.
- [ ] Verify RLS, grants, triggers, storage ownership and two-account isolation against the live staging backend.
- [ ] Implement trusted payment intents/webhooks and server-owned campaign activation/metrics before enabling payments or Push Link reporting.

## P1 — Native navigation and shell

- [x] Premium solid header and five-item bottom dock direction implemented; central create action retained.
- [x] Header-left Kilode wordmark redesigned: the exclamation stem forms the K upright, clean diagonals complete the K, tightly kerned upright green letters use layered highlight/depth, and the dot is orange.
- [ ] Review wordmark sizing and legibility on iPhone and web export; the requested crayon-like raised effect is approximated with native text layers and shadows, not a custom textured font asset.
- [x] Remove duplicate Socials top-left create button; contextual create CTA is used by system.
- [x] Add tab history and edge-swipe back/forward logic; back closes selected transient overlays/details first.
- [x] Confirm CI on checkpoint `f89e2f4e`; repeat after future source changes.
- [ ] Physical-device test edge gestures with nested scroll views, carousels, text inputs, music controls and the bottom dock; ensure gesture handling never blocks ordinary scrolling.
- [ ] Audit all modal/sheet/detail states so back consistently closes the topmost state before leaving its parent.
- [ ] Confirm tab forward history semantics and restoration behaviour; detail screens are not yet verified as restorable through forward navigation.
- [ ] Verify safe areas, keyboard, haptics, transitions and touch targets on actual iOS.

## P1 — Music system

- [x] Replace the oversized “From Kilode” track row with a compact round-thumbnail carousel sourced from registered artist profiles; “See all” opens the full Artists list.
- [x] Add runtime image-error fallbacks for broken artist avatar URLs in the carousel and full Artists list.
- [ ] Verify carousel, dynamic featured artist card, image fallbacks, loading/error/empty states and full artist list on iOS; backend must return registered profiles for the catalogue to populate.
- [x] Top 100/categories and tailored playlist foundations exist in Music screen code.
- [x] Local saved tracks/playlists and recent listening are stored per user/device.
- [x] Queue navigation and rapid track-switch safeguards have been implemented in prior commits.
- [x] Latest change clears in-memory library state when storage read fails, instead of retaining another account's state.
- [x] Avatar fallback, Music carousel and logo changes pass native validation and web export on checkpoint `f89e2f4e`.
- [ ] Test account switching, corrupt storage, storage rejection, save/unsave, and app restart on device.
- [ ] Verify Top 100 uses trustworthy, server-ranked catalogue data when backend is configured; do not label seed catalogue as real rankings.
- [ ] Verify category/genre matching with actual catalogue metadata and useful empty/error states.
- [ ] Finish Now Playing, seeking, duration/progress, queue controls and audio interruption/background policy.
- [ ] Test real audio URLs, no-preview tracks, rapid previous/next, failed loads and audio cleanup on device.
- [ ] Implement server-backed release creation/review/publishing and private audio storage policies before calling artist distribution live.
- [ ] Keep artist support, paid promotion, purchases and any future royalties distinct; do not imply stream payouts.

## P1 — Home discovery feed

- [x] Home feed currently merges Socials, Media, Music, Events, Market and Jobs.
- [ ] Verify source data is live and consistently normalized; seed content must be clearly non-production.
- [ ] Add and verify canonical feed ingestion for Communities, Cinema, Creators, Ads/Push Link and My Space/profile activity where product rules permit.
- [ ] Confirm cross-system deduplication, sorting, empty/error/loading states and tap destinations.
- [ ] Keep each system's dedicated page and publishing workflow separate while surfacing eligible content in Home.

## P1 — Accounts, Socials and My Space

- [ ] Verify signup/login/logout with the dedicated backend; localOnly sessions are not production authentication.
- [ ] Finish account-type selection at registration and verify account-specific dashboards/tool rows and server-enforced permissions.
- [ ] Make likes, follows, comments, shares and post creation persist server-side; local UI state is not proof of persistence.
- [ ] Verify block/report enforcement at the data layer, not only client filtering.
- [ ] Finish My Space profile editing, avatar/profile persistence and Saved items/bookmarks.
- [ ] Implement actual account deletion, including backend deletion/retention flow; signing out alone is not account deletion.
- [ ] Verify privacy rules and cross-account access with two accounts.

## P1 — System-specific publishing workflows

- [ ] Socials: reliable post composer, media upload, comments, likes, follows, share and moderation flows.
- [ ] Media: publisher workflow, article detail, subscriptions/paywall only after server entitlements exist.
- [ ] Music: upload/release drafts, review, publish, catalogue, charts and artist support.
- [ ] Events: event creation, ownership, updates and any ticket/payment flow; currently backend notes say publishing remains incomplete/read-only.
- [ ] Market: listing creation/editing, ownership, contact and transaction safety.
- [ ] Jobs: employer/creator posting, application flow and account permissions.
- [ ] Communities: creation, membership, moderation and feed integration.
- [ ] Cinema: verified content catalogue, access rights and playback; no fake catalogue or dead play buttons.
- [ ] Creators: creator profiles, uploads, publishing and analytics.
- [ ] Ads/Push Link: server-side campaign lifecycle, payment verification, placement, and genuine impressions/clicks/CTR.
- [ ] My Space: account-type-specific tools, profile and saved content.

## Definition of done

For every task: inspect current code first → make a focused change → run relevant automated checks → inspect logs/results → commit → update this tracker. Test runtime behaviour on a real iPhone when the feature depends on device APIs or gestures. Keep NOT VERIFIED items open; never infer production readiness from a web export or a successful TypeScript check.
