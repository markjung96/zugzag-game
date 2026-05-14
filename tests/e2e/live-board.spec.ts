import { test, expect } from "@playwright/test";
import { adminInsertSend } from "../helpers/admin-pg";

const TEST_CREW = process.env.SEED_TEST_CREW_ID ?? "test-crew";

test.describe("LiveBoard", () => {
  test.beforeEach(async ({ page }) => {
    // NextAuth test mode login via Credentials provider
    await page.goto("/api/auth/signin");
    await page.fill('input[name="userId"]', process.env.SEED_TEST_USER_ID!);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/*", { timeout: 5000 });
  });

  test("displays initial rankings from SSR", async ({ page }) => {
    await page.goto(`/c/${TEST_CREW}/live`);
    await expect(page.locator("h1")).toContainText("라이브 보드");
  });

  test("shows new send within 5s via Realtime", async ({ page }) => {
    await page.goto(`/c/${TEST_CREW}/live`);
    await page.evaluate(() => {
      (window as unknown as { __liveKpi: unknown[] }).__liveKpi = [];
    });

    // Wait for Realtime connection
    await page.waitForFunction(
      () => document.querySelector('[style*="var(--accent-success)"]') !== null,
      { timeout: 10_000 },
    );

    // Insert a send via admin helper
    await adminInsertSend({ sequenceIndex: 0 });

    // New row should appear within 5s
    await expect(page.locator('[data-testid="rank-0"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows toast on new send", async ({ page }) => {
    await page.goto(`/c/${TEST_CREW}/live`);
    await page.evaluate(() => {
      (window as unknown as { __liveKpi: unknown[] }).__liveKpi = [];
    });

    await page.waitForFunction(
      () => document.querySelector('[style*="var(--accent-success)"]') !== null,
      { timeout: 10_000 },
    );

    await adminInsertSend({ sequenceIndex: 1 });

    // Toast with "+{score}점" text
    await expect(page.locator("text=방금 완등")).toBeVisible({
      timeout: 5000,
    });
  });
});
