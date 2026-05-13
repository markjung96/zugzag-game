import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const POSTGRES_URL_ADMIN_GUARD = [
  {
    selector:
      "MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][computed=false][property.name='POSTGRES_URL_ADMIN']",
    message: "POSTGRES_URL_ADMIN은 seed.ts와 tests/integration/setup.ts 외 사용 금지 (dot access)",
  },
  {
    selector:
      "MemberExpression[object.type='MemberExpression'][object.object.name='process'][object.property.name='env'][computed=true][property.value='POSTGRES_URL_ADMIN']",
    message:
      "POSTGRES_URL_ADMIN은 seed.ts와 tests/integration/setup.ts 외 사용 금지 (bracket access)",
  },
  {
    selector:
      "VariableDeclarator[init.type='MemberExpression'][init.object.name='process'][init.property.name='env'] ObjectPattern Property[key.name='POSTGRES_URL_ADMIN']",
    message: "POSTGRES_URL_ADMIN은 seed.ts와 tests/integration/setup.ts 외 사용 금지 (destructure)",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      complexity: ["warn", 8],
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/lib/db/seed.ts"],
    rules: {
      "no-restricted-syntax": ["error", ...POSTGRES_URL_ADMIN_GUARD],
    },
  },
  {
    files: ["tests/**/*.ts"],
    ignores: ["tests/integration/setup.ts"],
    rules: {
      "no-restricted-syntax": ["error", ...POSTGRES_URL_ADMIN_GUARD],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "design-handoff/**",
    ".omc/**",
  ]),
]);

export default eslintConfig;
