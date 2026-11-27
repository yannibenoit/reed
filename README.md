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

## Checks

```bash
npm run lint
npm run typecheck
npm test
```

All three run in CI on every push (`.github/workflows/ci.yml`).
