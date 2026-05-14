import { test, expect } from "@playwright/test";
import { adminInsertSend, adminQuery } from "../helpers/admin-pg";

const TEST_CREW = process.env.SEED_TEST_CREW_ID ?? "test-crew";
const SAMPLES = 100;

test.describe("LiveBoard KPI", () => {
  test("live-board p95 < 5s", async ({ page }) => {
    test.setTimeout(600_000); // R4-M1: 100 INSERTs can take 250-500s

    // Login
    await page.goto("/api/auth/signin");
    await page.fill('input[name="userId"]', process.env.SEED_TEST_USER_ID!);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/*", { timeout: 5000 });

    await page.goto(`/c/${TEST_CREW}/live`);
    await page.evaluate(() => {
      (window as unknown as { __liveKpi: unknown[] }).__liveKpi = [];
    });

    // Wait for Realtime connection
    await page.waitForFunction(
      () => document.querySelector('[style*="var(--accent-success)"]') !== null,
      { timeout: 10_000 },
    );

    // Clock skew baseline (R2-H4 + R3-H1)
    const serverNow = await adminQuery<{ now: string }>("SELECT to_jsonb(now())::text AS now");
    const serverNowIso = serverNow.now.replace(/^"|"$/g, "");
    const browserNow = await page.evaluate(() => new Date().toISOString());
    const ntpOffsetMs = Date.parse(browserNow) - Date.parse(serverNowIso);

    // Sequential INSERT loop (R3-H3: strictly sequential)
    for (let i = 0; i < SAMPLES; i++) {
      await adminInsertSend({ sequenceIndex: i });
      await page.waitForFunction(
        (n: number) =>
          ((window as unknown as { __liveKpi?: unknown[] }).__liveKpi?.length ?? 0) >= n,
        i + 1,
        { timeout: 10_000 },
      );
    }

    const kpiEntries = await page.evaluate(
      () =>
        (
          window as unknown as {
            __liveKpi: Array<{ sendId: string; serverCreatedAt: string; clientReceivedAt: string }>;
          }
        ).__liveKpi,
    );

    // delta_ms = (clientReceivedAt - ntpOffset) - serverCreatedAt (R2-H4)
    const deltas = kpiEntries
      .map((e) => Date.parse(e.clientReceivedAt) - ntpOffsetMs - Date.parse(e.serverCreatedAt))
      .filter((d) => d >= 0);

    deltas.sort((a, b) => a - b);
    const p50Idx = Math.floor(deltas.length * 0.5);
    const p95Idx = Math.floor(deltas.length * 0.95);
    const p50 = deltas[p50Idx];
    const p95 = deltas[p95Idx];

    console.log(`[kpi] n=${deltas.length} p50=${p50}ms p95=${p95}ms ntpOffset=${ntpOffsetMs}ms`);

    expect(p95).toBeLessThan(4500); // 5000 - 500ms safety margin
  });
});
