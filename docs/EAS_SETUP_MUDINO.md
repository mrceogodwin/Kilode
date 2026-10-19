# EAS setup — Expo account `mudino`

**Expo account:** https://expo.dev/accounts/mudino  
**Native repo:** https://github.com/mrceogodwin/Kilode  
**Website/API repo (do not use for EAS):** https://github.com/mrceogodwin/Kilode-v2

Grok does **not** have access to your Expo account. You must run these commands on your computer.

## 1. One-time: install tools & log in

```bash
# Node 18+ recommended
npm install -g eas-cli

# Opens browser / device login — do NOT paste passwords into chat
eas login
```

Confirm you are `mudino`:

```bash
eas whoami
# expect: mudino
```

## 2. Clone and install

```bash
git clone https://github.com/mrceogodwin/Kilode.git
cd Kilode
git pull
npm install
```

## 3. Link EAS project (once)

Check for an existing project first (avoid duplicates):

```bash
eas project:info
```

- If a project is already linked and shows under **mudino** / slug **kilode**, skip create.
- If not linked:

```bash
eas init
# or: eas build:configure
```

When prompted:
- Use account **mudino**
- Prefer **link existing** if you already created “Kilode” on the dashboard
- Otherwise create **one** project with slug `kilode`

This writes `extra.eas.projectId` into `app.json` (commit that change).

```bash
git add app.json app.config.js
git commit -m "chore(eas): link projectId under mudino"
git push
```

## 4. Build iOS and Android

```bash
# iOS (physical device / TestFlight pipeline)
eas build --platform ios --profile production

# Android App Bundle
eas build --platform android --profile production

# Both
eas build --platform all --profile production
```

Optional internal distribution:

```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

## 5. Apple / Google credentials

EAS will prompt interactively (or use the dashboard):

```bash
eas credentials
```

- **iOS:** Apple Developer account + App Store Connect app for bundle ID `ng.kilode.app`
- **Android:** keystore can be generated/managed by EAS for package `ng.kilode.app`

Never commit `.p8`, `.p12`, keystores, or tokens.

## 6. Website / backend (unchanged)

| System | Repo | Host |
|--------|------|------|
| Website + `/api/mobile/*` bridge | Kilode-v2 | Vercel |
| Native app binary | Kilode | Expo EAS |

Native builds do **not** deploy the website.
