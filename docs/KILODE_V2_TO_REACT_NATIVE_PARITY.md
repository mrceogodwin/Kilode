# Kilode-v2 → React Native parity

**Generated:** 2026-10-19  
**Method:** Direct GitHub source inspection (not guessing)

---

## 1. Repository verification

| Role | Repo | Default branch | Latest commit inspected | Notes |
|------|------|----------------|-------------------------|-------|
| **SOURCE product** | `mrceogodwin/Kilode-v2` | `main` | `524dd5fd60` (2026-10-16) *ops-panels-b stubs* | Vite + TanStack Start, server fns, better-auth, Neon/PGLite |
| **TARGET mobile** | `mrceogodwin/Kilode` | `main` | `550f688b12` (2026-10-19) | Expo 51 / RN 0.74 shell |

### Source stack (evidence: `Kilode-v2/package.json`)
- Vite app (`vite dev` / `vite build`)
- TanStack (`createServerFn` in register-server, takes, forum, etc.)
- better-auth (password hash in `register-server.ts`)
- DB via `@/lib/db` + migrations
- Deployed surface related to production web: Kilode Nine on Vercel

### Target stack (evidence: `Kilode/package.json`)
- Expo `~51.0.28`, React Native `0.74.5`, React `18.2.0`
- AsyncStorage only for session
- **No** navigation library beyond custom tab state
- **No** better-auth / TanStack client

### Critical architecture fact (API)
Kilode-v2 does **not** expose a public mobile REST JSON catalog the way a typical `/api/posts` SPA does.

Business logic lives in:
- `src/lib/*-server.ts` modules using **`createServerFn`** (TanStack React Start)
- Client orchestration in `src/lib/use-qonvo.ts` (~61KB, single export `useQonvo`)
- Large UI modules (e.g. `socials-feed.tsx` ~113KB)

Calling `https://kilode-nine.vercel.app/...` from Expo with `Accept: application/json` returns **non-JSON / 406** because the deployed app is an HTML document app + server functions, not a free-form public JSON API for arbitrary mobile clients.

**Implication:** RN cannot “just fetch Nine JSON” without either:
1. New explicit mobile API routes on the server (preferred), or
2. A documented bridge that invokes the same server functions with correct session cookies/tokens.

Seed fallback in RN is a **development consequence** of that gap — not a product feature.

---

## 2. Source module inventory (files read or size-mapped)

### Components (61 files) — largest by bytes
| File | Bytes | Role |
|------|------:|------|
| `src/components/qonvo-screens.tsx` | 203354 | Screen router / large product surface |
| `src/components/socials-feed.tsx` | 113138 | Socials: TakeCard, Fact/Cap, follow, trends, jobs rail |
| `src/components/markets-desk.tsx` | 30025 | Marketplace |
| `src/components/social-first.tsx` | 29882 | Social entry |
| `src/components/listings-pane.tsx` | 22953 | Listings |
| `src/components/spaces-pane.tsx` | 20183 | Spaces |
| `src/components/music-hub.tsx` | 19131 | Music discovery / artists |
| `src/components/qonvo-app.tsx` | 18267 | App shell |
| `src/components/events-pane.tsx` | 16813 | Events |
| `src/components/tv-pane.tsx` | 16162 | Kilode TV |
| `src/components/artist-push.tsx` | 15932 | Artist promotion |
| `src/components/downloads-pane.tsx` | 15726 | Downloads |
| `src/components/me-dashboard.tsx` | 13962 | My Space / dashboard |
| `src/components/feeds-hero.tsx` | 13123 | Home hero / media |
| `src/components/engage-rail.tsx` | 12998 | Engagement |
| `src/components/shop-desk.tsx` | 12390 | Shop |
| `src/components/ops-panels-a.tsx` | 11875 | Ops |
| `src/components/communities-hub.tsx` | 11537 | Communities |
| `src/components/advert-pane.tsx` | 11456 | Ads |
| `src/components/home-media-lane.tsx` | 11369 | Home media |
| `src/components/post-rich-editor.tsx` | 8915 | Composer |
| `src/components/cinema-pane.tsx` | 8019 | Cinema |
| `src/components/notify-bell.tsx` | 7630 | Notifications UI |
| `src/components/onboard-sheet.tsx` | 6991 | Onboarding |
| `src/components/pay-checkout.tsx` | 6698 | Payments UI |
| `src/components/account-kind.tsx` | 5441 | Account type picker |
| `src/components/rooms-list.tsx` | 5140 | Rooms |
| … | … | (remaining components listed in GitHub) |

