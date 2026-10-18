# Kilode (iOS React Native)

Real Expo React Native app for iOS — not a website shell.

## Run

```bash
npm install
npx expo start --ios
```

## Native UI (this pass)

- **No header logo** — wordmark removed so it does not look like a website. LIVE pill + Search + Activity + profile only.
- **Stable bottom dock** — no floating raised button. Fixed height, hairline top border.
- **Middle `+` = More** — opens Kilode services (Jobs, Market, Rent, Events, Cinema, Teams, Ads, Spaces, Chat, Music) + Create entry.
- **Premium tokens** in `theme.ts` / `styles.ts` — type scale, card elevation, button radii, dock labels.

## Files

- `App.tsx` — native shell (header, dock, More / Create sheets)
- `theme.ts` — blue/white design tokens
- `styles.ts` — shared StyleSheet
- `index.html` — optional web shell for Vercel project `kilodenew`

## Related

- Full web product: [Kilode-v2](https://github.com/mrceogodwin/Kilode-v2) → https://kilode-v2.vercel.app
- Vercel projects: `kilode`, `kilodenew`
