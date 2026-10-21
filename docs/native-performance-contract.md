# Kilode Native Performance Contract

Status: engineering requirements and verification plan. Targets below are not measured results.

## Product goal
Kilode should feel immediate on supported iPhones and Android devices. Performance must be measured on real devices and realistic networks; do not describe the app as "light speed" until the measurements support that claim.

## Initial budgets
- Cold launch to first usable screen: p50 <= 2.0 s, p95 <= 3.5 s on the agreed reference-device set.
- Warm launch to interactive screen: p95 <= 1.5 s.
- Local navigation response: p95 <= 100 ms for the first visual response.
- Main-thread JS work: avoid individual blocking tasks above 50 ms in common interactions.
- Feed first content: render cached/available content quickly, then refresh in the background without blocking navigation.
- API requests: use explicit timeouts, bounded retries with backoff, cancellation on screen exit, and visible stale/degraded states.
- Images: request appropriately sized assets, cache repeat content, lazy-load off-screen media and avoid decoding full-resolution images in feed cards.
- Audio: do not fetch full tracks before playback; use a supported streaming/delivery format, measure time-to-first-audio, and keep player state shared across screens.
- Lists: use virtualized lists for long feeds/catalogues; avoid rendering entire catalogues in a ScrollView.
- App size: track release bundle size over time and investigate regressions rather than imposing an unverified target now.

## Implementation rules
1. Keep first-screen dependencies minimal; defer nonessential analytics and secondary sections until after first paint.
2. Avoid duplicate requests; deduplicate in-flight catalogue/profile requests and cache safe responses with explicit expiry/invalidation.
3. Keep UI state updates narrow; memoize expensive derived data and list rows only where profiling demonstrates benefit.
4. Avoid blocking startup on analytics, external link checks, campaign metrics, or remote health checks.
5. Do not silently retry writes that may create duplicate posts, uploads, campaigns, payments, or play events. Use server-side idempotency keys.
6. Use image dimensions and lightweight thumbnails; use pagination/cursors for growing feeds and music catalogues.
7. Keep audio and uploads out of UI-thread work; uploads need progress, cancellation, resumable/retry semantics where supported.
8. Accessibility, safe areas, reduced motion, and lower-memory devices remain release requirements.

## Measurement and release gates
- Record cold/warm launch, first usable render, navigation response, feed request latency, image load latency, audio time-to-first-audio, JS/UI frame drops, crash-free sessions and memory pressure.
- Benchmark release builds on at least one supported older iPhone and a current iPhone, plus representative Android devices, on both strong and constrained networks.
- Compare p50/p95/p99 and regressions by app version; avoid reporting averages alone.
- Run profiling with realistic catalogue/feed sizes and production-like media, not just seed data.
- Keep analytics privacy-conscious; never collect secrets, raw audio, signed URLs, or unnecessary personal data.
- A release must not be called performance-verified until the recorded test report names device, OS, build, network conditions, sample size, results, and unresolved regressions.

## Current verification status
The targets in this document are goals only. No benchmark results are asserted here. The current native validation workflow typechecks, runs Expo Doctor, and exports the iOS JavaScript bundle; those checks do not replace real-device performance profiling or an EAS/TestFlight build.
