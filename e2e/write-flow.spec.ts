import { expect, test } from "@playwright/test";
import { byTestId, isPreviewDeployment, login } from "./helpers";

/**
 * Full write flow. It creates data, so it only runs against a Vercel preview,
 * which has its own Neon branch (D18). Production and local runs skip it.
 */
test.describe("write flow", () => {
  test.skip(
    ({ baseURL }) => !isPreviewDeployment(baseURL),
    "writes data: runs only against Vercel previews",
  );

  test("client → quote → accept → invoice → paid", async ({ page }) => {
    const stamp = `${Date.now()}-${test.info().project.name}`;
    const email = `preview-${stamp}@example.com`;
    await login(page);

    // Client: create, reject a duplicate email, edit.
    await byTestId(page, "new-client-button").click();
    await byTestId(page, "field-name").fill(`Prueba Preview ${stamp}`);
    await byTestId(page, "field-email").fill(email);
    await byTestId(page, "save-button").click();
    await expect(page).toHaveURL(/\/clientes\/\d+$/);
    const clientUrl = page.url();

    await byTestId(page, "edit-client-button").click();
    await byTestId(page, "field-company").fill("Empresa Preview");
    await byTestId(page, "field-email").fill("lucia.fernandez@example.com");
    await byTestId(page, "save-button").click();
    await expect(
      page.getByText("Ya existe un cliente con ese email."),
    ).toBeVisible();
    await byTestId(page, "field-email").fill(email);
    await byTestId(page, "save-button").click();
    await expect(page).toHaveURL(clientUrl);
    await expect(byTestId(page, "client-company")).toHaveText(
      "Empresa Preview",
    );

    // Quote with two lines: 2 × 100 € + 1 × 50 €, 21 % VAT → 302,50 €.
    await byTestId(page, "new-quote-for-client-button").click();
    await byTestId(page, "item-0-description").fill("Diseño");
    await byTestId(page, "item-0-quantity").fill("2");
    await byTestId(page, "item-0-unitPrice").fill("100");
    await byTestId(page, "add-item-button").click();
    await byTestId(page, "item-1-description").fill("Hosting");
    await byTestId(page, "item-1-quantity").fill("1");
    await byTestId(page, "item-1-unitPrice").fill("50");
    await byTestId(page, "save-button").click();
    await expect(page).toHaveURL(/\/presupuestos\/\d+$/);
    await expect(byTestId(page, "item-row")).toHaveCount(2);
    await expect(byTestId(page, "total-total")).toContainText("302,50");

    // Accept it and generate the invoice.
    await byTestId(page, "field-status").selectOption("accepted");
    await byTestId(page, "change-status-button").click();
    await expect(byTestId(page, "status-badge")).toHaveAttribute(
      "data-status",
      "accepted",
    );
    await byTestId(page, "generate-invoice-button").click();
    await expect(page).toHaveURL(/\/facturas\/\d+$/);
    await expect(byTestId(page, "total-total")).toContainText("302,50");

    // Mark it as paid.
    await byTestId(page, "mark-paid-button").click();
    await expect(byTestId(page, "status-badge")).toHaveAttribute(
      "data-status",
      "paid",
    );
  });
});
