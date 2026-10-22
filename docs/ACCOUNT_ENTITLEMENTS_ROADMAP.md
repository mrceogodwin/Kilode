# Kilode account capabilities and monetisation roadmap

Status: reviewed product specification, not a statement that paid features or backend enforcement exist.
Scope: native Expo React Native app; preserve the ten public account-kind IDs in lib/accountKinds.ts.

## Guardrails
- Account kind identifies a user's primary workspace; it is not a subscription, entitlement, or authorization token.
- All ten kinds can use ordinary Socials participation, subject to safety rules.
- Creators and Communities are sections within Socials, not separate public account kinds or top-level systems.
- Super Admin/staff access is provisioned securely outside public registration.
- Never charge for a capability until the user sees its terms and a trusted backend can enforce and audit the entitlement.
- Do not invent prices, quotas, free allowances, or launch dates. Mark these as product decisions until approved.
- A workspace shortcut only helps navigation. It is not proof of authorization.

## Ten-account capability matrix

| Stable ID | Workspace purpose | Free/core participation | Optional paid capability candidates | Must not be confused with |
|---|---|---|---|---|
| member | Everyday participation | Home, Socials, discovery, profile, community discovery | Optional profile customisation or convenience features after validation | Paying to access basic safety or core participation |
| artist | Music and fan presence | Artist profile, Socials posts, music discovery | Release credits, defined upload allowance, advanced analytics, scheduling, team tools; Push Link billed separately unless an explicit plan includes credit | Socials post vs formal Music release vs external-store distribution |
| writer | Publishing and articles | Read/discover and ordinary Socials participation | Higher publishing capacity, editorial workflow, distribution/analytics tools | Reading access vs professional publishing tools |
| advertiser | Campaign operations | Discover Kilode and manage a basic business identity | Campaign management tools, campaign budgets, reporting and scale limits | Subscription fee vs ad spend vs paid promotion |
| cinema | Film/cinema publishing | Discover cinema content and maintain a basic presence | Content management, screening tools, analytics and promotion | Rights to publish vs paid promotion vs hosting cost |
| job_poster | Recruitment | Browse relevant discovery surfaces | More active listings, applicant workflow, featured listings, team access | Job listing payment vs advertising spend |
| job_seeker | Career discovery | Browse jobs and maintain a basic profile | Optional enhanced profile, alerts, application organisation, career tools | Paying to apply to ordinary jobs by default |
| vendor | Marketplace selling | Browse Market and maintain a basic presence | Higher listing capacity, seller analytics, storefront/team tools, optional promoted listings | Seller subscription vs transaction fees vs advertising |
| renter | Space/property listings | Browse listings and maintain a basic profile | Higher listing capacity, listing management, verified/promoted listings if operationally supported | Listing visibility vs paid advertising; verification must be genuine |
| brand | Organisation/business | Basic profile and Socials presence | Team roles, brand analytics, campaign tools and cross-system workspace features | Brand identity vs advertiser role; campaign billing remains distinct |

The capabilities above are candidates for product design. Exact plan names, prices, quotas, included credits, billing intervals and payment routes require approval and implementation. Do not expose fictional balances or purchase success.

## Monetisation primitives to implement once, then reuse

1. **Plan catalogue:** versioned plan identifiers, display copy, currency, price, billing interval, included capabilities, quotas, effective dates and terms.
2. **Entitlement service:** server-calculated capabilities and limits for the authenticated account; never trust client-provided plan names.
3. **Usage ledger:** idempotent reservations, consumption, release/refund, timestamps, reason codes and audit trail. Use for artist release credits and other metered features only where appropriate.
4. **Payment event ledger:** provider event ID, order, account, amount/currency, verified status, refunds/chargebacks, and idempotency. Never grant access from a client redirect alone.
5. **Promotion campaigns:** separate campaign budget/spend, review state, placements, activation and reporting from subscriptions and upload credits.
6. **Admin controls:** staff-only audited adjustments and moderation actions; no public Super Admin registration.
7. **Account lifecycle:** account switching must refresh server entitlements and ownership context; subscription expiry must not silently delete user content.
8. **Policy and support:** clear renewal/cancellation/refund terms, privacy, support route, data retention, abuse prevention and content appeals.

## Delivery sequence (do not skip gates)

### Gate 1 — product decisions
- [ ] Approve exact plan tiers and value propositions per account kind.
- [ ] Decide which capabilities stay free and define quotas.
- [ ] Approve prices, currency, billing intervals, taxes/fees, cancellation and refund policy.
- [ ] Decide which products are subscriptions, metered credits, advertising spend, or transaction fees.
- [ ] Review Apple App Store rules for each purchase type and storefront before choosing checkout.

### Gate 2 — trusted backend
- [ ] Choose and document the dedicated mobile API and authentication/session model; do not point native app at the old web app as an arbitrary JSON API.
- [ ] Add schema and migrations for plans, entitlements, usage ledger, payment events and audit records.
- [ ] Enforce account permissions, object ownership, quotas and staff authorization server-side.
- [ ] Add verified, idempotent payment webhooks and refund/chargeback reconciliation.
- [ ] Add observability, rate limits, backups, migration rollback and privacy/retention controls.

### Gate 3 — native iOS
- [ ] Show account-relevant Upgrade options without hiding core free capabilities.
- [ ] Explain the exact entitlement, price and renewal terms before purchase.
- [ ] Handle pending, failed, cancelled, refunded and restored purchases honestly.
- [ ] Refresh entitlements after sign-in, account switch, purchase and expiry.
- [ ] Provide accessible loading, empty, error, retry and offline states consistent with Kilode's charcoal/white/gold design.

### Gate 4 — verification
- [ ] Test every account kind and unknown-kind fallback.
- [ ] Test cross-account access, ownership, stale sessions and expired entitlements.
- [ ] Test duplicate webhooks, concurrent credit reservations, upload retries, refunds and chargebacks.
- [ ] Test native purchase restoration and account switching on a physical iPhone.
- [ ] Run typecheck, capability invariants, Expo Doctor and iOS bundle export on the exact commit.
- [ ] Verify dedicated backend E2E and installable EAS/TestFlight build separately before claiming production readiness.

## Current known gaps from native source audit
- The ten public account kinds and a client-side workspace capability map exist.
- The capability map is explicitly navigation guidance, not backend authorization.
- Artist upload credits/subscriptions are documented but not implemented.
- Upgrade, checkout, payments, Push Link lifecycle and trusted entitlement enforcement are not implemented/verified.
- Music currently uses seeded catalogue data; real streaming and release upload are not verified.
- Real sign-in requires a dedicated backend; guest mode is local.
- Physical-device welcome-video behavior and TestFlight installation are not verified.

Do not mark a gate complete from documentation alone. Update docs/FEATURE_STATUS.md only when source or test evidence changes.
