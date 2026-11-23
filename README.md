# crm-demo

Mini CRM de clientes, presupuestos y facturas. Es el proyecto que modifican los agentes de
[`crm-agents`](https://github.com/daboy-dev/crm-agents): reciben una petición en lenguaje natural,
abren una rama y un PR aquí, y cada PR tiene su vista previa en Vercel con su propia rama de Neon.

Las decisiones de arquitectura, el proceso y las transcripciones viven en `crm-agents/docs/`.

## Qué hace

- **Clientes:** listar, ver, crear y editar.
- **Presupuestos:** listar, ver con líneas y totales (base, IVA y total), crear con líneas y cambiar de estado.
- **Facturas:** generar desde un presupuesto aceptado (copia sus líneas), listar, ver y marcar como pagada.
- Login de demo con un único usuario.

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

Vercel ejecuta `pnpm vercel-build`, que migra la base de datos de ese entorno antes del build.
Producción usa la rama principal de Neon; cada vista previa usa una rama `preview/...` que se
crea con el despliegue y se borra al borrar la rama de Git. Los datos de prueba se cargan una
vez en producción y las ramas los heredan.

CI (GitHub Actions) ejecuta lint, format:check, typecheck y test en cada push y PR.
