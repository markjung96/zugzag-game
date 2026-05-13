import { defineConfig } from "drizzle-kit";

// db:generate (SQL 추출)에는 URL이 필요 없다. db:migrate/push 시점에만 실제 값 필수.
// .env.local 미준비 환경에서도 generate 검증을 가능하게 하기 위해 lazy.
const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  console.warn(
    "[drizzle.config] POSTGRES_URL not set — db:generate OK, db:migrate/push will fail until .env.local is configured.",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: postgresUrl ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
  // games.* 만 마이그레이션 대상. public.*는 zugzag 본체에서만 변경.
  // 미러 schema (src/lib/db/schema/shared/) 는 schema 정의는 하되 introspect/migrate 대상에서 제외.
  schemaFilter: ["games"],
  verbose: true,
  strict: true,
});
