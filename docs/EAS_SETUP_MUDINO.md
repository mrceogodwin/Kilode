# EAS setup — Expo account `mudino`

**Account:** https://expo.dev/accounts/mudino  
**Native repo:** https://github.com/mrceogodwin/Kilode  
**Web preview:** Vercel is a visual mirror only; it is not the native app backend.

Grok cannot log into Expo. Run everything below on your machine.

## Authenticate

```bash
npm install -g eas-cli
eas login
eas whoami
# must print: mudino
```

Do not share passwords or tokens in chat.

## Project (avoid duplicates)

```bash
git clone https://github.com/mrceogodwin/Kilode.git
cd Kilode
git pull
npm install

eas project:info
```

- If already linked under **mudino** / slug **kilode** → do not create another project.
- If not linked:

```bash
eas init
```

Choose account **mudino**. Link existing project if one exists; otherwise create slug `kilode` once.

Commit the resulting `projectId` in `app.json`:

```bash
git add app.json
git commit -m "chore(eas): link EAS projectId under mudino"
git push
```

## Build iOS and Android

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

Profiles: `development` | `preview` | `production` (see `eas.json`).

Bundle ID / package: `ng.kilode.app`

```bash
eas credentials
```

## Native backend and web preview

- The source of truth is the Expo React Native app in this repository.
- Vercel may host a visual preview/export, but it is not proof of native iOS behavior and is not the native system of record.
- Native backend configuration is explicit: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` for the dedicated Supabase project, or `EXPO_PUBLIC_API_URL` for a deliberately configured custom API.
- Do **not** point the native app at `kilode-nine.vercel.app` or Kilode-v2. Without dedicated backend environment variables, the app resolves to offline/local mode; do not describe seeded data as live.


## Previously reported status (2026-10-19 — superseded)

The notes below are historical and must not be used as current configuration: they referred to an empty EAS project ID and Kilode-v2 as the native API. The current `app.json` contains EAS project ID `b9f2e786-665d-46e5-9a7c-7af7ab25e0ea`; `lib/config.ts` specifies dedicated Supabase/custom API configuration and offline/local mode when those values are absent. The native app must not default to Kilode-v2 or Kilode Nine.

- The browser preview is not an iPhone simulator or proof of native-device behavior.
- A successful JavaScript bundle or TypeScript check is **not** a completed native iOS binary build.

## Automated iOS preview build

A manual GitHub Actions workflow is available at **Actions → Kilode iOS EAS preview build → Run workflow** after the project is linked and repository secrets are set.

Required repository Actions secrets:

- `EXPO_TOKEN`: an Expo access token for the `mudino` account.
- `EAS_PROJECT_ID`: the project ID produced by `eas init`.

Create/link the EAS project first using the commands above, commit the resulting project ID, and verify `eas project:info`. Then add those secrets under GitHub → Settings → Secrets and variables → Actions. The workflow builds the **preview** profile only; it does not submit to the App Store or deploy production.

Do not paste Expo tokens, Apple credentials, database URLs, OAuth secrets, or Supabase service-role keys into chat or commit them to Git.


## Repair the current iOS preview signing failure (2026-10-21)

The latest failed GitHub Actions run verified that `EXPO_TOKEN` is present and `EAS_PROJECT_ID` matches `app.json`. The failure is specifically that EAS has no usable iOS **internal-distribution (Ad Hoc)** signing credentials available in non-interactive CI. This is not a TypeScript, JavaScript bundle, or project-ID failure.

**One-time setup must be completed by someone authorised to manage the Apple Developer account.** EAS cannot create Apple signing credentials from the GitHub runner without that interactive Apple account authorisation.

1. Confirm the Apple Developer Program membership is active for the team that owns bundle ID `ng.kilode.app`. A normal paid Apple Developer Program membership is sufficient; Enterprise membership is not required.
2. On a Mac or computer with Node.js, open a terminal and run:
   ```bash
   git clone https://github.com/mrceogodwin/Kilode.git
   cd Kilode
   git checkout preview/web
   npm install
   npm install --global eas-cli
   eas login
   eas whoami
   eas credentials
   ```
   Confirm `eas whoami` shows the authorised Expo account `mudino` and select **iOS** and the **preview** build profile when prompted.
3. In the interactive credential flow, sign in to the correct Apple Developer team when asked. Configure/create an Apple Distribution certificate and an **Ad Hoc provisioning profile** for `ng.kilode.app`. Reuse a valid existing certificate if EAS offers it; do not revoke credentials just to retry.
4. Register the iPhone that will install the preview: run `eas device:create` from the project, follow its registration link on the iPhone, and finish the device registration. Then rerun `eas credentials` if needed so the Ad Hoc profile includes that device.
5. Exit the interactive CLI after it confirms credentials are configured. Then rerun **Actions → Kilode iOS EAS preview build → Run workflow**. The CI build can reuse valid credentials non-interactively. If the profile needs its device list refreshed, do that interactively first; do not put Apple passwords or private keys in GitHub source.
6. Verify that the new EAS run produces an installable `.ipa` and an EAS build URL. A green TypeScript/bundle validation alone is not an installable iOS build.

Official guides: [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/) and [Apple Developer roles and permissions](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/).

Security: never send Apple passwords, recovery codes, Expo tokens, certificate passwords, or private signing files in chat or commit them to the repository.
