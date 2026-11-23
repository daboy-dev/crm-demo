import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("field-user").fill(process.env.DEMO_USER ?? "");
  await page
    .getByTestId("field-password")
    .fill(process.env.DEMO_PASSWORD ?? "");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/clientes$/);
}

test("redirects to login without a session", async ({ page }) => {
  await page.goto("/facturas");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId("login-form")).toBeVisible();
});

test("rejects wrong credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("field-user").fill("nadie");
  await page.getByTestId("field-password").fill("incorrecta");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("login-error")).toBeVisible();
});

test("health endpoint is public", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ ok: true, db: true });
});

test("lists clients, quotes and invoices with data", async ({ page }) => {
  await login(page);
  await expect(page.getByTestId("client-row").first()).toBeVisible();

  await page.getByTestId("nav-presupuestos").click();
  await expect(page.getByTestId("quotes-table")).toBeVisible();
  await expect(page.getByTestId("quote-row").first()).toBeVisible();

  await page.getByTestId("nav-facturas").click();
  await expect(page.getByTestId("invoices-table")).toBeVisible();
  await expect(page.getByTestId("invoice-row").first()).toBeVisible();
});

test("shows a quote with its lines and totals", async ({ page }) => {
  await login(page);
  await page.goto("/presupuestos");
  await page.getByTestId("quote-row").first().getByRole("link").click();
  await expect(page.getByTestId("quote-detail")).toBeVisible();
  await expect(page.getByTestId("item-row").first()).toBeVisible();
  await expect(page.getByTestId("total-total")).toContainText("€");
});

test("has no horizontal page scroll", async ({ page }) => {
  await login(page);
  for (const path of ["/clientes", "/presupuestos", "/facturas"]) {
    await page.goto(path);
    await expect(page.getByTestId("page-title")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
