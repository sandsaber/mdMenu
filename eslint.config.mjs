import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "main.js"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"],
  },
);
