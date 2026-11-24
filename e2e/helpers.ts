import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Next.js keeps visited pages in the DOM, hidden (React <Activity>), so the
 * same data-testid can appear twice. Always select through this helper.
 */
export function byTestId(page: Page | Locator, testId: string): Locator {
  return page.getByTestId(testId).filter({ visible: true });
}

/** Logs in with the demo credentials (DEMO_USER / DEMO_PASSWORD). */
export async function login(page: Page) {
  await page.goto("/login");
  await byTestId(page, "field-user").fill(process.env.DEMO_USER ?? "");
  await page
    .getByTestId("field-password")
    .fill(process.env.DEMO_PASSWORD ?? "");
  await byTestId(page, "login-submit").click();
  await expect(page).toHaveURL(/\/clientes$/);
}

/** Production aliases of crm-demo. Never write data there. */
const PRODUCTION_HOSTS = new Set([
  "crm-demo-daboy-dev.vercel.app",
  "crm-demo-daboy-devs-projects.vercel.app",
]);

/**
 * True for Vercel preview hosts (crm-demo-git-<branch>-… or crm-demo-<hash>-…).
 * Tests that write data only run there: each preview has its own Neon branch,
 * while production and local runs (whose .env.local points at production) do
 * not.
 */
export function isPreviewDeployment(baseURL: string | undefined): boolean {
  if (!baseURL) return false;
  const { hostname } = new URL(baseURL);
  return (
    /^crm-demo-[a-z0-9-]+\.vercel\.app$/.test(hostname) &&
    !PRODUCTION_HOSTS.has(hostname)
  );
}
