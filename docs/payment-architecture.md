# Kilode Payment Architecture

**Status: design contract only. No payment provider is currently integrated or verified live.**

## Decision

Use a provider-neutral payment domain in Kilode's dedicated backend. Do not let screens call a gateway directly or treat a successful client redirect as proof of payment.

| Use case | Initial route | Important rule |
| --- | --- | --- |
| Nigerian web checkout for eligible purchases | Flutterwave, after merchant onboarding and test/live verification | Create checkout server-side; verify transaction server-side before granting value. |
| Digital content/features bought inside iOS | StoreKit / Apple In-App Purchase where App Store rules require it | Decide eligibility by product type and storefront before release; do not assume every music model has the same rule. |
| International web checkout | Start with supported Flutterwave coverage; evaluate Stripe only when the merchant's legal entity, country, settlement and product are eligible | Stripe's standard account-country list does not include Nigeria; do not build on the assumption that a Nigerian entity can directly open a standard Stripe account. |
| Artist earnings and withdrawals | Separate payout workflow, selected after KYC, country coverage and compliance review | A customer checkout is not an artist payout. Never expose provider secrets in the app. |

Flutterwave and Apple IAP are not interchangeable: they serve different checkout surfaces and policy requirements. Paystack or another provider can be added later through the same adapter contract without rewriting product screens.

## Product flows

1. **Paid music / releases:** catalogue and previews can remain browseable offline. A paid full track must only unlock after a verified purchase entitlement or valid server-issued access grant. A displayed price or local button state is not proof of ownership.
2. **Subscriptions / memberships:** record the product, platform, start/end dates, renewal/cancellation state and verified store transaction. Handle restore purchases and server notifications; don't rely on the app alone to decide active status.
3. **Artist support / tips:** confirm whether the payment is a tip, donation or purchase in the relevant jurisdiction and platform rules. Show clear recipient, amount, currency and refund/support terms.
4. **Push Link promotion:** create a campaign/order first, collect payment through an eligible route, then activate campaign delivery only after verified settlement. Keep campaign status separate from payment status.
5. **Offline mode:** allow browsing cached catalogue, drafts and other non-paid local features. If entitlement cannot be refreshed, apply a documented grace/offline policy; never fabricate a successful payment or grant a new paid purchase offline.

## Backend boundary

All secrets, provider credentials, order creation, transaction verification, entitlement decisions, webhook processing and payout operations belong on the dedicated Kilode backend—not in the Expo app.

Suggested domain records (final schema should follow the selected database and migration conventions):

- payment_orders: internal order ID, user ID, product/purpose, amount in integer minor units, ISO currency, platform, provider, idempotency key, status, created/updated timestamps.
- payment_attempts: order ID, provider reference, checkout reference, status, safe error code and timestamps. Never store card data or provider secrets.
- provider_events: provider event ID, provider, received timestamp, signature-verification result, processing status and deduplication key.
- entitlements: user, product/track/plan, source transaction, valid-from/to, revocation state and audit timestamps.
- refunds: original transaction, amount, reason/status and provider reference.
- artist_payouts: artist, verified beneficiary/KYC reference, amount/currency, payout provider reference, status and reconciliation data. Restrict access.
- store_transactions: store/platform, original transaction ID, transaction ID, product ID, environment, signed-payload verification result and current entitlement state.

Do not store full card numbers, CVV, raw bank credentials, or unneeded personal data. Store only necessary provider references and verification outcomes. Enforce ownership and admin roles server-side.

## Required API behavior

Implement versioned endpoints under the dedicated Kilode API, for example:

- POST /payments/orders — authenticate user, validate product and server-side price, create an idempotent internal order.
- POST /payments/orders/:id/checkout — create provider checkout for an allowed provider/platform combination.
- GET /payments/orders/:id — return the authenticated user's safe order status.
- POST /webhooks/flutterwave — verify signature/authenticity, deduplicate event, then verify the transaction against the provider before finalizing.
- POST /store/apple/notifications — validate Apple's signed notification and update transaction/entitlement state.
- POST /store/apple/verify — validate signed transaction data server-side; use Apple's current recommended server API and transaction verification approach.
- POST /payments/orders/:id/refund — authorized, policy-checked refund request; never trust a client-provided refund result.
- Artist payout endpoints must be separate, permissioned and auditable.

Endpoint names are proposals, not existing routes. Final routes must match the established backend conventions.

## State and security rules

- Use an explicit state machine such as created -> pending -> paid | failed | expired; refunds and chargebacks must be represented separately and can revoke entitlements when appropriate.
- Use integer minor currency units; never use floating-point arithmetic for money.
- Validate amount, currency, user, product price and permitted provider on the server.
- Verify provider status and amount/currency/reference server-side. A browser redirect or app callback is only a signal to refresh status.
- Verify webhook signatures using official provider guidance; reject invalid signatures and make event handling idempotent.
- Handle duplicated, delayed and out-of-order webhooks safely. Reconcile pending transactions against provider records.
- Keep an auditable event trail without logging secrets or payment credentials.
- Rate-limit checkout creation and sensitive endpoints. Require authentication and ownership checks.
- Do not activate a paid Push Link campaign or unlock purchased content until verified.
- Define refund, chargeback, failed-renewal and cancellation behavior before launch.
- Separate test and live credentials; keep them in backend secret storage and rotate them safely.

## Delivery gates

1. Confirm merchant onboarding, supported countries/currencies, fees, settlement timelines, refunds and recurring-payment support with Flutterwave.
2. Confirm App Store rules for each paid music, subscription, tip and promotion product in target storefronts; document any applicable entitlement or alternative-payment exception before implementation.
3. Implement database migrations, row-level/authorization rules, backend adapter interface and audit records.
4. Integrate Flutterwave in sandbox; test successful, failed, abandoned, duplicated, delayed and mismatched-amount transactions plus invalid webhooks.
5. Integrate StoreKit in the native iOS app and server verification/notifications where required; test purchase, restore, cancellation, renewal, refund and revoked entitlement in Apple's sandbox.
6. Test offline launch, pending checkout, app termination during checkout, retries and duplicate requests.
7. Reconcile provider/store records, test refunds and payout controls, then run security review.
8. Run typecheck, Expo Doctor, iOS bundle export, backend integration tests and real-device iOS tests. A passing JS bundle is not a signed iOS build or proof of payment readiness.

## Current implementation status

- [x] Provider choice documented at architecture level: Flutterwave candidate for eligible Nigerian web/external checkout; Apple IAP for iOS digital purchases where required.
- [x] Provider-neutral design and server-side verification requirements documented.
- [ ] Flutterwave merchant configuration and live credentials verified.
- [ ] Dedicated backend payment endpoints, migrations, webhook verification and reconciliation implemented.
- [ ] Apple IAP / StoreKit purchase, restore and server notification flow implemented.
- [ ] Paid track / membership / Push Link entitlements enforced by backend.
- [ ] Refunds, chargebacks and artist payout workflows implemented and tested.
- [ ] End-to-end sandbox tests, production review and real-device tests passed.

Until the unchecked items are completed and tested, Kilode must not present payments as production-ready.
