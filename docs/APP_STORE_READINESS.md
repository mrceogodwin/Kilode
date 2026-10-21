# Kilode — App Store readiness assessment

**Native repository:** `mrceogodwin/Kilode`  
**Target:** Expo React Native iOS app, bundle ID `ng.kilode.app`  
**Brand:** Kilode dark premium palette — `#0D0D10`, `#18181C`, gold `#D4AF37` / `#E5C158`, white and muted grey. Do not substitute a green or blue/white theme.

This is a live checklist, not a claim of approval or production readiness. Automated validation is useful, but does not replace installing and manually testing the app on an iPhone.

## A. Verified from the repository

| Item | Current evidence |
|---|---|
| Expo React Native project | `package.json`, `App.tsx`, `KilodeRoot.tsx` |
| iOS bundle identifier | `app.json`: `ng.kilode.app` |
| EAS project ID present in config | `app.json`: `b9f2e786-665d-46e5-9a7c-7af7ab25e0ea` |
| Native validation workflow | TypeScript, Expo Doctor and iOS JS bundle export in `.github/workflows/kilode-native-validation.yml` |
| Recent automated validation | Music playback accessibility commit `5aa532d` passed GitHub Actions |
| Device install / real iPhone testing | **Not yet verified** |
| App Store submission / approval | **Not yet submitted or approved** |

The automated validation workflow exports a JavaScript bundle; it is not an installable iOS build.

## B. Confirmed submission blockers / decisions

| Item | Status and next action |
|---|---|
| App icon and splash artwork | **Missing from repository assets**; add and verify correctly sized branded assets before store submission |
| Privacy policy and terms | Publish real, accessible URLs and link them in the app; placeholders are not sufficient |
| App Privacy disclosures | Inventory actual collection, sharing, tracking and retention before completing App Store Connect privacy labels |
| Account deletion | Current UI/local wipe is not proof of server-side account deletion; implement and verify deletion for any server accounts |
| Password recovery | Not implemented; determine and build the required account-recovery flow |
| User-generated content moderation | Local report/block exists, but server-side intake, review and enforcement need implementation |
| Digital goods and fan payments | Classify each product under current Apple rules; implement the correct payment flow before enabling purchases |
| App Review test access | Prepare a working reviewer account and instructions if sign-in is required |
| Store listing | Prepare accurate description, screenshots, age rating, support contact and privacy details |
| iOS privacy manifest / SDK declarations | Audit the final dependency/build output against current Apple requirements |

## C. Backend and real-feature readiness

The native client must use Kilode's dedicated backend when deployed and verified. Do not silently point it at the old `kilode-nine.vercel.app` or `kilode-v2.vercel.app` services.

Before advertising a feature as live, test its full path: authentication, server response, failure states, persistence, and correct account ownership. Sample catalogue data and device-local drafts must remain clearly distinguished from live content. Fan earnings and streaming royalties must not display invented balances.

## D. Build and human test sequence

1. Confirm the Expo project and EAS credentials are linked to the intended `mudino` account. Never commit access tokens.
2. Run **Kilode iOS device preview build** from GitHub Actions after the `EXPO_TOKEN` and `EAS_PROJECT_ID` repository secrets are configured.
3. Confirm the EAS job completes and provides an installable iPhone build.
4. Install it on a real iPhone and test fresh install, registration/login/logout, account switching, navigation, keyboard and safe areas, create popup, chat composer, music playback/upload, offline and API-error states, and relaunch persistence.
5. Fix failures and repeat the relevant manual tests. Keep a record of device/iOS version, build number, steps and results.
6. Complete privacy, moderation, deletion, payment and store listing work before uploading a release candidate to TestFlight/App Store Connect.
7. Test the release candidate through TestFlight before submitting for Apple review.

Workflow: [Kilode iOS device preview build](https://github.com/mrceogodwin/Kilode/actions/workflows/eas-ios-preview.yml)

## E. Review risks

- Shipping prominent systems that are visibly incomplete or nonfunctional.
- User-generated content without effective reporting, blocking and moderation handling.
- Account deletion that only clears local device data when a server account exists.
- Digital purchases using a payment mechanism that does not satisfy Apple's current rules.
- Privacy labels or policy claims that do not match actual app behavior.
- Broken links, missing assets, crashes, inaccessible controls, or flows that cannot be tested by App Review.

**Approval is Apple's decision and cannot be guaranteed.** The objective is to remove known blockers and demonstrate reliable behavior with an installable, manually tested build before submission.
