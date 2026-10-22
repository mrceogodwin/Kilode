# Kilode feature status (native repository inspection)

This is a code-inspection audit, not a claim of complete production readiness.

| System / capability | Current assessment | Notes |
|---|---|---|
| Home hybrid discovery | PARTIALLY IMPLEMENTED | Feed + seed fallback |
| Media / news | UI ONLY / SEED | |
| Socials | PARTIALLY IMPLEMENTED | Composer + local likes/follows |
| Music | PARTIALLY IMPLEMENTED | Player, library, sample audio |
| Artist release drafts | PARTIALLY IMPLEMENTED | Type, metadata, local audio URI, rights; Create → Track |
| Events | PARTIALLY IMPLEMENTED | Local drafts; Create → Event; My Space; desk entry |
| Jobs | PARTIALLY IMPLEMENTED | Local drafts (title, company, location, type, salary, notes); Create → Job; My Space; desk entry. Seed listings remain. No publish/applications |
| Market / Rent / Ads / Cinema | UI ONLY / SEED | |
| My Space | PARTIALLY IMPLEMENTED | Settings, artist/event/job draft shortcuts |
| Auth | PARTIALLY IMPLEMENTED | Guest local; real API blocked |
| Dedicated mobile API | BLOCKED | |
| Payments / EAS | NOT IMPLEMENTED / UNVERIFIED | |

## Guardrails
- Native iOS is source of truth.
- Local drafts ≠ published. No fake success.
- Super Admin is staff permission, not public registration.
- Backend enforces real permissions and entitlements.

## 2026-10-22
- Artist: releaseType + local audio
- Events + Jobs: local draft workspaces wired from Create, My Space, and desks
