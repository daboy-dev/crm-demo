<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md · crm-demo

Guía para el agente Develop. Mini CRM: clientes, presupuestos y facturas. Next.js 16 (App Router),
TypeScript estricto, Tailwind, Drizzle + Neon (driver HTTP). Sin librería de componentes.

## Dónde va cada cosa

| Ruta                                    | Contenido                                                             |
| --------------------------------------- | --------------------------------------------------------------------- |
| `src/app/(crm)/<entidad>/page.tsx`      | Lista. Entidades: `clientes`, `presupuestos`, `facturas`.             |
| `src/app/(crm)/<entidad>/[id]/page.tsx` | Detalle.                                                              |
| `src/app/(crm)/<entidad>/nuevo/page.tsx`| Alta (clientes y presupuestos; las facturas se generan).              |
| `src/app/(crm)/<entidad>/queries.ts`    | Lecturas de base de datos.                                            |
| `src/app/(crm)/<entidad>/actions.ts`    | Server actions (escrituras). Solo exporta funciones `async`.          |
| `src/app/(crm)/<entidad>/validation.ts` | Esquemas Zod de los formularios y lista de campos.                    |
| `src/app/(crm)/<entidad>/*-form.tsx`    | Formularios (componentes cliente con `useActionState`).               |
| `src/db/schema.ts`                      | Tablas, enums y relaciones de Drizzle. Migraciones en `drizzle/`.     |
| `src/db/seed.ts`                        | Datos de prueba (`pnpm db:seed`, idempotente).                        |
| `src/lib/`                              | Utilidades puras con tests: dinero, fechas, totales, numeración.      |
| `src/components/`                       | UI compartida: `Button`, `Field`, `Table`, `StatusBadge`, `PageHeader`.|

## Reglas

- **Dinero en céntimos** (enteros). Muestra con `formatEur`, lee formularios con `parseEurToCents`.
- **IVA** como porcentaje entero (`21`). Totales siempre con `lineTotals` / `documentTotals`.
- **Fechas** de calendario como texto `YYYY-MM-DD`; se muestran con `formatDate` (`es-ES`).
- **Números de documento** `P-2026-001` / `F-2026-001` con `nextDocumentNumber`.
- **`cacheComponents` está activo.** Todo componente que lee la base de datos, `params` o
  `searchParams` va dentro de `<Suspense>`. Las listas llaman a `await connection()` antes de
  consultar. Copia el patrón de una página existente.
- Las escrituras que crean un documento con líneas van en una sola sentencia SQL (ver
  `presupuestos/actions.ts`): el driver HTTP no tiene transacciones interactivas.
- Tras escribir: `revalidatePath(...)` y, si toca, `redirect(...)`.

## Cómo añadir un campo (ejemplo: `clients.website`)

1. `src/db/schema.ts`: añade la columna (`website: text()`).
2. `pnpm db:generate` → crea `drizzle/NNNN_*.sql`. Súbelo con el cambio; no edites migraciones ya subidas.
3. `queries.ts`: si la consulta elige columnas, añádela.
4. `validation.ts`: añade el campo al esquema Zod y a la lista `*Fields`.
5. `actions.ts`: normalmente no cambia (usa el esquema). Revisa si hay `set`/`values` explícitos.
6. UI: el formulario (`*-form.tsx`, y su `initial` en la página de editar), el detalle y, si procede, la lista.
7. `data-testid` en lo nuevo (ver abajo). Si cambia la lógica de `src/lib`, añade tests.
8. Si el seed debe rellenarlo, actualiza `src/db/seed.ts` sin romper la idempotencia.

## `data-testid`

Los usan los tests E2E: **no cambies ni borres los existentes**.

- Tablas `<entidad>-table` (`clients-table`, `quotes-table`, `invoices-table`, `items-table`).
- Filas `<entidad>-row` con `data-id={id}`.
- Formularios `<entidad>-form`; campos `field-<name>` (lo pone `Field` solo); líneas `item-<i>-<campo>`.
- Botones `new-<entidad>-button`, `save-button`, `edit-<entidad>-button`, `change-status-button`,
  `generate-invoice-button`, `mark-paid-button`.
- Título de página `page-title`; badge `status-badge` con `data-status`.

Next.js mantiene en el DOM, ocultas, las páginas ya visitadas (`<Activity>`), así que un mismo
`data-testid` puede aparecer dos veces. En Playwright selecciona siempre con `byTestId(page, id)` de
`e2e/helpers.ts`, que filtra los visibles. Por lo mismo, los formularios de alta y edición van
envueltos en `<ResetOnHide>` para empezar vacíos al volver.

## Convenciones

- Textos de UI en **español**; código, nombres, comentarios y commits en inglés.
- Archivos en `kebab-case`, componentes en `PascalCase`, columnas SQL en `snake_case`
  (en TypeScript, `camelCase`).
- Commits en Conventional Commits (`feat:`, `fix:`, `test:`…), pequeños.
- Responsive: debe verse bien a 390 px. Oculta columnas secundarias con `hidden sm:table-cell`.
- Antes de terminar: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`.

## No tocar

- Auth: `src/lib/auth.ts`, `src/app/(auth)/`, y `src/proxy.ts` (en Next 16 el middleware se llama proxy).
- Config de build y despliegue: `next.config.ts`, `package.json` (scripts), `drizzle.config.ts`,
  `tsconfig.json`, `eslint.config.mjs`, `.github/workflows/`, `playwright.config.ts`.
- Migraciones ya subidas en `drizzle/`.
- `/api/health`.
- No añadas dependencias salvo que la petición lo exija.
