# Kilode feature status (native repository inspection)

Code-inspection audit only — not production readiness.

| System | Status | Notes |
|---|---|---|
| Home / Socials | PARTIALLY IMPLEMENTED | Seed + local toggles |
| Music | PARTIALLY IMPLEMENTED | Player, library, sample audio |
| Artist releases | PARTIALLY IMPLEMENTED | Local drafts + local audio URI |
| Events | PARTIALLY IMPLEMENTED | Local drafts · Create / My Space / desk |
| Jobs | PARTIALLY IMPLEMENTED | Local drafts · Create / My Space / desk |
| Market | PARTIALLY IMPLEMENTED | Local listing drafts · Create / My Space / desk. No orders/payments |
| Cinema / Ads / Rent | UI ONLY / SEED | |
| Auth | PARTIALLY IMPLEMENTED | Guest local; real API blocked |
| Dedicated mobile API | BLOCKED | |
| Payments / EAS | NOT IMPLEMENTED | |

## Guardrails
- Native iOS source of truth. Local drafts ≠ published.
- Super Admin = staff permission, not public registration.
- Backend enforces real permissions and entitlements.

## Artist monetisation decisions
See [`docs/ARTIST_MONETISATION_DECISIONS.md`](./ARTIST_MONETISATION_DECISIONS.md) (2026-10-22):
- Launch: no fan→artist payouts
- 1 credit = 1 master (EP/Album per track)
- Proposed free allowance: 3 credits
- Push Link = placement only, not charts
- Product owner must confirm checklist before billing UI

## 2026-10-22 local-draft verticals
Artist · Events · Jobs · Market — all device-only until dedicated APIs exist.
