# crm-demo

Mini CRM de clientes, presupuestos y facturas. Es el proyecto que modifican los agentes de
[`crm-agents`](https://github.com/daboy-dev/crm-agents): reciben una petición en lenguaje natural,
abren una rama y un PR aquí, y cada PR tiene su vista previa en Vercel con su propia rama de Neon.

Las decisiones de arquitectura, el proceso y las transcripciones viven en [`crm-agents/docs/`](https://github.com/daboy-dev/crm-agents/tree/master/docs).

## Qué hace

- **Clientes:** listar, ver, crear y editar, con NIF, tipo (Particular o Empresa) y notas internas. La lista tiene un buscador por nombre o email y un filtro por tipo; el detalle muestra cuántos presupuestos tiene el cliente.
- **Presupuestos:** listar, ver con líneas y totales (base, IVA y total), crear con líneas, cambiar de estado y duplicar (crea un borrador con el mismo cliente y las mismas líneas).
- **Facturas:** generar desde un presupuesto aceptado (copia sus líneas), listar, ver y marcar como pagada. La lista destaca las vencidas y se puede filtrar por estado (pendientes, pagadas o todas).
- **Resumen:** número de clientes, presupuestos enviados e importe pendiente de cobro.
- **Contacto:** email y teléfono de la empresa.
- Login de demo con un único usuario.

## Cómo lo modifican los agentes

- El panel de `crm-agents` abre una rama `run/<id>` y un PR por petición, con un commit por tarea. `master` tiene un ruleset que exige PR.
- [`AGENTS.md`](./AGENTS.md) tiene las convenciones que recibe el agente Develop en cada tarea: dónde va cada cosa, los `data-testid` y las rutas que no puede tocar.
- Workflows de GitHub Actions:
  - `pr-check.yml`: en cada push a un PR, genera la migración con `drizzle-kit` si cambió `src/db/schema.ts` y comprueba tipos y lint. El commit de la migración es de `github-actions[bot]`.
  - `preview-e2e.yml`: cuando la vista previa está lista, lanza Playwright contra ella (E2E, criterios de aceptación y capturas a 1280 y 390 px) y deja los resultados en un artifact que descarga el panel.
  - `neon-cleanup.yml`: borra la rama de Neon de la vista previa al cerrarse el PR.
- `e2e/criteria/run-<id>.json` son los pasos que escribió el agente Testing para cada run fusionado. `e2e/criteria.spec.ts` los ejecuta en cada vista previa, así que funcionan como pruebas de regresión.

Todo lo de "Qué hace" que va más allá del CRM inicial (NIF, tipo y notas de cliente, buscador y filtros, duplicar presupuestos, facturas vencidas, resumen y contacto) lo han añadido los agentes. Está en los PRs `run/*` de este repo.

## Stack

Next.js 16 (App Router), TypeScript estricto, Tailwind, Drizzle con el driver HTTP de Neon,
Vitest y Playwright. Despliegue en Vercel con la integración de Neon.

## Arrancar en local

Requisitos: Node 22 y pnpm.

```bash
pnpm install
cp .env.example .env.local   # y rellena los valores
pnpm db:migrate              # aplica las migraciones de drizzle/
pnpm db:seed                 # datos de prueba (idempotente)
pnpm dev                     # http://localhost:3000
```

Si usas la base de datos del proyecto de Vercel, `vercel env pull .env.local` trae `DATABASE_URL`
y `DATABASE_URL_UNPOOLED`.

## Variables de entorno

| Variable                | Para qué                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`          | Neon con pooling. La usa la app.                                 |
| `DATABASE_URL_UNPOOLED` | Neon con conexión directa. La usa `drizzle-kit` para migrar.     |
| `AUTH_SECRET`           | Secreto HMAC con el que se firma la cookie de sesión.            |
| `DEMO_USER`             | Usuario del login de demo.                                       |
| `DEMO_PASSWORD`         | Contraseña del login de demo.                                    |

Ninguna clave va en el repo.

## Comandos

| Comando             | Qué hace                                                 |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo.                                  |
| `pnpm build`        | Build de producción.                                     |
| `pnpm vercel-build` | `drizzle-kit migrate && next build` (lo ejecuta Vercel). |
| `pnpm lint`         | ESLint.                                                  |
| `pnpm format`       | Prettier (no toca el Markdown). `format:check` en CI.    |
| `pnpm typecheck`    | `next typegen` + `tsc --noEmit`.                         |
| `pnpm test`         | Vitest (`src/**/*.test.ts`).                             |
| `pnpm test:e2e`     | Playwright, smoke tests en local (necesita datos).       |
| `pnpm db:generate`  | Genera una migración desde `src/db/schema.ts`.           |
| `pnpm db:migrate`   | Aplica las migraciones.                                  |
| `pnpm db:seed`      | Inserta los datos de prueba que falten.                  |

## Despliegue

Producción usa la rama principal de Neon. Cada vista previa usa una rama `preview/...`, que se crea con el despliegue y que `neon-cleanup.yml` borra al cerrarse el PR. Los datos de prueba se cargan una vez en producción y las ramas los heredan.

CI (GitHub Actions) ejecuta lint, format:check, typecheck y test en cada push y PR.
