# Kilode native migration tracker

**Target app:** `mrceogodwin/Kilode` (Expo React Native)  
**Release priority:** native iOS first.

## Verified status

| Area | Status | Notes |
|---|---|---|
| TypeScript / Expo Doctor / iOS JS bundle | Previously passed on main | Latest run after the auth fix must finish before this commit is considered validated. |
| EAS build workflow | Added | Manual workflow: `.github/workflows/eas-ios-preview.yml`. Requires `EXPO_TOKEN` and `EAS_PROJECT_ID` GitHub Actions secrets. |
| EAS project linkage | BLOCKED | `app.json` still has an empty project ID until the real project under Expo owner `mudino` is linked. Do not invent an ID or create duplicate projects. |
| Dedicated API backend | NOT CONNECTED | `EXPO_PUBLIC_API_URL` is intentionally empty by default. Do not use the old Nine or v2 deployment as a silent fallback. |
| Authentication | FAIL-CLOSED | Sign-in/sign-up now return an explicit unavailable error without a configured API, rather than creating a fake local authenticated account. Guest access remains separate. A real backend contract and session flow still need implementation and testing. |
| Signed iOS build / TestFlight | NOT VERIFIED | A JavaScript bundle artifact is not an IPA. No successful EAS build or TestFlight delivery is claimed. |
| Physical iPhone test | NOT DONE | Must install and exercise the signed preview on a real device. |

## Required next steps

1. Link the existing Kilode EAS project under Expo owner `mudino` and commit its real project ID.
2. Add GitHub Actions secrets `EXPO_TOKEN` and `EAS_PROJECT_ID`.
3. Run **Kilode iOS EAS preview build** from GitHub Actions and resolve any actual build/signing errors from its logs.
4. Implement and deploy the dedicated Kilode API and authentication/session contract; configure `EXPO_PUBLIC_API_URL` only after the endpoints are verified.
5. Test login, registration, guest mode, feed, posting, music, network errors and sign-out on a physical iPhone.
6. Only then assess TestFlight distribution and production release readiness.

## Guardrails

- Never present seed/local data as live server data.
- Never treat a local placeholder token as authenticated.
- Never claim EAS, signing, TestFlight, or device testing succeeded without a corresponding run/device result.
- Keep native iOS as the primary deliverable; web preview is not a substitute.
