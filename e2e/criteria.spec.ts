import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { z } from "zod";
import { byTestId, isPreviewDeployment, login } from "./helpers";
import { pages } from "./pages";

/**
 * Acceptance criteria of the crm-agents runs (D38). The Testing agent turns
 * every e2e criterion of a plan into declarative steps, and the panel commits
 * them to e2e/criteria/run-<id>.json. This runner, written by hand, executes
 * them: no generated code ever runs here. Each criterion is one test, titled
 * `run-<id> r<revision> <criterion>`, in both projects (1280 and 390 px).
 *
 * Neither this file nor e2e/criteria/** may be written by Develop (AGENTS.md).
 */

const testId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
/** `{{stamp}}` is replaced by a value unique to the test and the project. */
const text = z.string().min(1).max(200);
const nth = z.number().int().min(0).max(50).optional();
const relativePath = z
  .string()
  .max(200)
  .regex(/^\/(?!\/)[^\s:\\]*$/, "ruta relativa, sin esquema ni host");

const stepSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("goto"),
    page: z.string().optional(),
    path: relativePath.optional(),
  }),
  z.strictObject({
    action: z.literal("fill"),
    testId,
    value: z.string().max(200),
    nth,
  }),
  z.strictObject({ action: z.literal("select"), testId, value: text, nth }),
  z.strictObject({ action: z.literal("click"), testId, nth }),
  z.strictObject({
    action: z.literal("expectVisible"),
    testId,
    nth,
  }),
  z.strictObject({
    action: z.literal("expectText"),
    testId,
    text,
    nth,
    /** Every visible element with the testId contains the text. */
    all: z.boolean().optional(),
  }),
  z.strictObject({
    action: z.literal("expectCount"),
    testId,
    count: z.number().int().min(0).max(200).optional(),
    min: z.number().int().min(0).max(200).optional(),
  }),
]);
type Step = z.infer<typeof stepSchema>;

const fileSchema = z.strictObject({
  run: z.number().int().positive(),
  criteria: z
    .array(
      z.strictObject({
        id: z.string().regex(/^c[0-9]{1,2}$/),
        revision: z.number().int().positive(),
        task: z.number().int().positive(),
        text: z.string().max(300),
        steps: z.array(stepSchema).min(1).max(20),
      }),
    )
    .max(40),
});

const DIR = path.join(__dirname, "criteria");
/** Next to results.json, so the preview workflow uploads it (D38). */
const OUT_DIR = path.join(
  path.dirname(process.env.PLAYWRIGHT_JSON_OUTPUT_FILE ?? "test-results/x"),
  "criteria",
);
const MAX_SNAPSHOT = 4_000;
/**
 * A step fails well before the test does, so the page is still open to save
 * its aria snapshot. Assertions keep Playwright's default of 5 s.
 */