### Server / data (lib) — largest
| File | Bytes | Role |
|------|------:|------|
| `src/lib/takes-server.ts` | 83057 | Takes / posts server |
| `src/lib/forum-server.ts` | 69418 | Forum, chat msgs, pins, ads rows, tracks |
| `src/lib/qonvo-seed.ts` | 68781 | Seed / demo content |
| `src/lib/use-qonvo.ts` | 61035 | **Primary client state machine** |
| `src/lib/news-engine-server.ts` | 40287 | News |
| `src/lib/staff-server.ts` | 38606 | Staff / moderation |
| `src/lib/markets-server.ts` | 30604 | Markets |
| `src/lib/pay-gateways.ts` | 27537 | Payments |
| `src/lib/listings-server.ts` | 23698 | Listings |
| `src/lib/cinema-server.ts` | 21218 | Cinema |
| `src/lib/artist-server.ts` | 19025 | Artists |
| `src/lib/qonvo-data.ts` | 16187 | Types, MENU, ROOMS, ACCOUNT_KINDS |
| `src/lib/social-server.ts` | 15065 | Notes / social graph bits |
| `src/lib/events-server.ts` | 14864 | Events |
| `src/lib/register-server.ts` | 7764 | Registration (`registerAccount` server fn) |
| `src/lib/auth/*` | many | better-auth gates, session, identity |

### MENU (source of truth: `qonvo-data.ts`)
Home, Feeds & topics, Communities, Search, Create, Dashboard, Edit profile, Bookmarks, Notifications, Messages, Teams, Badges, Leaderboard, Trending tags, Kilode TV, Ads, Jobs, My Spaces, Marketplace, Rent, Contact, Admin, Settings, Help, How Kilode works, Pricing.

### ACCOUNT_KINDS (source)
member, artist, writer, advertiser, cinema, job_poster, (+ remaining kinds in same array in `qonvo-data.ts`).

### socials-feed verified behaviours (from source symbols)
- `TakeCard`, Fact/Cap (`FACT`/`CAP` strings present)
- Follow, Repost, Comment, Story, media, vote
- `JobRail`, `KnowRail`, trend pages
- Login gate (`needLogin`)

### useQonvo
- Single export: `useQonvo`
- Loads posts, msgs, ads, tracks, pins, presence via forum-server / social-server / staff-server
- Integrates `useCurrentUserState` from auth

---

## 3. Feature comparison (initial matrix)

States: `NOT IMPLEMENTED` | `PARTIALLY IMPLEMENTED` | `IMPLEMENTED — NOT VERIFIED` | `VERIFIED`

### A. Authentication & accounts
| Feature | Source paths | RN status | Notes |
|---------|--------------|-----------|-------|
| Register with account kind | `register-server.ts`, `account-kind.tsx`, `qonvo-data.ts` | PARTIALLY IMPLEMENTED | RN has local signUp + kind picker; **not** `registerAccount` server fn / better-auth |
| Login email/password | `src/lib/auth/*`, `login.tsx` | PARTIALLY IMPLEMENTED | Local AsyncStorage only |
| Session persistence | `gate-session.server.ts`, auth client | PARTIALLY IMPLEMENTED | AsyncStorage session; not server session cookie |
| Google / OAuth providers | `providers.ts`, auth | NOT IMPLEMENTED | RN stub only |
| Logout | auth | PARTIALLY IMPLEMENTED | Clears local session |
| Profile edit | me-dashboard, profile menu | NOT IMPLEMENTED | Button only |
| Permissions by kind | `permissions.ts`, board-rules | NOT IMPLEMENTED | |

### B. Home & discovery
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Live feed / hero | feeds-hero, home-media-lane, useQonvo | PARTIALLY IMPLEMENTED | Carousel + seed news/rooms |
| Rooms list | rooms-list, ROOMS, forum-server | PARTIALLY IMPLEMENTED | Seed rooms + join local state |
| Trending | socials-feed TrendPage | PARTIALLY IMPLEMENTED | Chip sorts seed by likes |
| Pagination | useQonvo / servers | NOT IMPLEMENTED | |

### C. Socials
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Take feed | socials-feed TakeCard, takes-server | PARTIALLY IMPLEMENTED | Seed takes + images + Fact/Cap UI |
| Create post | post-rich-editor, savePost | PARTIALLY IMPLEMENTED | Text composer; posts land local on API fail |
| Fact/Cap | socials-feed | PARTIALLY IMPLEMENTED | Display only; no vote write |
| Comments | saveComment, Comments UX | PARTIALLY IMPLEMENTED | Sheet + postComment attempt |
| Follow graph | social-server | NOT IMPLEMENTED | Follow button toast only |
| Repost / share | socials-feed | NOT IMPLEMENTED | Share toast |
| Media upload | media-server | NOT IMPLEMENTED | |
| Stories | socials-feed | PARTIALLY IMPLEMENTED | Story row UI only |

