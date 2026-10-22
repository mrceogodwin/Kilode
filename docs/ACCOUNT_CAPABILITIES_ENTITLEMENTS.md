# Kilode account capability and entitlement matrix

Status: architecture specification for native iOS and its dedicated backend. This is not evidence that the listed capabilities, billing, or backend enforcement already exist.

## Invariants
- Preserve the ten existing public account-kind IDs in `lib/accountKinds.ts`. Do not rename IDs or add a public role without a migration and product decision.
- Account kind, subscription plan, individual permissions, and staff status are separate concepts.
- Every account keeps ordinary member participation where appropriate; paid plans unlock defined capacity or professional tools, not basic dignity or safety.
- Enforce permissions and paid entitlements on the trusted backend. Hiding a button in React Native is not authorization.
- Never use seeded preview data as evidence of a live service. Do not fake a successful upload, payment, application, listing, campaign, or publication.
- Creators and Communities are sections inside Socials, not extra top-level account kinds or top-level systems.
- Super Admin is a protected staff permission with strong authentication and audit logging, never a public registration choice or purchasable tier.

## Ten public account kinds and capability boundaries

| Existing ID | Primary workspace | Core capabilities to design | Optional paid capabilities to evaluate |
|---|---|---|---|
| `member` | My Space + Socials | Profile, feed participation, follow, join communities, save/report content | Personalisation or convenience features that do not gate basic participation or safety |
| `artist` | Music + Socials | Artist profile, rights declaration, submit/track own releases when release service is available, share content | Release credits, advanced catalogue/analytics/scheduling, team tools, Push Link campaign spend |
| `writer` | Media + Socials | Author profile, create and manage own drafts/submissions where publishing backend exists | Advanced publishing workflow, analytics, scheduling, professional distribution |
| `advertiser` | Ads / Business | Own campaign drafts, creative and budget setup, campaign status/report access | Higher campaign limits, advanced reporting and management tools; ad spend remains distinct |
| `cinema` | Cinema + Socials | Manage owned film/cinema submissions and metadata | Additional catalogue capacity, analytics, campaign tools, team access |
| `job_poster` | Jobs | Create and manage vacancies, review applicants only for owned/authorized jobs | More active listings, recruitment workflow and reporting |
| `job_seeker` | Jobs + My Space | Career profile, discover/save/apply for jobs where the service exists | Optional career tools and insights; never promise job placement |
| `vendor` | Market | Manage own products/listings and seller profile | Higher listing limits, seller insights, promotion and operational tools |
| `renter` | Rent/listings | Manage own space/property listings and enquiries | Higher listing limits, listing promotion and management tools |
| `brand` | Ads / Business + Socials | Business presence, authorized brand profile and content | Team roles, advanced analytics, campaign management and business tools |

The table defines boundaries, not a promise that every capability is currently implemented. Workspace labels should map to the established Kilode systems; avoid creating duplicate top-level destinations for each account kind.

## Registration and account lifecycle
1. Registration stores one of the ten exact IDs, with `member` as the safe default only when no valid choice is provided.
2. Show a compact, accessible account-type picker; do not overwhelm registration with ten oversized cards.
3. Users must not select privileged staff access. Account-type changes require a defined migration/confirmation flow and must not silently grant ownership of existing business assets.
4. One identity may eventually hold multiple workspaces or team memberships, but that requires an explicit account model. Do not fake multi-role support by changing a single account-kind string.
5. Enforce object ownership: employers only see applicants for their authorized jobs; vendors/renters manage only their own listings; artists/writers/cinema publishers manage only their own assets; advertisers/brands only access authorized campaigns.
6. Add audit records for sensitive role changes, campaign spending, release decisions, moderation, and staff actions.

## Monetisation boundaries
- Subscription plan is independent of account kind. A user remains an `artist` whether on a free plan, a paid artist plan, or a future label/team plan.
- Pay-per-use actions (e.g. a release credit or ad spend) must be separate from subscription renewal charges and clearly priced before confirmation.
- Never sell moderation approval, guaranteed reach, job placement, streams, or publication outcomes.
- Do not define actual prices, quotas, renewals, refunds, or royalty splits in code until the product owner approves them.
- If a subscription expires, retain ownership and data; define grace periods and disclose any limits before enforcement.
- For in-app digital purchases, review the applicable Apple rules before selecting the payment flow.

## Recommended implementation sequence
1. **Audit only:** keep IDs stable; map each current screen and action to a capability and record missing implementations.
2. **Typed policy:** create one central entitlement/capability map with safe defaults and tests; no price assumptions and no local-only purchase grants.
3. **Backend contract:** define authenticated endpoints, ownership checks, server-owned entitlements, quotas, audit trail, and idempotency.
4. **Native UI:** display only actions the current account is allowed to perform, with clear upgrade prompts where relevant; server remains authoritative.
5. **Payments:** implement only after product limits/prices, provider, refunds, App Store policy, and server callbacks are decided.
6. **Verification:** tests for every account kind, cross-account object access, expired plan, guest, malformed account kind, payment retry, concurrent quota use, and account switching. Test a real iPhone build separately from JS/Expo validation.

## Acceptance checklist
- [ ] All ten IDs remain backward-compatible.
- [ ] Every account kind has an explicit capability map and workspace.
- [ ] No public signup path can grant staff/admin permission.
- [ ] Server rejects unauthorized cross-account reads/writes even if a client request is forged.
- [ ] Paid entitlements are server-derived and expire/cancel correctly.
- [ ] Guest and free participation work without fake backend success.
- [ ] Creators and Communities stay within Socials.
- [ ] Native automated validation passes on the exact commit.
- [ ] Live backend, payment, and physical-device tests are reported separately and only after they actually pass.
