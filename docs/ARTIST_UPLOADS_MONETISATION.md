# Kilode artist uploads and monetisation architecture

Status: product/engineering proposal; not a claim that uploads, checkout, subscriptions, royalties, or external distribution are implemented.

## Product rule
Keep core participation accessible. Monetise resource-intensive professional services transparently. Do not make an artist pay merely to create a profile, discover music, or participate in Socials. Distinguish a Socials audio post from a formal Music release.

## Separate three products
1. **Socials media posts** — ordinary posts, short audio/video, stories, and promotion surfaces. Govern these by general account limits and content rules; they are not paid music-distribution releases.
2. **Kilode Music hosting/release** — an artist submits a track for hosting and discovery inside Kilode Music. This needs upload validation, rights declarations, metadata, moderation/copyright review, storage/transcoding, and an explicit release status.
3. **External digital-store distribution** — optional delivery to services outside Kilode (for example Spotify or Apple Music). This is a separate product requiring distribution partners, contracts, identifiers, store delivery, takedown handling, royalty reporting, and support. Never imply Kilode can deliver to external stores until that integration exists.

## Recommended monetisation design
Use a hybrid model, not one compulsory fee for every upload:
- **Free artist entry:** profile, discovery, and basic Socials participation remain available.
- **Limited introductory Music allowance:** consider a clearly disclosed, capped allowance for eligible first-time artists/releases, subject to storage, review, rights, abuse, and operational costs. The product owner must choose the actual limit before implementation.
- **Pay-per-release / upload credits:** artists who release occasionally can purchase a clearly scoped release credit. A credit must say what it covers and whether it expires. Do not charge repeatedly for retries caused by Kilode errors.
- **Artist subscription plans:** plans include a defined number of release credits or monthly upload allowance plus stronger tools (analytics, catalogue management, scheduling, team tools, and support). Do not promise unlimited uploads unless abuse controls and infrastructure economics support them.
- **Additional services:** paid promotion (Push Link), optional priority review, or external distribution may be priced separately. Priority review is not guaranteed approval or placement; promotion does not guarantee streams.
- **Labels/managers:** a future multi-artist plan can include roster management and pooled credits, with explicit permissions and ownership boundaries.

No price, allowance, royalty split, or plan limit is approved by this document. Validate pricing against actual infrastructure, payment costs, moderation workload, market research, and Nigerian payment expectations before launch.

## Upload/release state machine
Use explicit server-owned states such as:
draft -> uploaded -> processing -> review_pending -> approved -> scheduled/published
with recovery/terminal states rejected, failed, withdrawn, takedown_pending, and taken_down.

A client-side success toast is not proof of a stored or published release. Show upload progress, resumable/retry behavior, processing status, review result, and clear next steps. A failed upload must not consume a credit unless a clearly disclosed and defensible policy applies; platform-caused failures should restore the credit.

## Purchase and entitlement safety
- Backend is the source of truth for plan, credits, upload allowance, payment status, release ownership, and publication permission.
- Verify payment callbacks/webhooks server-side; make checkout and credit grants idempotent.
- Never grant entitlements from a client-only flag, local storage, or a success redirect.
- Reserve a credit atomically before accepting a release; settle or return it according to the release outcome. Prevent double submissions and concurrent overspending.
- Display currency, total charge, billing interval, included credits, renewal/cancellation terms, and refund/support rules before confirmation.
- Support pending/failed payments, refunds, chargebacks, expired subscriptions, cancellation, and renewal failure without losing an artist's catalogue.
- A lapsed subscription must not silently delete released music. Define a fair grace period and disclose post-cancellation hosting/distribution rules.
- Keep an audit trail for purchases, credit ledger entries, admin adjustments, moderation decisions, and release state changes.
- Verify rights to masters, compositions, samples, artwork, and collaborator contributions. Provide copyright complaints and takedown handling.
- Do not promise earnings, playlist placement, approval, or external-store delivery.

## Account plan architecture
Keep account kind separate from subscription tier and permissions. An artist can be on Free, Artist, or a future Label/Team plan without changing their account kind. Use capability/entitlement checks such as music.upload, music.releaseCredits, music.analytics.advanced, and promotion.campaign rather than scattering plan-name checks through screens.

Use the same pattern for other Kilode account types: core capabilities, plan entitlements, usage quotas, and separately priced actions. Super Admin is a privileged staff role—not a public account type or purchasable plan.

## Native iOS and App Store review gate
Before implementing checkout, decide whether each paid item is a digital feature/content consumed in the app, a service delivered outside the app, or a mixed product. Check current Apple App Store Review Guidelines and regional storefront/payment requirements for the exact purchase flow. Do not assume web checkout or external payment links are permitted for every digital entitlement. Design for purchase restoration, account-based entitlement sync, clear terms, and support.

## Acceptance checklist
- [ ] Product owner approves free allowance, per-release offer, subscription tiers, credits, prices, currencies, and refund policy.
- [ ] Music hosting is distinguished from external-store distribution.
- [ ] Backend schema and APIs define plans, entitlements, credit ledger, releases, payment events, and audit records.
- [ ] Duplicate requests, webhook retries, failed uploads, refunds, subscription expiry, and concurrent uploads are tested.
- [ ] Rights declaration, moderation, copyright report, and takedown flow are ready.
- [ ] Native iOS upload, progress, review status, purchase, restore, and account switching are tested on device.
- [ ] Automated checks pass on the exact commit; do not claim production readiness until live payment and backend end-to-end tests pass.
