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
