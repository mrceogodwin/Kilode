# EAS setup — Expo account `mudino`

**Account:** https://expo.dev/accounts/mudino  
**Native repo:** https://github.com/mrceogodwin/Kilode

The native app must use Kilode's dedicated backend when it is ready. Do not restore the old `kilode-nine.vercel.app` or `kilode-v2.vercel.app` API URL as a fallback. Until a dedicated API URL is configured, live API requests intentionally fail closed rather than presenting seed data as live.

## 1. Link the real EAS project once

Run these commands locally. Do not paste passwords, tokens, or signing credentials into chat.

```bash
npm install
npx eas-cli login
npx eas-cli whoami
# Must print: mudino
npx eas-cli project:info
```

If `project:info` shows the existing Kilode project, reuse it. If it reports the project is not linked, run:

```bash
npx eas-cli init
```

Select account `mudino`, then link the existing Kilode project if present. Create a new project only if no existing Kilode project exists. Confirm the generated project ID is in `app.json` under `expo.extra.eas.projectId`; do not leave it empty. Commit the resulting config.

## 2. GitHub Actions secrets

To enable the manual iOS preview workflow, add these repository Actions secrets in GitHub Settings → Secrets and variables → Actions:

- `EXPO_TOKEN`: an Expo access token with access to the Kilode project.
- `EAS_PROJECT_ID`: the project ID from the linked EAS project.

Never commit either value to the repository or print it in workflow logs.

## 3. Build a preview iOS app

Once the project is linked and both secrets are configured, open GitHub Actions → **Kilode iOS device preview build** → Run workflow. It builds the `preview` profile for iOS and uploads the EAS build URL to the job log. This targets a physical iPhone (not the simulator) using the `preview` internal-distribution profile. It is not a TestFlight submission. EAS signing credentials and the required repository secrets must still be configured; a successful workflow is needed to confirm the build actually completes.

The production build should only be run after preview installation and backend configuration have been verified.

## 4. Build locally

```bash
npx eas-cli build --platform ios --profile preview
```

Bundle identifier: `ng.kilode.app`.

## 5. Backend status

The native client currently has no configured dedicated API host. Set `EXPO_PUBLIC_API_URL` only when the dedicated Kilode API is deployed and its mobile endpoints have been tested. Until then, API-backed features are not production-connected. Do not label local seed data as live.
