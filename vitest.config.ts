import { defineConfig } from "vitest/config";
import path from "path";
import fs from "fs";

const alias = { "@": path.resolve(__dirname, "./src") };

// .env.local 자동 로드 (Next.js와 달리 Vitest는 기본 로드 안 함).
// vite의 loadEnv를 쓰면 vite를 직접 devDep으로 추가해야 하므로 minimal manual parser.
// .env.local 의 KEY=VALUE 라인만 처리, 주석/빈줄 무시. 이미 있는 process.env 값은 덮어쓰지 않음.
function loadDotEnvLocal(): void {
  const envPath = path.resolve(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key] !== undefined) continue;
    // strip surrounding quotes if any
    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = value;
  }
}
loadDotEnvLocal();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
        },
        resolve: { alias },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          setupFiles: ["./tests/integration/setup.ts"],
          testTimeout: 30_000,
        },
        resolve: { alias },
      },
    ],
  },
});
