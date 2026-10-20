# Dedicated backend for Kilode native (iOS / Android)

**Policy:** The Expo app does **not** use `kilode-nine.vercel.app` or Kilode-v2 as its application backend.

Vercel preview = visual export only.  
Dedicated backend = system of record for accounts, content, and moderation.  
EAS / TestFlight = native build readiness (separate).

---

## 1. What exists in the native repo today

| Area | Evidence |
|------|----------|
| Config | `lib/config.ts` — env-driven; no default host to v2/nine |
| HTTP client | `lib/api.ts` — REST-style `/api/mobile/*` when `API_BASE` set |
| Auth | `lib/auth.tsx` — tries email sign-in/up against `API_BASE`; falls back to **device-local** session (`localOnly`) |
| Account kinds | `lib/accountKinds.ts` + client `lib/permissions.ts` |
| Seed data | `data.ts` — layout only when offline |
| Moderation | `lib/moderation.ts` — largely local AsyncStorage |
| Schema | `supabase/migrations/001_kilode_core.sql` — includes posts/catalogue tables, RLS and Realtime publication setup |
| Supabase JS SDK | Installed in `package.json`; `lib/supabase.ts` provides the client and queries |
| Super Admin UI | **Missing** in native |

---

## 2. What must be created

1. **New Supabase project** (recommended name: `kilode-native` or similar).
2. Apply migration `001_kilode_core.sql`.
3. Enable Email auth (and later Apple / Google if required).
4. Configure Storage buckets for avatars/media with RLS.
5. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; the SDK and thin client are already in the repo.
6. Verify Socials post creation and feed reads against a real Supabase user. The shared client now includes read queries for Media, Music, Events, Market and Jobs.
7. Build the missing create forms and write handlers for Media, Music, Events, Market and Jobs, then enforce account-kind permissions server-side. Use Edge Functions/RPC for privileged moderation and admin operations.
8. Super Admin: `profiles.role = super_admin` set **only** by project owner in SQL — never via public signup.
9. Server-side enforcement of account-type capabilities (not only client `can()`).

---

## 3. Proposed authentication & schema

- **Auth:** Supabase Auth (email/password first).
- **Profile:** `public.profiles` with `kind` (`account_kind` enum matching app) and `role` (`user` \| `moderator` \| `super_admin`).
- **Content:** `posts`, `articles`, `tracks`, `events`, `market_listings`, `jobs`, plus likes/replies/reports/blocks. Native code already queries the read catalogues, publishes text posts, and subscribes to changes on the six discovery tables when Supabase is configured.
- **RLS:** enabled on all tables; public read where appropriate; writes scoped to `auth.uid()`.
- **Secrets:** only `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the app.

---

## 4. What you (owner) must provide

| Item | Why |
|------|-----|
| Supabase account + **new project** | Isolated data ownership |
| Project URL + **anon** key | Client config |
| Optional Apple Developer setup | Later Sign in with Apple |
| Billing if free tier exceeded | Supabase plan |

**Do not** send service_role keys in chat. Store them only in Supabase dashboard / CI secrets for Edge Functions.

---

## 5. Seed vs real data

| Mode | When | UI |
|------|------|-----|
| Offline / seed | No Supabase env, or `FORCE_MOCK` | ConnectionBanner; `source` mock/error; `localOnly` sessions |
| Live | Supabase configured + migration applied + auth works | Real rows; no fabricated engagement |

Never present seed as production users or live analytics.

---

## 6. Setup steps (owner)

1. Create Supabase project.
2. SQL → run `supabase/migrations/001_kilode_core.sql`.
3. Copy URL + anon key into local `.env` (from `.env.example`).
4. Confirm tip branch has updated `lib/config.ts`.
5. Next engineering step: add Supabase client dependency and replace seed reads for posts/profile.

Until step 3–4 complete, backend readiness = **not operational**.
