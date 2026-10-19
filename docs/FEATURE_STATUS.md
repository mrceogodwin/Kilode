# Kilode feature status (code inspection)

Latest audit of `main`. Status legend:

- **VERIFIED WORKING** — implemented and logically consistent in code (not device E2E here)
- **PARTIALLY IMPLEMENTED** — real UI + partial logic
- **UI ONLY** — screen/list exists, seed or no backend
- **NOT IMPLEMENTED**
- **BLOCKED** — needs external access

| System | Status | Evidence |
|--------|--------|----------|
| Home hybrid feed | PARTIALLY | `KilodeRoot` Home: carousel, chips, grid, news, rooms, takes |
| Media / news | UI ONLY | News cards + desk; no article reader backend |
| Socials | PARTIALLY | Composer, likes local, comments sheet, postTake API path |
| Music | UI ONLY | `screens/Music.tsx` + tracks seed |
| Push Link | NOT IMPLEMENTED | |
| Events | UI ONLY | Desk + `LISTINGS` seed |
| Market | UI ONLY | Desk seed |
| Jobs | UI ONLY | Desk seed |
| Communities | UI ONLY | Desk seed |
| Ads / business | NOT IMPLEMENTED | |
| Cinema | UI ONLY | `screens/Cinema.tsx` |
| Creators | UI ONLY | Desk seed |
| My Space | PARTIALLY | Profile, wallet placeholder, settings entry |
| Auth | PARTIALLY | Guest + local sign-in/up; Google stub; no password reset |
| Report / block | PARTIALLY | `lib/moderation.ts` local |
| Account deletion | PARTIALLY | Settings UI + local session clear |
| Notifications | UI ONLY | Activity list seed |
| Chat / messaging | UI ONLY | `screens/Chat.tsx` |
| Search | NOT IMPLEMENTED | |
| Payments | NOT IMPLEMENTED | Assess before integrate |
| Live API | BLOCKED | `/api/mobile/*` 406 on production host |
| EAS / TestFlight | BLOCKED | Needs `eas login` as mudino |

Web preview branch: `preview/web` (Expo web export). Staging URL may require Vercel auth.
