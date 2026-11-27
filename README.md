# Reed

Read-later app for iOS, Android and Web — turns saved articles into a small daily reading habit.

- Product intent: `docs/specs/init_app/intent.md`
- MVP PRD: `tasks/prd-reed-mvp.md`
- Work tracking: GitHub issues (see `CLAUDE.md`)

## Repo layout

| Path | What |
| --- | --- |
| `apps/app` | Expo (React Native + React Native Web) app for iOS, Android and Web |
| `packages/core` | Shared TypeScript types and pure logic (used by app, backend functions, Chrome extension) |
| `supabase/` | Supabase config, SQL migrations, edge functions |

## Getting started

```bash
npm install
cp .env.example apps/app/.env.local   # fill in Supabase URL + anon key
npm run web                           # or: npm run ios / npm run android
```

### Supabase environments

- **Local:** `npm run db:start` (needs Docker) — prints a local URL and anon key for `.env.local`.
- **Dev / prod:** two hosted Supabase projects. Keys live only in env vars
  (`apps/app/.env.local` locally, EAS secrets / hosting env for builds). Link with
  `npx supabase link --project-ref <ref>` and push migrations with `npx supabase db push`.
- **Pointing the app at the local stack** while `.env.local` holds the hosted dev keys: put the local
  values in `apps/app/.env.development.local` (gitignored; it wins over `.env.local`).

### Auth providers (US-002)

Email (password + magic link) works out of the box locally; magic-link emails land in Mailpit
(`http://127.0.0.1:54324`). Apple and Google are off locally and configured per hosted project:

- **Redirect URLs** to allow: `<web origin>/auth/callback` and `reed://auth/callback`.
- **Google:** OAuth client (web) → Supabase Auth → Providers → Google.
- **Apple:** Services ID + key for web, bundle id `app.reed.ios` for native iOS sign-in
  (id token). Both ids go in the Apple provider's client ids.
- To try them locally, export `SUPABASE_AUTH_EXTERNAL_{GOOGLE,APPLE}_{CLIENT_ID,SECRET}` and set
  `enabled: true` in `supabase/config.jsonc`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run db:test       # pgTAP schema + RLS tests (local stack running)
npm run db:test:auth  # RLS with two real accounts through the API (local stack running)
```

All of these run in CI on every push (`.github/workflows/ci.yml`).
