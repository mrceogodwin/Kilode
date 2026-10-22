# Kilode account capabilities and monetisation matrix

Status: design contract for native UI and future backend implementation. This document does not mean checkout, paid entitlements, or server authorization are implemented.

## Non-negotiable architecture

- Preserve the ten public account-kind IDs in `lib/accountKinds.ts`; do not create separate public account kinds for Creators or Communities.
- Creators and Communities are sections within Socials. All account types may participate in ordinary Socials, subject to platform rules.
- Account kind describes the user's work. Subscription plan describes paid benefits. Staff roles describe trusted operational authority. Never conflate these.
- The native capability map only chooses relevant workspace shortcuts. It is not an authorization boundary. The trusted backend must enforce identity, ownership, permissions, usage limits, payment status, and staff access.
- Do not show a capability as operational when its backend is unavailable. Explain availability honestly; never fake a successful payment, upload, post, listing, or campaign.
- Keep useful core participation free. Price professional capacity, premium tools, promotion, and optional business services separately. Do not invent prices in code.

## Ten public account kinds

| Account kind ID | Core workspace | Possible paid capability (proposal; not yet implemented) | Required separation |
|---|---|---|---|
| `member` | Socials, discovery, communities, events, jobs discovery, Market browsing | Optional convenience/personalisation tools | Never require a subscription for ordinary participation |
| `artist` | Socials, Music releases, artist profile | Defined release credits, advanced catalogue/analytics, team tools | Music upload credits, subscription benefits, and Push Link campaign spend are distinct |
| `writer` | Socials, Media authoring | Advanced publishing workflow, audience analytics, scheduling | Publishing permission and editorial moderation remain separate |
| `advertiser` | Socials, Ads/campaign workspace | Campaign-management tools and reporting | Ad budget is not a subscription; campaign approval is separate |
| `cinema` | Socials, Cinema/film workspace | Catalogue tools, performance insights, promotion | Film rights, content review, and promotion are distinct |
| `job_poster` | Socials, Jobs/recruitment | More active listings, recruitment workflow, applicant tools | Paid listing does not guarantee applicants or hires |
| `job_seeker` | Socials, Jobs discovery | Optional career tools or enhanced visibility, if later approved | Core job discovery must remain useful without payment; never sell guaranteed employment |
| `vendor` | Socials, Market seller workspace | Higher listing allowance, seller analytics, promoted listings | Product listing, promotion, and any transaction fees are distinct |
| `renter` | Socials, Rent/space listings | Higher listing allowance, listing analytics, promotion | Listing review and promotion do not guarantee a rental |
| `brand` | Socials, brand/business workspace | Advanced analytics, campaign and team tools | Brand identity verification and ad approval are separate |

These are capability and monetisation proposals, not confirmed plan entitlements. The product owner must approve exact included quantities, prices, billing intervals, renewal/cancellation terms, refunds, taxes, and support obligations before implementation.

## Shared commercial model

1. **Free core:** account/profile, ordinary Socials participation, discovery and access to relevant public systems.
2. **Account-aware subscriptions:** optional plans with explicit capability lists and usage quotas.
3. **Metered actions / credits:** for expensive or occasional actions such as formal Music releases or extra listings.
4. **Paid promotion:** Push Link or eligible promoted inventory with separate budget, duration, placement, review and reporting.
5. **Business revenue:** optional marketplace services or other clearly disclosed fees only after the transaction, refund, dispute and support model is defined.

Do not make every upload or every account action paid by default. Do not sell “unlimited” usage without verified infrastructure and abuse controls.

## Entitlement model required before payments

Use stable capability keys rather than scattered plan-name checks, for example:
- `socials.participate`
- `media.publish`
- `music.release.submit`
- `music.release.credits`
- `music.analytics.advanced`
- `cinema.submit`
- `jobs.post`
- `jobs.career.tools`
- `market.list`
- `rent.list`
- `ads.campaign.create`
- `promotion.campaign.create`

Each entitlement needs a server-defined value, limits/period, source (plan, purchase, grant), effective dates, and audit trail. UI shortcut visibility is not proof of entitlement.

## Payment and failure safety

- Server verifies payment provider events and grants entitlements idempotently.
- Store credits in an auditable ledger; prevent duplicate callbacks and concurrent overspending.
- Distinguish pending, paid, failed, refunded, disputed, expired and cancelled states.
- Never grant access from a client flag, local storage, or checkout redirect alone.
- Keep existing published content safe when a plan lapses; disclose any grace period and hosting policy.
- Refund or restore credits for platform-caused failed operations according to a documented policy.
- For digital features consumed in the iOS app, validate the precise purchase design against current Apple review/payment rules before implementation.
- Staff/admin permissions are assigned through a protected process, never through a public signup or purchasable plan.

## Acceptance criteria

- [ ] Ten account IDs remain stable and each has a capability-map entry.
- [ ] Tests cover capability coverage, unknown-kind fallback, workspace destination validity, and intended role mapping.
- [ ] All ten registration choices are selectable and persist only with a real server-issued account.
- [ ] Backend authorization is implemented and tested independently of client shortcut visibility.
- [ ] Exact plans, limits, prices and policies are approved before UI presents a purchase.
- [ ] Checkout, restore, renewal, cancellation, refunds, chargebacks, retries and account switching are tested.
- [ ] Native iOS device tests and live backend/payment end-to-end tests pass before claiming production readiness.
