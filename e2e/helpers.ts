import type { Locator, Page } from "@playwright/test";

/**
 * Next.js keeps visited pages in the DOM, hidden (React <Activity>), so the
 * same data-testid can appear twice. Always select through this helper.
 */
export function byTestId(page: Page | Locator, testId: string): Locator {
  return page.getByTestId(testId).filter({ visible: true });
}
