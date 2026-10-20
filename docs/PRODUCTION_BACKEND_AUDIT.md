# Kilode production backend audit

**Audit date:** 2026-10-20  
**Branch audited:** `preview/web`  
**Production status:** NOT READY — do not treat this branch as a production deployment.

This document records repository evidence, not a claim that a live Supabase project has been deployed.

## Verified in source

- The native app has a dedicated Supabase client in `lib/supabase.ts`.
- The app uses environment-driven configuration and has no default dependency on Kilode Nine or Kilode-v2.
- SQL migrations exist for core tables, account-type write restrictions, music publishing, support, campaign analytics/payment safeguards, profile privilege guards, and artist follows.
- The latest observed native-validation and web-preview GitHub Actions runs for commit `95ba94a99c062b0b606ebccda40597317469c9f4` completed successfully. These checks do not validate a live backend or physical iPhone.

## Release blockers found

1. **No verified live backend configuration.** The repository status document says the dedicated Supabase project, environment values, migration application, and sign-up → profile → post smoke test are not verified.
2. **Migration ordering needs staging verification.** The repository migration filenames now have unique sequential versions (`001`–`017`) in dependency order: core schema, Music platform, auth profile bootstrap, then account policies and dependent migrations. This fixes the repository filename collision and restores the ordering required by migrations `004`–`016` (now `005`–`017`), but does not prove a live database's migration history is reconciled. Inspect any existing project's migration history before applying migrations.
3. **Privileged workflows are intentionally incomplete.** The payment migration revokes client writes and explicitly says a trusted payment-intent Edge Function and verified provider webhook are not yet implemented. Campaign activation and analytics also require trusted server-side processing.
4. **Storage and policies need live verification.** Source SQL is not proof that RLS, bucket policies, grants, and triggers were applied correctly in the dedicated project.
5. **Native release configuration remains unverified.** The backend status notes that `app.json` has an empty EAS project ID; the installable iOS build and physical-device test are separate release gates.

## Required implementation and verification order

- [ ] Confirm ownership/access to the dedicated Supabase project; never put service-role keys in the app or chat.
- [ ] Inspect the live migration history before applying the reordered files; apply the uniquely numbered migrations to a fresh disposable staging project first. If any migrations were previously applied to a live project, reconcile migration history rather than blindly reapplying.
- [ ] Apply migrations in a deterministic order to a disposable staging project first.
- [ ] Add automated SQL checks for RLS, grants, triggers, and account-kind privilege escalation.
- [ ] Run end-to-end tests for signup, profile bootstrap, login/logout, feed read, post create/edit/delete, likes/replies, and cross-account access denial.
- [ ] Implement trusted Edge Functions and signed, idempotent payment webhooks before enabling payments or entitlements.
- [ ] Implement trusted campaign state transitions and server-recorded metrics before enabling Push Link billing or reporting.
- [ ] Verify private audio/media storage and ownership checks with two separate test accounts.
- [ ] Configure EAS project/build credentials, build iOS, and test core journeys on a physical iPhone.
- [ ] Only mark production-ready after all gates pass against the deployed environment.

## Safety rule

Never mark a feature complete merely because its UI, client helper, or migration file exists. A production claim requires a deployed implementation plus repeatable tests and observed results.
