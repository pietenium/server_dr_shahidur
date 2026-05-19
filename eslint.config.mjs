import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // ─── Type-aware linting requires tsconfig access ─────────────────────────
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // ─── Logging ─────────────────────────────────────────────────────────
      // Warn on console.log — allow warn/error/info for intentional logging
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // ─── Security ────────────────────────────────────────────────────────
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // ─── TypeScript ───────────────────────────────────────────────────────
      // Enforce proper typing — no silent any
      "@typescript-eslint/no-explicit-any": "warn",

      // Exported functions should declare return types explicitly
      "@typescript-eslint/explicit-module-boundary-types": "warn",

      // Prefer import type { } for type-only imports (better tree-shaking)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // Discourage non-null assertions (!) that bypass type safety
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Throw error on unused variables (except underscore-prefixed intentionally unused)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // ─── Async Safety ────────────────────────────────────────────────────
      // Every async call must be awaited or explicitly handled
      "@typescript-eslint/no-floating-promises": "error",

      // Awaiting non-promise values is likely a bug
      "@typescript-eslint/await-thenable": "error",

      // Returning await inside try/catch preserves error stack traces
      "@typescript-eslint/return-await": ["error", "in-try-catch"],

      // Async functions inside new Promise() can shadow errors
      "no-async-promise-executor": "error",

      // ─── Code Quality ─────────────────────────────────────────────────────
      // Always use === / !== instead of == / !=
      eqeqeq: ["error", "always"],

      // No var — use const or let only
      "no-var": "error",
      "prefer-const": "error",

      // Always throw Error objects, not strings or literals
      "no-throw-literal": "error",

      // ─── Style & Consistency ─────────────────────────────────────────────
      // Always require curly braces — prevents one-liner if bugs
      curly: ["error", "all"],

      // Simplify control flow: no else after return
      "no-else-return": "error",

      // Use shorthand properties: { x } instead of { x: x }
      "object-shorthand": "error",
    },
  },

  {
    ignores: ["dist/", "node_modules/", "eslint.config.mjs"],
  },
);
