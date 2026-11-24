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
