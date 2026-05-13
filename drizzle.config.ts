import { defineConfig } from "drizzle-kit";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set (see .env.example)");
}

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  // games.* 만 마이그레이션 대상. public.*는 zugzag 본체에서만 변경.
  // 미러 schema (src/lib/db/schema/shared/) 는 schema 정의는 하되 introspect/migrate 대상에서 제외.
  schemaFilter: ["games"],
  verbose: true,
  strict: true,
});
