# Kilode account architecture audit

Audit target: native Expo React Native repository, branch main. This is an implementation checklist, not a claim that all account workflows are complete.

## Stable public account kinds

Keep the current ten IDs stable to avoid breaking registration, persisted profiles, and capability lookup:

| ID | Registration label | Primary workspace |
|---|---|---|
| member | Everyday member | Socials participation, profile, job discovery |
| artist | Artist / musician | Music releases, artist profile, fan growth |
| writer | Writer / publisher | Media authoring and publishing |
| advertiser | Advertiser | Advertising campaigns |
| cinema | Cinema / film publisher | Cinema content management |
| job_poster | Employer / job poster | Vacancies and applicant management |
| job_seeker | Job seeker | Career profile and job discovery |
| vendor | Marketplace seller | Product listings and seller tools |
| renter | Space / property lister | Rental/space listings |
| brand | Brand / business | Business workspace and approved campaign tools |

## Shared product architecture

- Home is a hybrid discovery feed, not a separate account type.
- Socials is the shared social system. Creators and Communities are sections inside Socials, not additional top-level systems or public account kinds.
- Music, Media, Events, Market, Jobs, Ads/Business, Cinema, and My Space remain product systems. A role's capability map only identifies relevant tools; it does not prove the underlying system is implemented.
- A user may need multiple professional capabilities over time. Do not silently change an existing account kind to grant a new capability. Decide explicitly whether account switching, multiple workspaces, or verified secondary roles are supported, and migrate data safely if introduced.
- Subscription tier, purchased credits, staff status, verification, and account kind are separate dimensions.

## Capability map review

The native account capability map currently maps workspace relevance for all ten kinds. Treat it as client-side navigation guidance only. It must never be the authorization boundary. Every write/action endpoint must check authenticated identity, ownership, role permission, plan entitlement, quota, and moderation state on the trusted backend.

Before connecting capabilities to screens, verify:
- every capability maps to an actual native screen/action or is explicitly marked unavailable;
- users never see a successful action when the API is unavailable;
- hidden buttons are not treated as security;
- a malformed/unknown account kind safely falls back to member defaults;
- all ten IDs remain in sync between registration, persisted profile parsing, capability map, and server schema;
- account-type changes cannot bypass limits or access another account's private data.

## Confirmed registration persistence gap

The native signup handler receives the selected `kind`, but the current `lib/auth.tsx` signup request sends only email, password, and display name to `/api/auth/sign-up/email`. The selected kind is then attached to the local client session. That means this repository does **not** prove the chosen account kind is stored in the trusted user record or returned consistently on another device.

Do not patch this by assuming the remote auth provider accepts arbitrary fields. Before live registration is enabled, the dedicated backend must explicitly validate and persist the approved account kind in its user schema, return it in the authenticated user/session response, and enforce role permissions server-side. Add integration tests proving each of the ten kinds survives signup, sign-in, app restart, and account/profile reload. Until then, the registration kind is a local client choice, not a verified server-side role.

## Account-specific gaps to resolve

- **member:** retain useful free core participation; avoid presenting job discovery as the only non-social capability.
- **artist:** formal Music release flow, upload credits, rights declaration, review status, catalogue management, Push Link and paid entitlement checks are not yet verified as live.
- **writer:** authoring, drafts, publishing workflow, editorial review and paid publishing tools need end-to-end verification.
- **advertiser:** campaign creation, budget/payment, moderation, delivery, reporting and refunds need a trusted lifecycle.
- **cinema:** content rights, submissions, approval, playback/hosting and promotion need real workflow verification.
- **job_poster:** job creation, expiry, moderation, applicant privacy and recruitment entitlements need backend enforcement.
- **job_seeker:** profile privacy, applications, saved jobs and optional premium career tools need clear free/paid boundaries.
- **vendor:** inventory, listing limits, order/contact flow, seller identity, moderation and any fees need definition and testing.
- **renter:** listing ownership, location/privacy, availability, abuse reporting and listing/promotion limits need definition and testing.
- **brand:** distinguish brand identity from advertiser permissions; grant campaign tools only when the user has the correct permission and any required entitlement.

## Do not create extra public kinds by default

- Event organiser/promoter: assess as an Events capability/permission first, not automatically an eleventh kind.
- Community owner/moderator: use scoped community membership/roles.
- Independent creator/influencer: support via Socials/Creators and relevant creator capabilities rather than duplicate the artist/writer/brand account taxonomy.
- Label/artist manager: consider a verified team/roster relationship with explicit artist consent and permissions; do not assume ownership of artists' catalogues.
- Service provider: add only after a real service marketplace workflow is approved.
- Super Admin/moderator: protected staff role, never public registration and never purchasable.

## Monetisation boundaries

- Keep account kind separate from subscription and usage credits.
- Define core free capabilities and each paid entitlement before implementing checkout.
- Music release credits, Push Link campaign budgets, advertising spend, and recurring subscriptions are distinct ledgers/products.
- Do not show prices as final until approved. Never award paid entitlements based only on client state or redirect.
- Preserve published catalogue and user data after subscription lapse; disclose grace periods, refunds, cancellation, and takedown rules.

## Validation gate

- [x] Ten existing public account IDs inspected in the native account kinds file.
- [x] Typed native capability map inspected.
- [x] Native validation (TypeScript, Expo Doctor, iOS JS bundle export) passed for commit 5bd8f9bc12f89a2c139ea0d97d23df1df508b057.
- [ ] Verify registration persists the selected kind and that every kind reaches the correct native workspace.
- [x] Add automated invariants for all ten IDs and capability entries (`npm run check:account-capabilities`).
- [ ] Implement and test server-side authorization, entitlements, quotas, and audit logging.
- [ ] Verify each critical workflow against a dedicated backend and on a real iPhone.
- [ ] Confirm an installable EAS/TestFlight build; bundle export is not an iOS device build.
