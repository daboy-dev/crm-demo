import { expect, test, type Page } from "@playwright/test";
import { byTestId } from "./helpers";

async function login(page: Page) {
  await page.goto("/login");
  await byTestId(page, "field-user").fill(process.env.DEMO_USER ?? "");
  await page
    .getByTestId("field-password")
    .fill(process.env.DEMO_PASSWORD ?? "");
  await byTestId(page, "login-submit").click();
  await expect(page).toHaveURL(/\/clientes$/);
}

test("redirects to login without a session", async ({ page }) => {
  await page.goto("/facturas");
  await expect(page).toHaveURL(/\/login$/);
  await expect(byTestId(page, "login-form")).toBeVisible();
});

test("rejects wrong credentials", async ({ page }) => {
  await page.goto("/login");
  await byTestId(page, "field-user").fill("nadie");
  await byTestId(page, "field-password").fill("incorrecta");
  await byTestId(page, "login-submit").click();
  await expect(byTestId(page, "login-error")).toBeVisible();
});

test("health endpoint is public", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ ok: true, db: true });
});

test("lists clients, quotes and invoices with data", async ({ page }) => {
  await login(page);
  await expect(byTestId(page, "client-row").first()).toBeVisible();

  await byTestId(page, "nav-presupuestos").click();
  await expect(byTestId(page, "quotes-table")).toBeVisible();
  await expect(byTestId(page, "quote-row").first()).toBeVisible();

  await byTestId(page, "nav-facturas").click();
  await expect(byTestId(page, "invoices-table")).toBeVisible();
  await expect(byTestId(page, "invoice-row").first()).toBeVisible();
});

test("shows a quote with its lines and totals", async ({ page }) => {
  await login(page);
  await page.goto("/presupuestos");
  await byTestId(page, "quote-row").first().getByRole("link").click();
  await expect(byTestId(page, "quote-detail")).toBeVisible();
  await expect(byTestId(page, "item-row").first()).toBeVisible();
  await expect(byTestId(page, "total-total")).toContainText("€");
});

test("has no horizontal page scroll", async ({ page }) => {
  await login(page);
  for (const path of ["/clientes", "/presupuestos", "/facturas"]) {
    await page.goto(path);
    await expect(byTestId(page, "page-title")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