### D. Chat & communities
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Rooms chat | forum-server listMsgs/saveMsg, useQonvo | PARTIALLY IMPLEMENTED | Seed threads; local input |
| Presence / typing | useQonvo MsgPack | NOT IMPLEMENTED | |
| Communities hub | communities-hub | NOT IMPLEMENTED | |
| Realtime | use-realtime, adaptive-poll | NOT IMPLEMENTED | |

### E. Media & news
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| News engine | news-engine-server | PARTIALLY IMPLEMENTED | Seed headlines |
| Article `/p/$id` | routes/p.$id.tsx | NOT IMPLEMENTED | |
| Ad slots | ad-slot, ad-slots-server | NOT IMPLEMENTED | |

### F. Music & artists
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Music hub | music-hub, artist-server | PARTIALLY IMPLEMENTED | Track list seed |
| Artist pages | artist.$slug.tsx, artist-push | NOT IMPLEMENTED | |
| External playback links | parseMusicUrl, DEMO_TRACKS | NOT IMPLEMENTED | Mini player state only |

### G. Cinema & video
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Cinema pane | cinema-pane, cinema-server | PARTIALLY IMPLEMENTED | Film list + vote UI; no real player |
| TV pane | tv-pane | NOT IMPLEMENTED | |

### H. Jobs, events, listings, markets
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Jobs | listings / socials JobRail | PARTIALLY IMPLEMENTED | Seed job cards |
| Events | events-pane, events-server | PARTIALLY IMPLEMENTED | Seed list |
| Market / rent / shop | markets-desk, shop-desk, listings-pane | PARTIALLY IMPLEMENTED | Seed listings |
| Apply / enquire | servers | NOT IMPLEMENTED | |

### I. Advertising & payments
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Ad placement / campaigns | advert-pane, pay-gateways, pay-checkout | NOT IMPLEMENTED | |
| Wallet / Paystack | pay-* | NOT IMPLEMENTED | UI placeholder only |

### J. Activity & notifications
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Notes / activity | social-server pushNote, listNotes | PARTIALLY IMPLEMENTED | Seed activity list |
| notify-bell | notify-bell.tsx | NOT IMPLEMENTED | |

### K. My Space
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Dashboard | me-dashboard | PARTIALLY IMPLEMENTED | Profile shell |
| Downloads / library | downloads-pane | NOT IMPLEMENTED | Desk entry only |

### L. Ops / admin
| Feature | Source | RN status | Notes |
|---------|--------|-----------|-------|
| Staff tools | ops-panels-*, staff-server | NOT IMPLEMENTED | Must stay staff-gated |

---

## 4. Read coverage honesty

| Module | Coverage |
|--------|----------|
| Repo roots, package.json both sides | Full |
| Component / lib file inventory + sizes | Full list |
| `qonvo-data.ts` types, MENU, ACCOUNT_KINDS, cats | Read |
| `use-qonvo.ts` | Header + export surface; **not** all 1731 lines line-by-line |
| `socials-feed.tsx` | Symbol map + behaviour flags; **not** all 2662 lines |
| `register-server.ts` | Header + `registerAccount` server fn confirmed |
| `forum-server` / `takes-server` | Export sampling; full body not exhaustively read |
| `qonvo-screens.tsx` (203KB) | **Not fully read** — required next |
| Every `*-server.ts` body | Partial |

Unread sections will be closed module-by-module during port stages. This document will be updated with paths and evidence when a feature moves status.

---

## 5. Blockers

1. **No public mobile JSON API** matching RN `lib/api.ts` expectations — server functions + HTML app.
2. **Auth model mismatch** — better-auth + server session vs AsyncStorage guest/local.
3. **RN app is ~shell** relative to v2 module surface (evidence: file sizes and matrix above).

---

## 6. Next implementation order (dependency-correct)

1. Document + fix **API contract** (mobile routes or bridge) — Stage 3.
2. Align **auth** to real register/login when API exists; until then keep local but label production gap.
3. Port **Socials** behaviours from `socials-feed` against real takes API.
4. Port **Chat/rooms** from forum-server contracts.
5. Music, Cinema, Jobs, Events, Ads, Payments in source order.

Status percentages will only be reported as **count of VERIFIED features / inventory size**, not guesses.
