# Kilode Native iOS — Master Audit & Remediation Register

**Last reviewed:** 2026-10-21  
**Repository:** `mrceogodwin/Kilode`  
**Audit branch:** `music-compact-create-sheet`  
**Current PR:** [#2 — Music search and compact creation menu](https://github.com/mrceogodwin/Kilode/pull/2)  
**PR head checked:** `dddcc01649030598e95856eb9432f8b3977adb3d`  
**Product source of truth:** Expo React Native app. The Vercel HTML mirror is secondary and is not proof of native behavior.

## 1. Audit coverage and code size — be precise

- GitHub repository metadata reports **5,726 KB repository size**. This is GitHub's repository-size figure, **not** a measured source-code-only size.
- **Total source files, total source lines, and percent of the complete repository audited are not yet measured.** The available GitHub connector did not provide a recursive repository file/line inventory in this pass. Do not invent a percentage or call this a full line-by-line audit.
- Targeted source files fetched for inspection include: `KilodeRoot.tsx`, `screens/Auth.tsx`, `screens/Music.tsx`, `screens/Settings.tsx`, `screens/PushLink.tsx`, `screens/ArtistEarnings.tsx`, `lib/auth.tsx`, `lib/api.ts`, `lib/config.ts`, `lib/moderation.ts`, `app.json`, `eas.json`, `.github/workflows/eas-ios-preview.yml`, `docs/FEATURE_STATUS.md`, `docs/EAS_SETUP_MUDINO.md`, `docs/kilode-ios-preview.html`, and the README. This is targeted coverage of core flows, not every screen/component/utility.
- **Known compiler errors on the validated commit:** none in the completed CI job. This does not mean there are zero product, runtime, security, backend, visual, or accessibility issues.
- **Latest verified automated checks in this audit record:** GitHub Actions runs 39623611076, 39624180758 and 39624203662 completed successfully for TypeScript, Expo Doctor, and iOS JavaScript bundle export. These checks do not establish a signed iPhone install, real-device correctness, backend availability, or App Store approval.
- The latest checked PR head is `dddcc01649030598e95856eb9432f8b3977adb3d`; do not assume a green run for this exact SHA unless a matching run is checked.

## 2. Release-blocking issues (P0)

- [ ] **Dedicated backend not deployed/configured.** `lib/config.ts` intentionally leaves `API_BASE` empty unless `EXPO_PUBLIC_API_URL` is set. Auth/API-backed features fail closed. Never fall back to Kilode-v2 or Kilode-nine.
- [ ] **Installable iPhone build not verified.** The last device-distribution EAS attempt failed because suitable iOS signing credentials were unavailable. Resolve Apple/EAS signing and confirm a successful build URL and install on a physical iPhone.
- [ ] **Required launch assets missing from the repository.** `assets/` was previously inspected as containing only `.gitkeep`. The welcome screen currently uses a remote Unsplash photo and a text wordmark. The approved metallic-white entangled Kilode logo with green dot and the bundled multi-scene cinematic intro are not integrated.
- [ ] **Server-side account deletion is not proven/implemented end-to-end.** Existing Settings UI/local clearing does not prove deletion of a server account and associated data.
- [ ] **Safety moderation is local-only.** `lib/moderation.ts` stores reports/blocks locally; no staff queue or cross-device enforcement is established.
- [ ] **Privacy/store-review readiness not verified.** Settings references `https://kilode.ng/privacy` and `https://kilode.ng/terms` with a code comment saying publish before submission. Confirm public live pages, privacy disclosures, reviewer account, SDK/privacy-manifest requirements, and support contact.
- [ ] **Payments and artist payouts not implemented end-to-end.** No verified purchase flow, entitlements, ledger, refunds/reconciliation, payout onboarding or payout execution. Review Apple policy for digital content and subscriptions before choosing integrations.

## 3. System-by-system status register

Status is conservative: UI presence is not equivalent to a working production system.

| System | Current status | Known gap / required work |
|---|---|---|
| First-launch welcome | Partial | Welcome-first gate exists on this branch; use the approved local metallic logo and bundled cinematic scenes, eliminate remote-image dependency, verify cold launch and signed-in routing on device. |
| App icon / splash | Blocked | No confirmed committed final icon/splash artwork; add correct assets and Expo config paths, then inspect iOS launch behavior. |
| Home hybrid discovery feed | Partial | Home has multiple system sections, but source data may be seed/mock; define feed API, pagination, empty/error/offline states, ranking and per-system content contracts. |
| Media / news | UI/seed | Implement article detail/reader, live ingestion/API, author/source metadata, subscription/ads rules and persistence. |
| Socials / posts | Partial | Composer and interactions exist; wire authenticated server persistence for posts, likes, comments, follows, media uploads and feed refresh; add ownership/rate-limit tests. |
| Music catalogue | Partial | UI/search/chart discovery exist; connect live catalogue and artist ownership; never present seed tracks as live. |
| Music playback / mini-player | Partial | Shared Expo audio playback code exists; verify real stream URLs, signed playback URLs, queue, stop/seek, interruptions, background/foreground, headphones, failures, memory cleanup and iPhone behavior. |
| Kilode Top 100 | Partial/unverified | Chart UI/data logic exists; needs authoritative source, transparent ranking window/metrics, freshness, anti-manipulation rules and artist-facing trend deltas. |
| Music uploads/releases | Partial | Document picker/upload scaffolding exists; implement secure upload/storage, progress/retry, metadata, rights/ownership checks, processing and persistence. |
| Artist earnings / fan support | Not end-to-end | UI explains possible earning sources but balances/payouts are not live. Implement purchase entitlements, receipts, ledger, reconciliation, fees, refunds, payout/KYC/tax and audit trails. |
| Push Link | Partial/draft | Draft validation/classification exists; campaign publishing, billing, paid reach, attribution, verified analytics, fraud controls and refunds are not live. |
| Events | UI/seed | Implement event creation, host permissions, venue/date rules, RSVP/ticketing if offered, notifications, cancellation/refund and server persistence. |
| Market | UI/seed | Implement seller verification, listing moderation, inventory, checkout, order states, disputes/refunds and delivery/fulfilment policy. |
| Jobs | UI/seed | Implement employer permissions, job posting, application submission/status, privacy controls, expiry and moderation. |
| Communities | UI/seed | Implement membership/roles, feeds, invites, server moderation, reporting, privacy and cross-device persistence. |
| Cinema | UI/seed | Implement licensed content catalogue, playback delivery, age/region controls where applicable, rights metadata and subscription/purchase rules. |
| Creators / profiles | UI/seed | Implement profile publishing, creator tools, media persistence, ownership, verification and monetization linkage. |
| My Space / account types | Partial | Ensure registration captures account type and every type gets separate tools/dashboard; enforce roles and permissions on the server, not only in UI. Test account switching and role changes. |
| Authentication / sessions | Blocked for live accounts | Guest/local flow exists; configure dedicated auth, secure token storage (review AsyncStorage use), sign-up/sign-in validation, session expiry/revocation, password recovery, email/phone verification, rate limiting and abuse controls. |
| Chat / messaging | UI/seed | Implement authenticated realtime transport, message persistence, delivery/read state, media attachments, blocking/report enforcement, retention and notification integration. |
| Notifications / activity | UI/seed | Implement server activity feed, APNs registration/token lifecycle, push delivery, preferences, deep links, unread counts and opt-out behavior. |
| Cross-system search | Not complete | Implement one native search entry point and backend indexing/querying across people, posts, music, media, events, jobs, market, communities and creators; filters, pagination and empty/error states. |
| Ads / business | Partial scaffolding | Implement business verification, ad review, targeting/consent, campaign delivery, billing, frequency caps, reporting and abuse prevention. |
| Report / block | Local-only partial | Server-side report intake, staff tooling, enforcement across devices and all content surfaces; test blocked-user visibility and appeal paths. |
| Account deletion / recovery | Incomplete | Server deletion and associated data retention/deletion policy; password/account recovery; clear confirmation and auditability. |
| Settings / privacy | Incomplete | Publish/verify privacy and terms URLs; data export/deletion, notification/privacy controls, support routes, accessibility and policy disclosures. |
| API/client contracts | Blocked for live data | Define dedicated API host, schemas, auth, pagination, timeouts, error mapping, retries, rate limits, versioning and integration tests; preserve explicit live/mock/error states. |
| Local persistence | Partial | Review AsyncStorage failure/migration behavior, sensitive-token handling, account isolation, logout wipe, corruption recovery and offline synchronization/conflicts. |
| Web preview | Misleading/incomplete mirror | Current `docs/kilode-ios-preview.html` is standalone HTML, with old home mock and green accent. It is not Expo runtime. Rebuild the mirror from the same current native screens/tokens/feature status; label any nonfunctional controls and do not treat it as native QA. |
| iOS build/signing | Blocked for device | Simulator bundle export is not an installable iPhone app. Resolve EAS signing, build the preview profile, install and test on device. |
| Android build | Unverified | Build and smoke-test Android separately; validate package, adaptive icon, permissions and device layout. |
| Accessibility / UX | Not manually verified | VoiceOver, dynamic type, contrast, tap targets, safe areas, keyboard overlap, reduced motion, haptics, small devices, orientation assumptions and error messaging. |
| Tests / observability | Incomplete | Add unit tests for auth/API/permissions/charts, component tests for navigation/forms, integration tests for critical flows, crash/error reporting and privacy-safe logs. |
| Dependency/build reproducibility | Partial | `@expo/vector-icons` and `expo-font` were added after CI exposed missing dependencies. No lockfile was found during this audit; pin dependencies with the chosen package manager and test clean install. |
| App Store submission | Not ready/verified | Requires successful signed build, device QA, complete assets, privacy/terms, accurate data disclosures, review access, policy-compliant payment handling and no unresolved release blockers. |

## 4. Known defects and previous fixes

- Missing direct dependency `@expo/vector-icons` was discovered because Music imports it; adding it exposed missing peer dependency `expo-font`. Both were added.
- API URL normalization and timeout-timer scope had previous fixes. Re-test API error/timeout paths when the dedicated backend is available.
- Fake Google sign-in callback was removed; do not describe social sign-in as supported unless a real provider flow is implemented and tested.
- Shared music player, secure-playback request scaffolding, compact create menu, and welcome-first flow are on the working branch/PR; their presence is not physical-device verification.
- `main` and `music-compact-create-sheet` differ. PR #2 remains open/draft and unmerged; do not assume main contains the working-branch changes.
- Vercel deployment can be READY while only serving the static HTML mirror. It does not mean the Expo app was built/deployed there.

## 5. Web preview requirements

The web preview must be a **secondary mirror of the native app**, not a substitute for it.

1. Use the same Kilode design tokens: `#0D0D10` background, `#18181C` cards, `#2A2A30` borders, gold `#D4AF37` / `#E5C158`, white and muted gray. Green is for the logo dot/accent only, not a generic green theme.
2. Make the first screen welcome-first and use the same approved logo and bundled video/image assets as iOS.
3. Match the native navigation, compact slide-out drawer, slim create popover, 5-item bottom dock and content density.
4. Mirror the real Home hybrid feed and each system surface without implying seed/demo items are live.
5. Remove guest greeting copy the user rejected; remove duplicate page headings and old layout elements when corrected in native.
6. Each preview control must either work in the preview or be clearly marked as a visual-only mock.
7. Label the preview as a browser mirror; only a signed build on an actual iPhone can verify native behavior.
8. Avoid a separate hand-maintained design drift: update preview and native from one explicit feature/status checklist and compare screen-by-screen.

## 6. Ordered remediation queue

1. [ ] Measure complete repository inventory: recursively enumerate tracked files and line counts; calculate audit coverage by file/line, excluding generated/vendor files and clearly stating denominator.
2. [ ] Run full static/code audit by domain: entry/navigation, auth/session, API/data, each screen, storage, media/audio, permissions, build config, dependencies, accessibility and security. Record each finding with severity, file/line, reproduction, owner/next action and verification.
3. [ ] Integrate approved transparent metallic logo and bundled cinematic welcome assets; correct app icon/splash and confirm cold launch.
4. [ ] Obtain a green CI run for exact PR head; keep PR #2 unmerged until its changes are reviewed and validation is green.
5. [ ] Resolve EAS/Apple signing and install a physical-device preview; complete a recorded iPhone smoke test.
6. [ ] Provision the dedicated backend and define API contracts; test auth, feed, posts, music and all enabled systems against it.
7. [ ] Build missing server systems in dependency order: identity/roles → content/feed → uploads/media → search/notifications/chat → events/market/jobs/communities/cinema/creators → ads/Push Link → payments/artist ledger/payouts.
8. [ ] Complete server-side deletion, recovery, moderation, privacy and abuse controls.
9. [ ] Add automated and manual test coverage; test offline, slow network, expiry, failures, safe areas, accessibility and relaunch.
10. [ ] Align web mirror to native only after the screen and assets are approved; then compare every screen and interaction.
11. [ ] Complete release checklist, TestFlight review and App Store submission only after all blockers are resolved.

## 7. Audit discipline

For every new finding, add: severity (P0/P1/P2), system, exact file/line, evidence, user impact, required fix, test, status, commit and CI run. Mark an item done only after implementation + passing automated checks + the relevant flow tested; backend/device-dependent work additionally requires live backend/device evidence.
