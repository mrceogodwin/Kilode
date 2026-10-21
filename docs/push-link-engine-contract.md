# Push Link Engine Contract

Status: architecture contract; not evidence that a production Push Link service is implemented.

## Product responsibility

Push Link is Kilode's shared distribution and campaign system. Music is the first vertical integration, not the only use case. Eligible content may include hosted music releases, external music-platform pages, creator profiles, videos, events, media articles, products, jobs, businesses, and public profiles.

Each Kilode system keeps its own content model, permissions, dashboard and moderation rules. Push Link provides common campaign orchestration, routing, attribution, analytics, billing hooks and safety controls.

## Link destinations and playback

A campaign may contain one or more destinations:
- Kilode-hosted content with an authorised internal route.
- An official external URL supplied by an authorised account owner.
- An approved platform embed, only where the platform permits the specific content and playback method.
- An external app or website hand-off when embedding is unavailable.

For music, distinguish Kilode-hosted playback from external-platform visits. Kilode must not download, proxy, re-host or play third-party audio unless the applicable rights and platform terms permit it. External clicks are not verified streams. External stream counts may be shown only when obtained through an authorised, reliable integration and labelled with its source and freshness.

## Campaign lifecycle

`draft → validation → moderation/review (when required) → scheduled/active → paused/completed/rejected`

A campaign must have an owner, content reference, objective, destination(s), category, audience/placement rules, start/end times when relevant, status, and an audit trail. Paid campaigns additionally require price/budget, billing state, refund/cancellation policy, and an explicit confirmation before charging. Never report a campaign as active or paid until the corresponding server-side operation confirms it.

## Core services

1. Link registry and URL validation.
2. Destination resolver and app/deep-link routing.
3. Campaign lifecycle and scheduling.
4. Placement/discovery eligibility across Kilode systems.
5. Attribution and deduplication.
6. Analytics aggregation and reporting.
7. Moderation, copyright/impersonation handling, and unsafe-link protection.
8. Fraud/abuse detection and rate limiting.
9. Billing/payment integration.
10. Operational telemetry, alerting and audit logs.

These are logical boundaries; they may share a deployable backend initially. Do not introduce unnecessary microservices before traffic and operational needs justify them.

## Minimum event model

Every event should carry a unique event ID, event name, UTC timestamp, environment, request/trace ID where available, campaign ID, content ID, placement, and an outcome. Actor identifiers must be privacy-conscious and access-controlled.

Required event names include:
- `campaign_impression`
- `destination_click`
- `internal_content_open`
- `hosted_play_started`
- `hosted_play_qualified`
- `external_redirect`
- `campaign_conversion` (only when the conversion is actually observed)
- `campaign_status_changed`

Never emit a qualified hosted play until the audio engine confirms audio actually started and the configured qualification rule is met. Deduplicate retry/replay events. Exclude preview fixtures, test events and known bots from production reporting. Never fabricate impressions, clicks, conversions, streams or campaign reach.

## Reporting definitions

- Impression: a campaign placement was actually rendered under the agreed visibility rule.
- Destination click: a member selected a campaign destination.
- External redirect: Kilode attempted or completed navigation to a third-party destination; record the exact state supported by the implementation.
- Hosted play: audio served by Kilode and confirmed as started by the player.
- Qualified hosted play: hosted playback meeting the published, configurable qualification rule.
- Verified external stream: external stream data supplied by an authorised platform integration. It is not inferred from clicks.
- Reach: report unique audience only when a privacy-compliant deduplication method is implemented; otherwise label the metric as impressions or visits.

Every dashboard metric must show its definition, time range, source and freshness. If telemetry is unavailable, show unavailable/degraded—not zero and not healthy by default.

## Security and privacy

- Validate and normalise URLs server-side; allow only supported schemes (`https` `http` where necessary), reject `javascript:`, `data:` and malformed destinations.
- Protect against open redirects, URL shortener abuse, phishing, malware and impersonation.
- Do not place access tokens, private identifiers or secrets in campaign URLs or analytics payloads.
- Use least-privilege access checks for campaign ownership, editing, reporting and billing.
- Apply retention limits and data minimisation to attribution identifiers.
- Keep moderation decisions and paid campaign state auditable.

## Music integration

The artist flow is:
1. Upload original audio to Kilode through an authenticated upload endpoint.
2. Validate file type, size, ownership/rights declarations and safety requirements.
3. Store privately and process/transcode through a controlled job pipeline.
4. Publish only after processing and required review succeeds.
5. Attach official external platform links separately from the hosted audio asset.
6. Create a Push Link campaign for the release.
7. Distribute to eligible placements and measure hosted listening separately from external redirects.
8. Show artist analytics with clear source and freshness labels.

External platform profile links are metadata; they are not a replacement for uploading audio to Kilode.

## Release gates

Before paid campaigns or public production rollout:
- Real authenticated backend, database and durable storage exist.
- Ownership and role checks are tested.
- URL safety, moderation, copyright and abuse controls are operational.
- Billing is server-authoritative and tested without real charges in test environments.
- Impression/click/play event definitions and deduplication are covered by automated tests.
- Campaign reporting is reconciled against source events.
- Music uploads are tested from a real device through processing, publishing and playback.
- External link behaviour is verified for supported platforms and fallback routes.
- Monitoring, alerts, incident handling and rollback are ready.
- Physical iPhone testing and production observation pass.

## Current limitations

This document defines the target contract only. It does not mean that a live Push Link backend, upload pipeline, third-party integrations, paid billing, verified external-stream analytics, or production monitoring already exists. UI-only or local drafts must be labelled as such until backed by confirmed server responses.