const ACTION_TIMEOUT = 10_000;
const TEST_TIMEOUT = 90_000;
const ANSI = /\u001b\[[0-9;]*m/g;

function describe(step: Step): string {
  switch (step.action) {
    case "goto":
      return `goto ${step.page ?? step.path}`;
    case "fill":
    case "select":
      return `${step.action} ${step.testId} = "${step.value}"`;
    case "click":
    case "expectVisible":
      return `${step.action} ${step.testId}`;
    case "expectText":
      return `expectText ${step.testId} "${step.text}"${step.all ? " (todos)" : ""}`;
    case "expectCount":
      return `expectCount ${step.testId} ${step.count ?? `>= ${step.min}`}`;
  }
}

async function goto(page: Page, step: Extract<Step, { action: "goto" }>) {
  if (!step.page === !step.path) {
    throw new Error("goto lleva page o path, no los dos ni ninguno");
  }
  if (step.path) {
    await page.goto(step.path, { timeout: ACTION_TIMEOUT });
    return;
  }
  const entry = pages.find((p) => p.name === step.page);
  if (!entry) throw new Error(`La página ${step.page} no está en e2e/pages.ts`);
  if ("path" in entry) {
    await page.goto(entry.path, { timeout: ACTION_TIMEOUT });
    return;
  }
  await page.goto(entry.fromList, { timeout: ACTION_TIMEOUT });
  await byTestId(page, entry.rowTestId)
    .first()
    .getByRole("link")
    .first()
    .click({ timeout: ACTION_TIMEOUT });
  await expect(page).not.toHaveURL(new RegExp(`${entry.fromList}$`));
}

async function run(page: Page, step: Step, stamp: string) {
  const fill = (value: string) => value.replaceAll("{{stamp}}", stamp);
  if (step.action === "goto") return goto(page, step);
  const all = byTestId(page, step.testId);
  const one = all.nth(("nth" in step ? step.nth : undefined) ?? 0);
  switch (step.action) {
    case "fill":
      return one.fill(fill(step.value), { timeout: ACTION_TIMEOUT });
    case "select":
      await one.selectOption(fill(step.value), { timeout: ACTION_TIMEOUT });
      return;
    case "click":
      return one.click({ timeout: ACTION_TIMEOUT });
    case "expectVisible":
      return expect(one).toBeVisible();
    case "expectText": {
      const expected = fill(step.text);
      if (!step.all) return expect(one).toContainText(expected);
      await expect(all.first()).toBeVisible();
      for (const element of await all.all()) {
        await expect(element).toContainText(expected);
      }
      return;
    }
    case "expectCount":
      if (step.count !== undefined) return expect(all).toHaveCount(step.count);
      await expect
        .poll(() => all.count())
        .toBeGreaterThanOrEqual(step.min ?? 1);
      return;
  }
}

function loadFiles() {
  let names: string[] = [];
  try {
    names = readdirSync(DIR).filter((n) => n.endsWith(".json"));
  } catch {
    return [];
  }
  return names.sort().map((name) => {
    try {
      const json: unknown = JSON.parse(
        readFileSync(path.join(DIR, name), "utf8"),
      );
      return { name, file: fileSchema.parse(json), error: null };
    } catch (error) {
      return { name, file: null, error: String(error).slice(0, 1000) };
    }
  });
}

test.describe("criteria", () => {
  // The steps may create data: previews only, like write-flow.spec.ts.
  test.skip(
    ({ baseURL }) => !isPreviewDeployment(baseURL),
    "may write data: runs only against Vercel previews",
  );

  for (const { name, file, error } of loadFiles()) {
    if (!file) {
      test(`${name} no es válido`, () => {
        throw new Error(`e2e/criteria/${name}: ${error}`);
      });
      continue;
    }
    for (const criterion of file.criteria) {
      const title = `run-${file.run} r${criterion.revision} ${criterion.id}`;
      test(`${title} · ${criterion.text}`, async ({ page }, info) => {
        test.setTimeout(TEST_TIMEOUT);
        const stamp = `${Date.now()}-${info.project.name}`;
        await login(page);
        for (const [i, step] of criterion.steps.entries()) {
          const label = `Paso ${i + 1} (${describe(step)})`;
          try {
            await test.step(label, () => run(page, step, stamp));
          } catch (failure) {
            const message = (
              failure instanceof Error ? failure.message : String(failure)
            ).replace(ANSI, "");
            const snapshot = await page
              .locator("body")
              .ariaSnapshot({ timeout: 5_000 })
              .catch(() => "");
            mkdirSync(OUT_DIR, { recursive: true });
            writeFileSync(
              path.join(
                OUT_DIR,
                `run-${file.run}-r${criterion.revision}-${criterion.id}-${info.project.name}.json`,
              ),
              JSON.stringify({
                run: file.run,
                revision: criterion.revision,
                criterion: criterion.id,
                project: info.project.name,
                step: i + 1,
                action: describe(step),
                url: new URL(page.url()).pathname,
                error: message.slice(0, 1000),
                snapshot: snapshot.slice(0, MAX_SNAPSHOT),
              }),
            );
            throw new Error(`${label}: ${message}`);
          }
        }
      });
    }
  }
});
