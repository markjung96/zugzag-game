import { defineConfig } from "vitest/config";
import path from "path";

const alias = { "@": path.resolve(__dirname, "./src") };

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
