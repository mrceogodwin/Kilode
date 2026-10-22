# Kilode account entitlements — cross-account design

Status: implementation contract for product planning. This document does not claim that paid plans, checkout, or server authorization are implemented.

## Non-negotiable rules
- Keep the existing ten public account-kind IDs stable. Do not add Creators or Communities as account kinds; both are sections inside Socials.
- Account kind answers “what workspace is relevant?” A subscription/plan answers “what paid allowance is active?” A staff permission answers “what privileged operations may this identity perform?” These are separate dimensions.
- Every account kind can participate in ordinary Socials. Core discovery and basic participation must not be held hostage by an upgrade.
- Client-side capability maps only guide navigation. Every protected action must be checked by the trusted backend against identity, ownership, account kind, plan, usage quota, payment state, moderation status, and staff permissions.
- Never invent prices or imply a payment, publishing, distribution, listing, or campaign completed without a verified server result.

## Cross-account matrix

| Account kind | Core/free participation | Workspace capability family | Possible paid upgrades (subject to pricing and implementation approval) |
|---|---|---|---|
| member | Home, Socials, community participation, profile, discovery | job discovery and personal tools | optional convenience/personalisation features; no paywall on core participation |
| artist | profile, Socials, music discovery, basic fan connection | music release management | release credits, higher release allowance, advanced catalogue/analytics, team tools, separately purchased Push Link |
| writer | profile, Socials, reading/discovery | article/story authoring | publishing workflow, scheduling, advanced analytics, professional author tools |
| advertiser | browse and ordinary Socials | campaign management | campaign capacity, reporting, audience tools; campaign spend is separate from subscription |
| cinema | profile, discovery and Socials | film/cinema content management | catalogue/publishing tools, reporting and promotion; rights review remains mandatory |
| job_poster | job discovery and Socials | vacancies and applicant management | more active listings, recruitment workflow and reporting |
| job_seeker | profile, job discovery and Socials | career profile and application tracking | optional advanced career tools; never guarantee employment or placement |
| vendor | browse, Socials and marketplace discovery | product listing and seller tools | higher listing capacity, seller analytics and paid product promotion |
| renter | browse and Socials | space/property listing management | additional active listings, listing promotion and professional listing tools |
| brand | profile, Socials and discovery | business workspace and campaign tools | team seats, reporting and campaign tools; media spend is separate |

This table defines intended product boundaries, not current availability. All plan allowances, prices, feature limits and billing periods remain undecided until explicitly approved and validated.

## Charge types must remain distinct
1. **Subscription:** recurring access to named professional tools/quotas. Must disclose price, billing interval, renewal, cancellation and what happens on expiry.
2. **Usage credit / pay-per-action:** e.g. an eligible Music release credit or a separately defined listing/service action. Reserve and settle credits atomically; do not charge twice for platform-caused failures.
3. **Campaign/media spend:** a budget for an approved Push Link or advertising campaign. It is not an upload fee or a subscription; report spend and delivery separately.
4. **Marketplace or transaction fee:** only if an actual transaction flow, terms, refunds and disputes exist.
5. **External distribution:** separate product requiring real distribution partnerships, rights handling, takedowns and reporting.

Do not bundle these charges vaguely under “Upgrade”. Show the user what is being bought before confirmation.

## Entitlement implementation contract
A future trusted API should return a server-derived entitlement snapshot containing:
- account kind and active staff permissions (staff permissions are never user-selectable);
- active plan and billing state;
- feature entitlements and quota limits/usage;
- release credits or other action credits with ledger references;
- effective date, renewal/expiry information and server version.

The server must be authoritative. Treat a missing, stale, malformed or unauthenticated snapshot as no paid entitlement; allow public/free capabilities where appropriate. Never trust client-supplied plan names, price, quota, credit balance, payment success, ownership, or staff role.

Use stable capability identifiers (e.g. `music.release.create`, `music.release.credit`, `media.article.publish`, `jobs.listing.create`, `market.listing.create`, `ads.campaign.create`, `promotion.campaign.create`). Keep plan mapping in one place and test every public account kind. Avoid checking display labels or hard-coding plan names in individual screens.

## Required failure and abuse cases
- pending, failed, refunded, disputed and duplicate payment notifications;
- webhook retries and idempotency;
- concurrent requests attempting to spend the same credit;
- expired/cancelled subscription and failed renewal;
- account switching and ownership mismatch;
- rejected, failed, withdrawn and taken-down content;
- server/API unavailable, stale entitlement cache and offline app;
- staff actions, audit trail and least-privilege enforcement;
- restoration/synchronisation of purchases where required by the chosen payment mechanism.

A failed network request must not render false “success”. Existing content must not be silently deleted when a plan lapses; any hosting grace/retention rules must be disclosed.

## Release gates
- [ ] Product owner approves each plan, limits, prices, currency, billing interval, refund/cancellation rules and upgrade copy.
- [ ] Backend and database own entitlements, payment events, quotas, credits and audit trail.
- [ ] Authorization tests cover all ten account kinds, cross-account access, object ownership and staff privilege boundaries.
- [ ] Payment tests cover duplicate webhooks, retries, refunds, expiry and concurrency.
- [ ] Native iOS screens show pending/success/failure only from authoritative results and remain usable for free/core tasks.
- [ ] Exact-commit automated checks pass; live backend, payments and physical-device behavior are separately verified before marking complete.
