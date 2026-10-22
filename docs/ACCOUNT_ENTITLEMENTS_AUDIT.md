# Kilode account capability and monetisation matrix

Status: architecture specification for implementation. It does not claim the listed screens, backend APIs, billing, or permissions are already live.

## Invariants
- Keep the existing 10 public account-kind IDs unchanged: member, artist, writer, advertiser, cinema, job_poster, job_seeker, vendor, renter, brand.
- Account kind answers "what does this account do?"; plan answers "which paid benefits are active?"; permission answers "what may this identity do right now?" These are separate concepts.
- Do not add Creators or Communities as separate account kinds or top-level systems. Both live inside Socials.
- Super Admin/staff access is a separately granted, audited privilege, never a public registration choice and never purchasable.
- Free users must retain meaningful core participation. Do not invent plan prices, upload quotas, or entitlement grants in client code.
- The backend is authoritative for protected actions, payments, quotas, ownership, moderation and entitlements. UI visibility is not authorization.

## Public account kinds

| ID (preserve) | Primary workspace | Core capability family | Potential paid benefits (not approved pricing) |
|---|---|---|---|
| member | My Space + Socials | profile, discover, post, follow, comment, join communities | optional enhanced personal tools; never require subscription for basic participation |
| artist | Music + Socials | artist profile, rights declaration, submit/manage own releases, connect with fans | release credits, advanced catalogue/analytics, scheduling, team tools, Push Link promotion |
| writer | Media + Socials | author profile, draft/edit/submit content, manage own articles | advanced publishing tools, distribution insights, scheduling |
| advertiser | Ads/Business | create campaigns, manage creatives and budgets, view permitted reports | higher campaign limits, advanced reporting and business tools |
| cinema | Cinema + Socials | submit/manage eligible film listings or content, rights and availability metadata | catalogue tools, campaign tools, performance analytics |
| job_poster | Jobs | create/manage vacancies, review applicants where authorized | more active listings, recruiting tools, reporting |
| job_seeker | Jobs + My Space | career profile, save/search jobs, manage own applications | optional enhanced career tools; never sell guaranteed jobs or interviews |
| vendor | Market | manage own product listings, stock and seller enquiries/orders when supported | larger listing allowance, seller analytics and promotion |
| renter | Rent/space listings | manage own available spaces/properties and enquiries | larger listing allowance, listing promotion and insights |
| brand | Ads/Business + Socials | organisation profile, authorized brand content and business presence | business analytics, campaign collaboration and team tools |

The core capability families above are product intent, not evidence that every capability currently works. Only enable actions that have working backend support and tested authorization.

## Shared systems, not extra account kinds
- **Socials:** feed, creators, communities, follows, posts and conversations; use account permissions to control actions, not separate public kinds for creators or community members.
- **Events:** event creation/management should be granted through explicit organizer capability/verification rather than silently adding an eleventh account kind. Confirm ownership and event permissions server-side.
- **Push Link:** separate paid campaign workflow for eligible tracks, posts, events, media or profiles. A paid campaign does not guarantee reach, streams, sales or approval.
- **My Space:** account-aware dashboard and tools derived from kind + verified capabilities + active entitlements.
- **Search, notifications, chat, reports and safety:** shared systems with role-aware controls and server authorization.

## Entitlement model

Prefer stable capability keys rather than scattered checks against plan labels. Candidate keys to refine with the API:
- `socials.post`, `socials.community.create`, `socials.community.moderate`
- `music.release.submit`, `music.releaseCredits`, `music.analytics.advanced`
- `media.publish.submit`, `media.analytics.advanced`
- `ads.campaign.create`, `ads.campaign.activeLimit`, `ads.analytics.advanced`
- `cinema.catalogue.manage`
- `jobs.vacancy.create`, `jobs.activeLimit`, `jobs.applicant.manage`
- `market.listing.manage`, `market.listingLimit`, `rent.listing.manage`
- `promotion.campaign.create`, `promotion.budgetLimit`
- `workspace.team.manage`

These are proposed names, not existing API contracts. Finalize naming and quota semantics once the dedicated backend API/schema is inspected and versioned. Never treat a count-like quota as a boolean permission.

Each entitlement needs: owner account/user, capability key, source (base/plan/credit/admin grant), quota and period where applicable, start/end, status, audit metadata, and a deterministic precedence policy. Paid grants must be derived from verified provider events or trusted admin actions, not the app.

## Required authorization and billing rules
1. Enforce every protected action on the server; repeat authorization at the API boundary even if the UI hides the control.
2. Check ownership: one artist cannot edit another artist's release; one employer cannot access another employer's applicants; one seller cannot alter another seller's listings.
3. Make quota reservation atomic and idempotent. Concurrent submissions must not overspend credits or limits.
4. Separate subscription renewal from one-off credits and Push Link campaign spend.
5. A failed or duplicated payment callback must not duplicate entitlements or credits. Refunds/chargebacks must reconcile ledger state and audit records.
6. Subscription expiry must not silently delete user content. Define grace periods, read-only behavior and retention policy before shipping.
7. Keep staff/admin overrides explicit, least-privilege, reasoned and auditable.
8. Unknown/missing plan state must fail safely for paid capabilities while preserving free core features.
9. Account-kind changes must be an explicit audited migration; never silently change kind to bypass permissions or billing.
10. Do not advertise a capability as available until the UI, API, persistence, moderation, failure states and tests are complete.

## Implementation order
1. Inventory each account's current native screens and actual API operations; mark each implemented, partial, seeded/local-only, or absent.
2. Agree capability keys, quotas, free baseline, paid plan contents, credit rules, prices and cancellation/refund policy.
3. Implement backend schema, authorization helpers, entitlement ledger and payment webhook reconciliation first.
4. Build native account-specific dashboards and upgrade screens against those contracts, preserving existing navigation and Kilode visual tokens.
5. Add automated authorization/quota/payment tests, then run iOS bundle validation and device tests.
6. Verify the exact commit and live test environment before marking any item complete.

## Acceptance checklist
- [ ] All 10 existing account-kind IDs remain backward compatible.
- [ ] Each kind has a documented free baseline and explicit allowed actions.
- [ ] Account kind, plan, capability and staff privilege are separate in types and persistence.
- [ ] Creator and community tools remain under Socials.
- [ ] Server-side ownership, quota and entitlement tests pass.
- [ ] Payment, refund, cancellation, expiry, retry and concurrency tests pass.
- [ ] No UI claims a seeded/local-only feature is live.
- [ ] Native iOS flow is tested on a real device; automated bundle success alone is not device verification.
