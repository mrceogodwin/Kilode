# Kilode Music — product and native implementation architecture

This is the product contract for the dedicated Kilode native backend. It is not a claim that payments, uploads, moderation, or royalties are already live. The app must not use Kilode-v2, kilode-nine, or the Vercel preview as its production backend.

## 1. Music is its own architecture
Music has its own discovery surface and navigation: Home, Discover, Charts, Artists, Genres, Releases, Search, player/queue, artist pages, release detail, upload studio, distribution status, earnings, purchases/library, and promotion. The shared Kilode Home is a discovery feed, not the Music screen. Music items on Home must deep-link to the same canonical track/release record and open its Music detail/playback destination.

## 2. Account-specific workspaces
- Listener/member: discover, search, follow artists, save tracks, listen to permitted previews, buy tracks/releases, view purchases and receipts, manage subscription where offered.
- Artist: artist profile, upload audio and cover art, create single/EP/album, metadata and credits, explicit-content flag, rights/ownership declaration, save draft, submit for review, inspect processing/review/rejection status, publish when approved, create Push Link campaigns, and view verified performance/earnings.
- Label/distributor: only if enabled as a distinct account kind after authorization rules are designed. Manage an authorized roster, releases, metadata, delivery status and split/rights records. Never infer label privileges from an artist account.
- Admin/reviewer: server-authorized review, takedown, rights dispute, moderation, and audit. Never expose these powers through ordinary client profile fields.

## 3. Upload and release workflow
1. Artist chooses upload; native file picker selects an allowed audio file and cover art.
2. Validate file type/size on device for feedback and again on trusted server. Upload into private storage at ARTIST-USER-ID/RELEASE-ID/FILENAME.
3. Create draft metadata (title, primary artist, collaborators/credits, genre, language, release type/date, lyrics/explicit flag, price/streaming availability, territory and rights declaration).
4. Show real upload progress; recover safely on interruption. Do not claim success before storage confirms the upload.
5. Save as draft or submit for review. Track status is draft → submitted/processing → published or rejected; review/takedown is server controlled.
6. Published catalogue queries show only published tracks. Draft audio stays private. Playback uses a short-lived signed URL issued after checking publication, territory and entitlement.

## 4. Listener discovery and playback
- Search tracks, artists, releases and genres; filters and charts should come from real backend data, not hard-coded chart claims.
- A single persistent player supports play/pause, seek, progress, queue, next/previous, artwork, release metadata, background/lock-screen controls and recoverable network errors.
- Track detail shows artist, release, credits, release date, explicit label, price or access rules, share, save, follow and Push Link campaign landing details.
- Never show a fake play count, fake chart rank, fake follow state, or “playing” success when no playable audio URL exists.
- The app can show demo/preview content only when clearly identified as preview content; never mix it into live charts or earnings.

## 5. Monetisation and payments
- Support per-track and per-release purchases and an optional subscription product after pricing, rights and provider terms are confirmed.
- A trusted server/Edge Function creates a payment intent with a configured provider. Client displays provider checkout and returns to a pending state.
- A signed provider webhook verifies the transaction, reconciles amount/currency/reference, prevents replay/duplicate processing, marks payment status, grants entitlement and writes an auditable ledger event.
- Client cannot set a payment to succeeded, grant an entitlement, alter royalty totals, or activate a paid campaign.
- Purchased items remain available in Library/Purchases according to the product's defined offline and territory rules. Provide receipts and clear failed/pending/refunded states.
- Define artist payouts, splits, minimum thresholds, chargebacks, refunds, tax/compliance and reconciliation before claiming “earnings” is production-ready.

## 6. Push Link — advanced artist promotion
Push Link is a campaign tool, not a decorative promo button. Artist chooses a track/release, campaign goal (streams, reach, engagement, followers or pre-saves), target audience/territories, placements (Music, Home, Socials, Events or other approved surfaces), budget, schedule and duration. The UI previews the ad/placement and clearly marks sponsored content.
- Create campaign as draft; validate budget and target rules; initiate payment; keep pending until webhook verification.
- After verified payment and policy/review checks, schedule/activate campaign. Pause/resume and stop controls must reflect server state.
- Report verified spend, reach, impressions, clicks, qualified listens, saves/follows and conversion where instrumented. Do not fabricate campaign results.
- Enforce frequency caps, targeting/privacy rules, creative review, fraud filtering and refund/unused-budget policy. Never allow a client to write its own metrics or activate unpaid campaigns.

## 7. Data model and trust boundaries
Migration 002_music_platform.sql establishes initial releases, track lifecycle fields, purchases/entitlements, payment records, Push Link campaigns, play events and private audio storage policies. It is schema groundwork only. It does not itself provide payment checkout, webhook verification, transcoding, signed public playback, moderation operations, royalty settlement or analytics aggregation. Those require trusted Edge Functions and provider configuration.

## 8. Native UI design direction
Keep Kilode's existing compact, native iOS shell and branded charcoal surfaces, white typography and green accent. The Music architecture should feel like a polished streaming product without copying another service: strong artwork, compact track rows, editorial discovery, round artist thumbnails, restrained borders, persistent mini-player above the bottom dock, and full-screen now-playing. Artist tools live in the Artist workspace rather than cluttering listener discovery. Use clear loading, empty, offline, pending, failed and success states.

## 9. Release gates
Do not mark Music complete until tests verify: artist-only upload permissions; private draft storage; actual audio upload/download; release creation and review transitions; published-only discovery; signed playback; entitlement-gated purchase playback; provider webhook idempotency/reconciliation; Push Link payment and activation; real analytics; and iOS navigation/keyboard/safe-area behavior. A passing TypeScript or web-export workflow does not prove these end-to-end capabilities.
