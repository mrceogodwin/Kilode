# EAS setup — Expo account `mudino`

**Account:** https://expo.dev/accounts/mudino  
**Native repo:** https://github.com/mrceogodwin/Kilode  
**Website/API:** https://github.com/mrceogodwin/Kilode-v2 (Vercel — not EAS)

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

## Website

Do not deploy this repo on Vercel as Kilode web. Website + `/api/mobile/*` stay on **Kilode-v2**.


## Current verified status (2026-10-19)

- The native repo is `mrceogodwin/Kilode`, branch `preview/web`.
- TypeScript and Expo Doctor pass in the build environment; iOS and web JavaScript bundles export successfully.
- This is **not** a completed native iOS binary build.
- `app.json` still has an empty `extra.eas.projectId`. The automated build environment is not logged in to Expo.
- The native API host is `https://kilode-v2.vercel.app`; its health endpoint currently reports `ready: false` because the persistent database and explicit production auth credentials are missing.
- The browser preview is the same React Native screen code exported for web; it is not an iPhone simulator or proof of native-device behavior.

## Automated iOS preview build

A manual GitHub Actions workflow is available at **Actions → Kilode iOS EAS preview build → Run workflow** after the project is linked and repository secrets are set.

Required repository Actions secrets:

- `EXPO_TOKEN`: an Expo access token for the `mudino` account.
- `EAS_PROJECT_ID`: the project ID produced by `eas init`.

Create/link the EAS project first using the commands above, commit the resulting project ID, and verify `eas project:info`. Then add those secrets under GitHub → Settings → Secrets and variables → Actions. The workflow builds the **preview** profile only; it does not submit to the App Store or deploy production.

Do not paste Expo tokens, Apple credentials, database URLs, OAuth secrets, or Supabase service-role keys into chat or commit them to Git.
