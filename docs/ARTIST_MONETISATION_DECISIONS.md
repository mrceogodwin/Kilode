# Kilode artist monetisation — product decisions

Status: **proposed defaults for product-owner confirmation.**  
These decisions close the open questions in `ARTIST_UPLOADS_MONETISATION.md` and `NATIVE_ARTIST_RELEASE_API_CONTRACT.md`.  
They are **not** evidence that billing, upload, or payouts are implemented.

Last updated: 2026-10-22

---

## 1. Earnings story (launch stance)

**Decision:** At launch, Kilode does **not** move money from fans to artists.

- Kilode is for **hosting, discovery, Socials, and optional promotion**.
- Artists are **not** paid via member subscriptions, tips, stream royalties, or paid downloads inside Kilode at launch.
- Fan-to-artist payments (tips, artist memberships, royalties) are **out of scope for launch** and require a separate product decision later (wallets, KYC, payouts, disputes).
- Product and support copy must not imply that releasing or promoting on Kilode produces artist earnings.

**Why:** The architecture already defines how artists pay Kilode (credits, plans, Push Link). It does not define how artists earn. Launching without an earnings loop is honest; implying one without payouts is not.

**Revisit when:** Real payment rails, KYC, and support capacity exist for creator payouts.

---

## 2. What one release credit buys

**Decision:** One **release credit** = one audio master submitted for Kilode Music hosting review.

| Attribute | Rule |
|-----------|------|
| Unit | 1 credit → 1 audio file (one master) |
| Packaging | Single / EP / Album is **metadata only**. EP and Album do not get a bulk discount by folder name. Multi-track releases consume **one credit per track**. |
| Included | Upload acceptance, one moderation/rights review pass, hosting while the release remains in an allowed state (see hosting rules) |
| File limits | Exact max size / format / duration to be set with storage provider (placeholder until infra chosen) |
| Failed upload | **Platform-caused** failure (server/storage/transcode error) → credit restored. Artist-caused rejection (rights, policy, invalid file after finalize) → credit settled; resubmit needs a new credit unless policy says otherwise |
| Expiry of purchased credits | To be set with pricing (e.g. 12 months). Free-allowance credits may differ |
| Socials audio | **Does not** consume a release credit. Socials posts are not Music releases |

**Not included in a credit:** Push Link, guaranteed approval, chart placement, external-store delivery, analytics pack, team seats.

---

## 3. Free allowance

**Decision (proposed default — confirm number before billing UI):**

- New eligible **artist** accounts receive a **one-time introductory allowance of 3 (three) release credits**.
- Allowance is for formal Music releases only, subject to rights, abuse controls, and review.
- After the free credits are used, further releases require purchased credits or an active plan that grants credits.
- Free allowance is **not** unlimited and **not** a promise of publication.

Product owner may change `3` before implementation. Do not hard-code a different number in client UI until this doc is updated.

---

## 4. Plans vs credits vs account kind

| Concept | Meaning |
|---------|--------|
| Account kind `artist` | Workspace access (Releases, Music tools). **Free to hold.** Not a paid rank. |
| Free plan | Artist kind + free allowance (above) + core Socials/discovery |
| Credit pack | One-off purchase of N release credits |
| Artist subscription | Recurring: defined monthly credits + tools (analytics, catalogue, scheduling). Exact tier names/prices **not set in this doc** |
| Label / team (later) | Multi-artist roster + pooled credits — not launch |

**Upgrade CTAs must be specific:**

- No credits → “Get release credits”
- Wants tools → “Artist plan” (when a plan exists)
- Wants promotion → “Promote with Push Link”
- **Never** “Upgrade to Artist” as if the account kind is sold

---

## 5. Push Link

**Decision:**

> Push Link buys **paid placement** on designated Kilode surfaces for a set duration and budget. It does **not** buy chart position, editorial features, guaranteed streams, or release approval.

| Rule | Detail |
|------|--------|
| What it is | Campaign spend — separate from release credits and from subscription |
| Inventory (launch proposal) | Music discovery surfaces and eligible Socials/feed promo slots only. Exact slot list to be fixed with ads inventory before sale |
| Who can buy | Artists and other eligible account kinds (e.g. brand) when campaign product is live |
| Charts / editorial | **Money must not influence charts or editorial selection.** Push Link copy and ranking code must enforce this |
| Outcomes | Report delivery/spend only. No promise of streams, follows, or revenue |

Push Link is **not implemented**. Do not show a live campaign checkout until inventory and non-guarantee copy are final.

---

## 6. Hosting when a plan lapses

**Decision:**

- Published releases are **not** silently deleted when a subscription expires or credits run out.
- Define a **grace period** (proposed: 90 days) during which existing published releases stay hosted.
- After grace, product may limit **new** releases and optional promotion; takedown of old catalogue needs explicit policy and user notice — not an automatic silent wipe.
- Exact grace length and post-grace rules can be tightened with legal/support before launch.

---

## 7. External distribution

**Decision:** Out of scope for launch.  
No Spotify / Apple Music / other store delivery until real distribution partners and operational workflow exist. UI must not imply external delivery.

---

## 8. Prices and currency

**Not decided in this document.**  
No Naira/USD amounts, no App Store product IDs, no billing interval.  
Set prices only after infrastructure cost, moderation load, and Nigerian payment expectations are validated.  
Client must not invent or display fake prices.

---

## 9. Implementation order (engineering)

1. Backend: artist identity + entitlements + credit ledger (including free allowance).  
2. Backend: release draft → upload session → finalize → processing/review states.  
3. Native: wire real status; keep local drafts only as offline fallback if desired.  
4. Payment provider + App Store path decision → checkout for credit packs / plan.  
5. Push Link inventory + campaign API (after Music release path is stable).  
6. Specific upgrade CTAs tied to server entitlements.

Do not implement checkout before sections 1–3 of this doc are confirmed by the product owner.

---

## 10. Confirmation checklist (product owner)

- [ ] Launch earnings stance accepted (no fan→artist payouts at launch)
- [ ] One credit = one master; EP/Album = per track
- [ ] Free allowance number confirmed (default proposed: 3)
- [ ] Push Link sentence and chart integrity accepted
- [ ] Grace period direction accepted (default proposed: 90 days)
- [ ] Prices still deferred until cost validation

Until boxes are checked, treat numbers in this doc as **proposals**, not live business rules.
