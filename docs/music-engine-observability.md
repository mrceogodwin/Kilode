# Kilode Music Engine — observability contract

Status: specification for implementation; this file does not claim that production telemetry or backend services are deployed.

## Purpose

Measure the complete native music lifecycle with evidence from real services:
artist upload → object storage → inspection/transcoding → publication → playback delivery → listening events → artist analytics.

The dashboard must distinguish **healthy**, **degraded**, **down**, and **not configured**. Missing telemetry must never be displayed as zero failures or as healthy.

## Required event envelope

Every server-side event should carry:
- `event_id` (unique ID for idempotency)
- `event_name` and `occurred_at` (UTC)
- `environment` (development, staging, production)
- `request_id` / trace ID
- `actor_id` only where necessary and access-controlled
- relevant entity IDs (`track_id`, `upload_id`, `release_id`)
- `result` (success/failure) and a bounded `error_code` on failure
- duration in milliseconds when measuring an operation

Never log access tokens, signed URLs, raw audio, full user secrets, or unnecessary personal data. Prefer aggregate metrics and short retention for diagnostic events.

## Core metrics and definitions

### Upload
- Upload success rate = completed valid uploads / upload attempts.
- Upload duration = request-to-object-verified time; report p50, p95 and p99.
- Interrupted/expired upload count and retry success rate.
- Rejected upload count by safe reason code (unsupported type, too large, signature mismatch, quota, permission).

### Processing and publishing
- Processing queue depth and oldest queued job age.
- Transcode success rate and duration by output profile.
- Time from upload completion to publishable state.
- Publish rejection/failure rate by reason.
- Stuck jobs and retry/dead-letter counts.

### Playback and delivery
- Playback start success rate = sessions reaching a confirmed audio-start event / valid playback attempts.
- Time-to-first-audio p50/p95/p99.
- Playback error rate by bounded error code and app version.
- Buffering/rebuffer ratio when measurable by the player.
- CDN/storage delivery errors and egress volume.
- Track duration and playback progress must come from validated player/server events, not button taps alone.

### Listening analytics
- Record `play_started` only after audio actually starts.
- Count a qualified play only after a documented minimum listening threshold; make the threshold configurable and disclose it to artists.
- Deduplicate retries and repeated events with idempotency keys.
- Completion rate = qualified sessions reaching the documented completion threshold / qualified sessions.
- Separate Kilode-hosted playback from outbound external-link clicks.
- Exclude preview/sample fixtures, automated tests, known bots and internal monitoring traffic from artist-facing metrics.
- Never fabricate plays, listener counts, chart positions or earnings.

### Platform health
- API availability and latency by route (p50/p95/p99).
- Database connection/query errors and latency.
- Object-storage availability, upload failures and capacity.
- Worker health, queue lag, crash/restart count.
- Native crash-free sessions, API request failures and app-version breakdown.
- Alert delivery health and last successful telemetry timestamp.

## Initial service objectives (provisional targets, to be calibrated against real traffic)

- Public catalogue API availability: 99.9% monthly.
- Playback-start success: at least 99.5% of valid attempts.
- Playback time-to-first-audio: p95 under 2.5 seconds on a healthy connection.
- Upload verification and processing: publishable-state p95 under 5 minutes for supported files, excluding unusually large files and external outages.
- Critical alerts: page/notify on sustained playback-start failures, failed health checks, growing processing queues, and storage/DB unavailability.

These are target objectives, not measured current performance. Publish a target as achieved only after sufficient production measurements exist.

## Health endpoint and admin view

A protected operational dashboard should show:
- backend API, database, object storage, queue/worker, transcoding, playback delivery, and telemetry pipeline separately;
- current state, last successful check, latency, recent error rate and deployment/version;
- metric coverage status (receiving events / stale / not configured);
- links from aggregate error spikes to redacted request IDs and diagnostic logs.

Health checks must not expose credentials, storage paths, internal network details or private user information to public clients. A public health endpoint, if needed, should return only minimal readiness information.

## Required tests

1. Unit tests for event schemas, idempotency and qualified-play calculations.
2. Integration test: authenticated artist uploads a test audio fixture → storage verifies it → worker processes it → artist publishes it → a separate listener starts playback → analytics record one qualified play.
3. Retry the same event and confirm it is not double-counted.
4. Verify failed/aborted uploads never appear as published tracks.
5. Verify users cannot read or modify another artist's private drafts/assets.
6. Verify signed upload/playback URLs expire and do not leak into logs.
7. Simulate unavailable storage, worker failure and API timeout; assert correct degraded/down states and alerts.
8. Verify test fixtures and monitoring traffic never affect public artist stats.
9. Run native playback tests on a physical iPhone, including background/lock-screen behaviour and interruption recovery.

## Rollout gates

Do not label the Music Engine production-ready until:
- dedicated backend, database, object storage, worker/transcoding and delivery are configured;
- authentication, authorization, rate limits, rights/moderation and takedown paths are reviewed;
- telemetry is emitted by real server/player events and validated in staging;
- dashboards and alert routing are operational;
- backend integration and failure-mode tests pass;
- a physical-device upload-to-playback test passes;
- production metrics have been observed for a meaningful period.

## Current known status

The repository currently has an initial native playback layer and a CI job that has passed TypeScript validation, Expo Doctor and iOS JavaScript bundle export. These checks do not establish that a dedicated music backend, upload storage, transcoding, playback delivery, production telemetry or this monitoring dashboard is deployed. Those remain explicit implementation and verification tasks.
