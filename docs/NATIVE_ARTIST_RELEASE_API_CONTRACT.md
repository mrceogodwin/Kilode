# Kilode native API contract: artist release vertical slice

Status: API design contract only. No endpoint in this document is claimed to exist or be live. Implement against a dedicated backend for the native app; do not treat Kilode-v2 or kilode-nine.vercel.app as a mobile JSON API.

## Scope for the first end-to-end release

Implement one narrow, testable flow before generalising billing to all ten account kinds:
1. Authenticated artist session
2. Fetch artist's plan and release-credit balance
3. Create a draft release with metadata and rights declarations
4. Request an upload session and upload media to private object storage
5. Finalize upload and enqueue validation/transcoding
6. Read release processing/moderation status
7. Publish only after rights/moderation approval and valid entitlement
8. Purchase credits only after the chosen payment method and provider integration are approved

Do not build a fake success state while any step is disconnected.

## Proposed resource boundaries

- `GET /v1/me`: server-issued identity, account kind, and staff permissions (never accept role/ownership claims from client).
- `GET /v1/me/entitlements`: active plan, capability keys, usage counters, release credits and expiry; response is read-only and server authoritative.
- `POST /v1/music/releases`: create draft using idempotency key; validate artist ownership, metadata, supported file constraints and rights acknowledgements.
- `POST /v1/music/releases/{releaseId}/upload-session`: issue a short-lived, scoped upload URL only for an owned draft; never expose storage credentials.
- `POST /v1/music/releases/{releaseId}/finalize`: verify uploaded object, size, checksum and media type server-side; transition once to processing.
- `GET /v1/music/releases/{releaseId}`: return current server-owned status and safe error/retry information.
- `POST /v1/billing/checkout-sessions`: only after payment provider, product catalogue and App Store policy path are decided; create a pending checkout, not an entitlement.
- `POST /v1/billing/webhooks/{provider}`: verify provider signatures and event IDs; process idempotently. This is server-to-server, not called directly by the mobile app.

Paths are proposed conventions, not existing production endpoints. Use versioning and the project's actual routing conventions when implementation begins.

## Release states and invariants

Allowed transitions must be enforced server-side:
- `draft -> upload_pending -> uploaded -> processing -> review_pending -> approved -> scheduled/published`
- Recovery states: `upload_failed`, `processing_failed`, `rejected`, `withdrawn`, `takedown_pending`, `taken_down`.

Invariants:
- Only the authenticated owner or explicitly authorised team member can edit or inspect a private draft.
- Only artist-capable accounts can create Music releases; changing a local account-kind string cannot grant permission.
- A release credit is reserved atomically at the agreed product boundary. Idempotency prevents duplicate submission or credit consumption.
- A Kilode-caused upload/processing failure follows a documented credit restoration policy.
- Payment is pending until a verified provider event confirms it; duplicate webhook delivery cannot double-grant credits.
- Review rejection, copyright complaints, takedown, refunds and chargebacks have explicit state transitions and audit records.
- Existing published content is not silently deleted on subscription expiry. Hosting, grace period and post-cancellation rules must be disclosed.
- Never expose private media before publication; use short-lived upload/download URLs and server-side content-type/size/checksum verification.

## Security, privacy and operational requirements

- HTTPS only; short-lived signed upload URLs scoped to a single object; no long-lived secrets in the app bundle.
- Rate limits, request-size limits, malware/media validation, abuse controls and storage quotas.
- Validate artist ownership and staff privileges on every resource request.
- Store rights declaration version/time, asset checksums, moderation decisions, billing event IDs and credit-ledger entries for audit.
- Avoid logging access tokens, payment details, signed URLs or private media.
- Provide deletion/export handling and retention rules consistent with published privacy terms.
- Monitor queue failures and storage/transcoding costs; provide actionable retry messages without leaking internal errors.

## Test gates before release

- Unit tests for state transitions, ownership, capability checks, quota calculations and credit-ledger invariants.
- Integration tests for signed uploads, bad checksums, wrong media types, oversized files, interrupted uploads and retry.
- Billing tests for pending/failure/success, duplicate/out-of-order webhooks, refunds, chargebacks and concurrent checkout.
- Authorization tests proving member/job-seeker and other non-authorised accounts cannot call artist release mutations.
- Physical iPhone tests for progress, backgrounding/resume, poor network, accessibility, cancellation, and account switching.
- CI must pass on the exact commit. Live backend and payment integration must be tested in a non-production environment before any public launch.

## Decisions required before code collects money

- Confirm hosting-only versus external-store distribution scope for launch.
- Approve included release allowance, pay-per-release definition, credit expiry/refund rules, and plan prices.
- Select storage/transcoding providers and dedicated backend hosting.
- Select the payment path after checking current Apple rules for the exact digital product and storefront.
- Publish support, privacy, terms, copyright/takedown and cancellation policies.
