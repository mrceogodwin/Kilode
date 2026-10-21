# Kilode Native iOS — Master Audit & Remediation Register

**Last reviewed:** 2026-10-21  
**Repository:** `mrceogodwin/Kilode`  
**Audit branch:** `music-compact-create-sheet`  
**Current PR:** [#2 — Music search and compact creation menu](https://github.com/mrceogodwin/Kilode/pull/2)  
**PR head checked:** `dddcc01649030598e95856eb9432f8b3977adb3d`  
**Product source of truth:** Expo React Native app. The Vercel HTML mirror is secondary and is not proof of native behavior.

## 1. Audit coverage and code size — be precise

- GitHub repository metadata reports **5,726 KB repository size**. This is GitHub's repository-size figure, **not** a measured source-code-only size.
- The recursive Git tree is complete (`truncated=false`): **69 tracked files**, **427,924 bytes (~418 KiB) of current tracked file content**, and **44 TypeScript/JavaScript source files totaling 7,328 lines**. A 49-file code/config inventory totals 7,489 lines. These counts exclude Markdown docs and the HTML preview from the source-line total. GitHub's reported 5,726 KB repository size includes repository/history overhead and is a different metric.
- **Content retrieval/line-count coverage:** 44/44 tracked TS/TSX/JS source files were retrieved and line-counted during this pass. This is not equivalent to 100% semantic line-by-line audit: the complete source still needs systematic logic, edge-case, security and runtime review. Do not describe the app as 100% audited.
- The tracked tree contains no package lockfile. The `assets/` directory contains only `.gitkeep` (0 bytes). `app.json` has splash background settings but no splash image or app icon path, and Android adaptive icon has only a background color. These are concrete release-preparation gaps.
- Targeted core inspection includes `KilodeRoot.tsx`, all 15 screen files, all 12 UI component files, all 9 `lib/` modules, theme/data files, app/build config, preview and audit docs. Full semantic review is still in progress.
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


## 8. Measured repository inventory — 2026-10-21

- Recursive tree SHA: `77b4d39d9bff50ae2c85efb5375d6982e20b2e77`; tree was not truncated.
- Tracked files: **69**.
- Tracked current file content: **427,924 bytes (~418 KiB)**.
- TypeScript/JavaScript source files: **44**, **7,328 lines** (line count includes source files, not Markdown documentation).
- Code/config inventory counted: **49 files**, **7,489 lines**.
- Full tracked source/docs/config list: 69 files. Full semantic audit completion: **not yet achieved**. A truthful percentage of code lines semantically reviewed cannot yet be assigned; line counts are not a proxy for audit coverage.
- Files retrieved and line-counted in this pass: 44/44 tracked TS/TSX/JS source files. Next review must inspect logic in each module and record findings, not just count the files.
- Dependency/build risk: `package.json` uses Expo SDK `~51.0.28`, React Native `0.74.5`, and `expo-av ~14.0.7`. This is an older stack for a 2026 release. Schedule a compatibility-first upgrade review and migrate audio APIs deliberately; do not mass-upgrade without Expo Doctor, bundle export, and real-device regression tests.
- Release asset configuration issue: `app.json` does not declare an app `icon` or splash `image`; Android `adaptiveIcon` has a background color but no foreground image. This matches the missing-assets finding above.
- CI status for this exact register update/commit: not yet verified. Previous green CI runs apply to their own SHAs only.


## 9. Follow-up code inspection — 2026-10-21

### Confirmed from source

- `lib/auth.tsx` stores session data through AsyncStorage. Review whether production bearer tokens are persisted there; prefer the platform-appropriate secure credential store for sensitive tokens and test logout/session revocation. This is a security review item, not yet a proven exploit.
- `lib/auth.tsx` explicitly returns a backend-not-connected error when `API_BASE` is empty. This is expected fail-closed behavior; it confirms live sign-in cannot work until the dedicated backend is configured.
- `lib/moderation.ts` explicitly describes report/block storage as local-only and notes reports are not delivered to staff and blocks are not enforced across devices.
- `screens/Auth.tsx` loads welcome hero art from Unsplash at runtime. This creates network dependency for the launch experience and does not satisfy the requested bundled cinematic montage/approved logo.
- `app.config.js` passes `EXPO_PUBLIC_API_URL` through to runtime config but defaults it to an empty string. No legacy API fallback was found in this configuration path.
- Shared button/tab components include some accessibility roles and labels; coverage still needs a full accessibility audit across all screens and modal/drawer controls.
- The repository's prior `docs/KILODE_NATIVE_TEST_REPORT.md` contained an outdated recommendation to deploy Kilode-v2 as the backend. It has now been marked historical and corrected to the current decision: use a dedicated Kilode backend, separate from the native app's web preview.

### New P1/P2 work items

- [ ] **P1 — Secure session storage review:** trace all session/token fields written by `lib/auth.tsx`, confirm whether sensitive server credentials are persisted in AsyncStorage, and migrate sensitive tokens to secure storage if applicable.
- [ ] **P1 — Expo SDK lifecycle review:** plan an incremental upgrade from Expo SDK 51 / React Native 0.74 and review `expo-av` compatibility. Establish target SDK, migration notes and regression coverage before changing versions.
- [ ] **P1 — Runtime launch asset dependency:** bundle approved welcome artwork locally; no remote Unsplash image should be required to render the entry screen.
- [ ] **P2 — Accessibility pass:** audit every screen, button, modal, drawer, create popover and tab for labels, roles, selected/disabled state, focus order, VoiceOver and dynamic type.
- [ ] **P2 — Documentation consistency:** keep the master register authoritative; label historical investigations and make sure feature-status, test, App Store and backend docs agree on the dedicated-backend decision.

### Latest CI state

- The register inventory update commit `08436abf8ab464e7883d74f36f9d13a899626c35` had native validation run `39626974658` in progress when checked. Do not call it green until the workflow completes successfully.
- The follow-up historical-document correction commit is `9c5273290e765e1a9eecb6d3fe3634bbb4d267ff`; its exact-SHA CI result still needs confirmation.


## 10. Follow-up audit — auth/API flow review (2026-10-21)

### Validation confirmation

- The register update at `803c0f80540f9b3a675efb3cb9f0dac6be79647b` passed GitHub Actions run `39627140004`.
- The historical backend report correction at `9c5273290e765e1a9eecb6d3fe3634bbb4d267ff` passed run `39627054581`.
- The inventory commit passed run `39626974658`; initial register creation passed run `39625635713`.
- These are docs/native CI validations, not a physical-device build or end-to-end backend test.

### Additional confirmed findings

- **P1 — Server session revocation absent in native sign-out path:** `lib/auth.tsx` clears local React state and removes the locally persisted session, but does not call a server sign-out/revocation endpoint. The dedicated backend must define revocation/expiry semantics; implement remote revocation if supported, and ensure invalid/expired tokens are rejected by the server.
- **P1 — Token persistence remains an unresolved security decision:** the full session object, including its `token`, is JSON-serialized into AsyncStorage at `lib/auth.tsx`. This is confirmed source behavior. Move sensitive bearer tokens to SecureStore (or another reviewed secure credential store), keep non-sensitive profile fields separate, and test migration, logout, reinstall and session expiry.
- **P1 — Authentication contract is assumed, not validated against a live backend:** native auth posts to `/api/auth/sign-in/email` and `/api/auth/sign-up/email`, expects `data.token` or `data.session.token`, and maps handles to a synthetic `@users.kilode.ng` email when the entered identifier is not an email. The dedicated backend must explicitly support that contract or the client/backend must be updated together. Do not treat it as working until tested against the actual service.
- **P1 — Sign-up uses a generated email namespace:** registration submits `<username>@users.kilode.ng`, not a user-verified email address. Decide and implement the identity model (username-only, verified email, phone, or combination) before launch; add uniqueness, verification, recovery and abuse controls on the server.
- **P2 — Generic API helper does not send auth credentials:** `tryLiveJson` in `lib/api.ts` sends only Accept and User-Agent headers. Current callers are public read endpoints (takes, chart, track catalogue), but future protected endpoints must use the authenticated helper and server-side permission checks. Keep the distinction explicit in API contracts.
- **P2 — Mock mode can report successful mock results:** `FORCE_MOCK` intentionally returns `source: "mock"` with `ok: true`; UI must display this as sample/offline content, never as a live publish or successful server write. Audit every consumer of `ApiResult.source` and ensure mock mutations cannot be mistaken for production success.
- **P2 — Session persistence failures are swallowed:** `persist` catches storage errors without surfacing them. A server login can return success even if local session persistence fails, so the user may be logged out on relaunch. Decide whether this should become a visible warning/error and add tests for storage failure.
- **P2 — Guest sessions are persisted like other sessions:** a guest marker is written to AsyncStorage and restored on relaunch. This is intentional guest continuity, but ensure all protected APIs reject the literal `guest` token and all guest-created content has a clear non-persistent/demo policy.
- **P2 — Account-kind trust boundary:** client-side `kind` can be chosen or mapped from response data. The server must determine authoritative roles/permissions and must not trust client-supplied account kind for privileged operations.
- **P2 — Auth contract has no password recovery or verification methods in AuthCtx:** the current auth context exposes guest, sign-in, sign-up and sign-out only. Add verified recovery and account/email verification flows before production release.

### Tests required before closing these findings

1. Unit tests for sign-in/sign-up response parsing, empty/malformed responses, timeout, offline and non-JSON server responses.
2. Secure token storage migration and failure tests.
3. Expired/revoked token behaviour and logout on two devices.
4. Account-kind tampering tests against the backend.
5. Live contract test against the dedicated API for sign-up, sign-in, session, recovery and verification.
6. Confirm public catalogue endpoints expose no private user data and protected endpoints reject guest/invalid tokens.


## 11. Follow-up audit — root navigation and account-type flow (2026-10-21)

- **Verified positive finding:** `screens/Auth.tsx` has an account-type selector populated from `ACCOUNT_KINDS`, exposes accessibility labels/selected state, and passes the selected kind to the sign-up handler. The current working branch does include account-type selection at registration. The remaining concern is authoritative server-side role validation and whether each kind gets the correct independent tools; do not mark the selector itself as missing on this branch.
- **P1 — Sign-in role/account-kind authority needs verification:** the sign-in form calls `onSignIn(handle, password)` without sending the currently selected kind. The client maps `data.user.kind` or a default to its local session. The backend must return the authoritative account kind and enforce it for every protected endpoint; UI selection must never grant privileged artist/business/admin access.
- **P2 — Native app startup uses the welcome screen while auth is loading:** `KilodeRoot.tsx` returns `AuthScreen` when `authLoading` is true, then transitions to the signed-in app when persisted auth resolves. This meets the welcome-first visual requirement, but must be tested on a physical device for flicker, duplicate welcome display and guest/session transition.
- **P2 — Boot loading only applies after a session is present:** `KilodeRoot.tsx` checks `!session` before the feed/music boot spinner. Test signed-out, guest, valid-session, expired-session and malformed-stored-session paths so users see the right state and never see stale private content.
- **P2 — Native app/splash colours are not fully aligned:** `app.json` uses `#0B0B0F` for splash/adaptive-icon background while the design token is `#0D0D10`. Align only when final splash/icon assets are ready, then validate the real native launch screen.
- **P2 — iOS permissions and capabilities require product review:** `app.json` declares camera/photo library usage strings and audio background mode. Verify each capability is used and justified, test permission denial/revocation, and complete required App Store privacy disclosures. Background audio should remain only if supported by the final music implementation.
- **Source review coverage update:** in this pass I inspected the complete auth provider and relevant navigation gates in `KilodeRoot.tsx`, plus the account-type selector in `screens/Auth.tsx` and API request helper behavior in `lib/api.ts`. Semantic audit is still in progress across the remaining source files.


## 12. Follow-up audit — music, creator tools, safety and account settings (2026-10-21)

### Confirmed implementation boundaries

- **Music catalogue and Top 100:** `screens/Music.tsx` distinguishes live catalogue from preview catalogue and labels the Top 100 as preview/not official when a verified chart snapshot is unavailable. The chart client rejects malformed, stale, duplicate-rank and inconsistent-movement snapshots. This is good anti-misrepresentation behavior; it does not prove a live chart feed exists.
- **Playback:** the native flow requests a secure playback link and refuses an empty, invalid or insecure URL. Physical audio playback, expiry handling, analytics and real catalogue availability still need live service/device tests.
- **Artist upload:** `screens/MusicUploadSheet.tsx` has upload-ticket and recovery scaffolding, including account-scoped pending recovery. The service is not connected in this repo state; validate ticket expiry, upload ownership, file type/size/duration, retry/cancel cleanup, duplicate uploads, and publication status against the dedicated backend.
- **Artist release planner:** `screens/ArtistReleasePlanner.tsx` explicitly stores planning drafts on the device and states they do not upload, distribute or publish music. This must remain clearly labelled as a local planning tool until server persistence/distribution exists.
- **Artist earnings:** `screens/ArtistEarnings.tsx` explicitly states the payment ledger is not connected and avoids displaying invented balances. Fan support, purchase entitlements, royalty accounting, reconciliation and payouts remain release blockers.
- **Push Link:** `lib/pushLink.ts` and `screens/PushLink.tsx` only validate/classify destinations and generate a draft preview. The screen explicitly says it has not been published. Campaign submission, paid reach, billing, analytics, attribution and fraud controls remain unimplemented.
- **Chat:** `screens/Chat.tsx` updates local preview thread state and states the messaging backend is not connected. New-chat selection and attachment actions are preview placeholders. Do not market it as live or secure messaging until server persistence, delivery, access control, abuse reporting and notification behavior are built.
- **Report/block:** `lib/moderation.ts` is an AsyncStorage-only local store. The UI acknowledges reports are only saved on this device. This does not create a report for moderators or enforce a block on another device/account.
- **Account deletion:** `screens/Settings.tsx` explicitly says the app cannot delete an account because the secure server deletion endpoint is not connected. It does not falsely claim deletion happened; the actual end-to-end deletion flow remains a hard launch blocker.
- **Privacy/terms:** settings references `https://kilode.ng/privacy` and `https://kilode.ng/terms`, with an explicit reminder to publish them before App Store submission. Their public availability and contents have not been verified in this source audit.

### Additional release gates

1. **P0 — Safety workflows are not operational:** reporting and blocking are local-only. Implement authenticated report submission, staff review queue, moderation actions, appeals, cross-device enforcement, and abuse-rate limits before enabling public user-generated content.
2. **P0 — Account deletion is not end-to-end:** add a server endpoint/workflow that revokes sessions and deletes or de-identifies user data according to the published retention policy; cover associated posts, uploads, messages, purchases and legally required records. Provide clear in-app confirmation and verified completion state.
3. **P1 — Messaging is a visual/local preview:** implement authenticated thread membership, server persistence, message delivery states, pagination, abuse controls, notification preferences, and attachment storage/security before claiming real chat.
4. **P1 — Music upload has no verified end-to-end production path:** connect signed upload-ticket issuance, direct HTTPS upload, server-side verification/processing, moderation/rights workflow, metadata persistence, publish state, and failure recovery.
5. **P1 — Top 100 data requires trusted provenance:** the UI correctly distinguishes preview from official chart data. Production charts need documented time window, ranking methodology, deduplication, anti-manipulation signals, auditability and a signed/validated backend snapshot.
6. **P1 — Privacy and terms URLs are unverified:** confirm they return valid public pages on mobile and desktop and match actual data collection, analytics, moderation, payments and deletion behavior. Add support contact and all store disclosures.
7. **P2 — Preview controls need a complete interaction audit:** the chat attachment and new-chat actions are placeholder notices; verify every tappable element in each system either completes its labelled action or is explicitly marked as unavailable/preview.

### Honest status rule

UI completeness is not service completeness. Until backend endpoints and device behavior are tested, label music catalogue, charts, chat, uploads, Push Link, earnings, moderation and account deletion according to the boundaries above. Do not mark them production-ready based solely on source structure or CI passing.
