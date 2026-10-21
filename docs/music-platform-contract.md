# Kilode Music Platform — implementation contract

## Product behaviour

Artists upload original audio files directly from the native Kilode app. Kilode stores and delivers those files; an external streaming link is optional profile metadata, never a substitute for a Kilode audio asset.

## Required records

### artist_profiles
- id (UUID, primary key; same identity as the authenticated Kilode account)
- display_name, handle (unique), bio, avatar_url, banner_url
- external_links (validated array of { platform, url })
- created_at, updated_at

### music_tracks
- id (UUID, primary key)
- artist_id (foreign key to artist_profiles)
- title, version, description, genre, language
- cover_art_key
- audio_asset_key (private/origin storage object key; not a client-supplied arbitrary URL)
- playback_asset_key (processed streaming asset key, nullable until processing finishes)
- duration_ms, explicit_content
- release_state: draft | uploading | processing | published | rejected | archived
- release_at, created_at, updated_at
- rights_confirmation_at and rights_status
- moderation_status

### music_releases
- id, artist_id, title, release_type (single | ep | album), cover_art_key, release_at, state
- release_tracks relation with track_id and track_number

### music_events
- id, track_id, listener_id (nullable for privacy-preserving anonymous events), event_type (play_started | play_completed | like | unlike), occurred_at
- Deduplicate repeated play events; only count plays after a documented minimum listen threshold. Never seed or fabricate counts.

## Required native-to-backend API

- GET /api/mobile/music/tracks?query=&artist_id=&cursor=
- GET /api/mobile/music/tracks/:trackId
- POST /api/mobile/music/uploads — authenticated artist requests a short-lived signed upload URL and an upload record; server validates file type/size and account permissions.
- POST /api/mobile/music/uploads/:uploadId/complete — server verifies the uploaded object and queues audio inspection/transcoding.
- GET /api/mobile/music/uploads/:uploadId — native client polls processing state.
- POST /api/mobile/music/tracks/:trackId/publish — validates required metadata, rights confirmation, moderation state and processed playback asset.
- GET /api/mobile/music/tracks/:trackId/playback — authenticated/authorized endpoint returns a short-lived playback URL or streaming manifest, not a permanent public storage URL.
- POST /api/mobile/music/tracks/:trackId/events — records validated play/like events.
- PATCH /api/mobile/music/artist-profile — updates bio and external platform links.

## Upload and playback rules

1. Native client picks a local audio file, displays file name/size, and collects title, artwork, genre and rights confirmation.
2. Server—not the app—authorizes the artist and issues a short-lived upload target.
3. Uploads go directly to object storage; large uploads need resumable/multipart support.
4. Validate MIME type and actual file signature, size/duration limits, malware/metadata handling, and quotas.
5. Transcode to supported streaming formats, produce duration and waveform/cover metadata, and retain a safe source asset.
6. A track remains unpublished until processing, rights checks and moderation requirements pass.
7. Playback is delivered through expiring signed URLs or a streaming CDN. Do not expose storage credentials or use arbitrary URLs supplied by clients.
8. Apply rate limits, abuse reporting, takedown/counter-notice workflows, repeat-infringer policy and rights-holder reporting before public launch.
9. Use a queue/worker for transcoding. Do not perform long audio processing inside a mobile request handler.
10. Store secrets only in backend environment variables; never ship storage service keys in the app.

## Artist digital platform links

Support allow-listed platforms (Spotify, Apple Music, YouTube, Audiomack, Instagram, TikTok, website and other approved links). Validate HTTPS URLs and render them as outbound profile links. These links are independent of the audio file uploaded to Kilode and do not count as Kilode playback.

## Release gates

- Dedicated backend and storage configured for development/staging/production.
- Database migrations and access policies reviewed; artists can only manage their own drafts and uploads.
- Signed upload, completion, processing, publishing and playback paths tested end to end.
- Invalid, oversized, unsupported and interrupted uploads tested.
- Audio rights and moderation workflows verified.
- Accurate play-count event rules and privacy retention documented.
- Typecheck, Expo Doctor, iOS bundle export, backend integration tests and physical iPhone upload/playback tests pass.

## Current repository status (2026-10-21)

The native app has a basic player that can play a catalogue item only when a valid audio URL is already supplied. The current sample tracks do not contain audio assets. This repository branch has no confirmed dedicated music upload/storage/transcoding backend, so an end-to-end upload must not be presented as working until the contract above is implemented and tested.

## Kilode Top 100 — verified chart contract

The native Top 100 must not derive official positions from catalogue order. The dedicated backend should expose a separately versioned chart snapshot:

- `GET /api/mobile/music/charts/top-100?period=week&region=NG`
- Response envelope: `{ chartId, period, region, generatedAt, windowStart, windowEnd, methodologyVersion, entries }`.
- Each entry must include `trackId`, `rank` (positive integer), `previousRank` (positive integer or null), and `movement` (integer or null). The client may derive movement as `previousRank - rank` only when both positions belong to comparable consecutive snapshots for the same chart, period and region.
- The response must be a single consistent snapshot. Reject duplicate track IDs, duplicate ranks, invalid ranks, stale snapshots beyond the published freshness limit, and mismatched chart metadata.
- Rank inputs must come from validated, deduplicated server-side listening activity under the documented qualified-play threshold. Button taps, sample/demo tracks, internal tests, bots and outbound external-link clicks must not count as plays.
- Document the ranking window, eligibility rules, tie-breaking, region, minimum activity/privacy thresholds, fraud review and correction process. Never infer a chart rank from track creation time or the order returned by the catalogue endpoint.
- Until this endpoint returns validated chart data, the native UI must retain its preview/pending label and neutral movement indicators. A successful catalogue request alone is not evidence that chart rankings are live.
- Add backend contract tests for malformed/duplicate ranks, stale snapshots, missing previous positions, rank changes, empty charts, region/period boundaries and exclusion of unqualified plays.

This contract defines required behaviour only. It does not assert that the endpoint, ranking pipeline or production chart snapshots currently exist.
