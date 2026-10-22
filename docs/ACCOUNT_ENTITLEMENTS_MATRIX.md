# Kilode account entitlements matrix

Status: implementation contract for product and native/backend engineering. This document does not claim paid plans, payment processing, or server-side authorization are implemented.

## Non-negotiable rules

- Preserve the ten public account-kind IDs in `lib/accountKinds.ts`; do not add Creators or Communities as account kinds. They are sections inside Socials.
- Account kind describes the user's primary workspace. A plan describes paid entitlements. Staff permissions are separate. Never make Super Admin a public registration type or purchasable plan.
- Core participation stays useful without payment. Charge for clearly scoped professional capacity, advanced tools, paid promotion, or business services—not basic existence on Kilode.
- Client capability maps control navigation only. The dedicated backend must enforce identity, ownership, role permissions, quotas, payment status, and entitlements.
- No prices, quotas, renewal terms, or royalty shares are approved here. Do not hard-code invented prices or show fake purchase success.
- Native iOS is the product source of truth. A web preview is not evidence that native purchase, upload, or account switching works.

## Proposed account-by-account model

| Stable ID | Free/core access | Potential paid capabilities (define exact limits before launch) | Separate paid actions |
|---|---|---|---|
| `member` | Home, Socials participation, follow/discover, join communities, browse public systems | Optional enhanced personalization, profile customization, or other clearly defined member tools | Optional paid promotion only when eligible; no paywall for basic participation |
| `artist` | Artist profile, Socials posts, discovery and fan interaction | Defined Music release credits/allowance, catalogue management, advanced analytics, scheduling and team access | Pay-per-release credits; Push Link campaigns; external distribution only if a real partner workflow exists |
| `writer` | Writer presence and ordinary Socials participation | Publishing capacity/tools, scheduling, archive and readership analytics | Clearly scoped sponsored content or promotion, subject to ad/editorial labelling |
| `advertiser` | Business identity and access to campaign information/drafts | Campaign management capacity, audience/reporting tools and higher operational limits | Ad spend and campaign services, priced separately from subscriptions |
| `cinema` | Publisher profile and eligible discovery presence | Catalogue management, screening/release scheduling, performance analytics and team tools | Paid promotion or ticketing/service fees only when those workflows are implemented |
| `job_poster` | Employer identity and basic recruitment discovery | More active listings, applicant management, organisation tools and recruitment analytics | Paid job boosts or listing packages, with terms and expiry shown |
| `job_seeker` | Profile, job search and application access when connected | Optional CV/profile tools, application tracking and career analytics | Optional paid services only; never imply payment guarantees employment |
| `vendor` | Seller profile and basic product discovery | Higher listing capacity, inventory/order tools, seller analytics and team tools | Promotion, transaction/service fees only when checkout, refunds and disputes are implemented |
| `renter` | Lister profile and basic space/property discovery | Higher listing capacity, listing analytics and management tools | Listing promotion or listing packages; do not imply deposits/rent are handled unless secure payments exist |
| `brand` | Organisation presence, Socials and public discovery | Brand workspace, team access, audience analytics and campaign tools | Ad spend, Push Link and other clearly scoped business services |

These are proposed entitlements, not promises that the associated systems are already live. Shared capabilities such as Socials should remain available across account kinds. A paid plan must not silently grant a different account kind or privileged staff role.

## Subscription vs. one-off purchase

1. **Subscription:** recurring, account-linked access to named capabilities and defined quotas. Display billing interval, renewal, cancellation, expiry, and what happens to existing content.
2. **Credit pack / pay-per-release:** one-off purchase for a specifically described action, such as a Music release. Keep a durable, server-owned credit ledger and handle retries/refunds fairly.
3. **Campaign budget:** separate spend for a specific approved promotion campaign. Do not mix campaign spend with subscription price or upload credits.
4. **Marketplace or business service fees:** only after the actual order/service workflow, support, refunds, and dispute handling exist.
5. **External distribution or ticketing:** separate product and integration, never implied by a generic subscription.

## Required backend model before collecting money

The dedicated backend must define account identity, plan catalog, entitlements, quota counters, purchases, subscription status, credit ledger, payment provider events, idempotency keys, refunds/chargebacks, audit trail, and resource ownership. Payment provider callbacks must be verified server-side. Granting an entitlement and consuming a credit must be atomic and safe against duplicate requests and concurrent actions.

Every paid capability must have:
- a stable entitlement key;
- an explicit free/paid rule and quota;
- a server-side enforcement point;
- a user-facing explanation and price before confirmation;
- success, pending, failure, refund, expiry, cancellation, and restore behavior;
- tests for unauthorized access and duplicate/concurrent operations.

For iOS purchases, check current App Store Review Guidelines for the exact product and storefront before choosing StoreKit or another permitted payment path. Do not assume one checkout approach is valid for every digital feature or service.

## Release gates

- [ ] Product owner approves exact plan names, prices, quotas, currency, billing periods, credits and refund/cancellation terms.
- [ ] Each entitlement has a backend enforcement rule and tests; client navigation is not security.
- [ ] The user can inspect current plan, usage and expiry without a fake balance.
- [ ] Failed/pending payment never grants access; verified payment is idempotent.
- [ ] Cancellation/expiry does not silently delete existing user content.
- [ ] Native iOS purchase/restore, account switching, accessibility and error states are tested on a physical device.
- [ ] Exact commit passes automated checks and live end-to-end payment/backend tests before any capability is labelled production-ready.
