import { expect, test } from "@playwright/test";
import { byTestId, login } from "./helpers";
import { pages } from "./pages";

/** Folder for the captures; the preview workflow uploads it as an artifact. */
const outDir = process.env.E2E_SCREENSHOTS_DIR ?? "test-results/screenshots";

test.describe("screenshots", () => {
  for (const entry of pages) {
    test(`captures ${entry.name}`, async ({ page }) => {
      await login(page);
      if ("path" in entry) {
        await page.goto(entry.path);
      } else {
        await page.goto(entry.fromList);
        await byTestId(page, entry.rowTestId)
          .first()
          .getByRole("link")
          .first()
          .click();
        await expect(page).not.toHaveURL(new RegExp(`${entry.fromList}$`));
      }
      await expect(byTestId(page, "page-title")).toBeVisible();
      await page.waitForLoadState("networkidle");

      const width = page.viewportSize()?.width ?? 0;
      await page.screenshot({
        path: `${outDir}/${entry.name}-${width}.jpg`,
        type: "jpeg",
        quality: 70,
        fullPage: true,
      });
    });
  }
});
