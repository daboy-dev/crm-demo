# CLAUDE.md · crm-demo

Mini CRM que modifican los agentes de [`crm-agents`](https://github.com/daboy-dev/crm-agents).
Las convenciones, la estructura y lo que no se toca están en **`AGENTS.md`**: léelo antes de cambiar nada.
Las decisiones y el proceso viven en `crm-agents/docs/`, no aquí.

## Comandos

- `pnpm dev` · servidor de desarrollo.
- `pnpm build` · build de producción (`pnpm vercel-build` migra antes, lo usa Vercel).
- `pnpm lint` · ESLint.
- `pnpm format` / `pnpm format:check` · Prettier (no toca el Markdown).
- `pnpm typecheck` · `next typegen` + `tsc --noEmit`.
- `pnpm test` · Vitest (`src/**/*.test.ts`).
- `pnpm test:e2e` · Playwright en local (necesita `.env.local` y datos).
- `pnpm db:generate` · migración desde `src/db/schema.ts`.
- `pnpm db:migrate` · aplica migraciones (usa `DATABASE_URL_UNPOOLED`).
- `pnpm db:seed` · datos de prueba, idempotente.
