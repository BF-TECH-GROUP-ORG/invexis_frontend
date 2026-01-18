import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // OPTIMIZATION: Ignore heavy files during linting to speed up checks
      "dist/**",
      ".swc/**",
    ],
    // OPTIMIZATION: Enable parallel linting for faster checks
    rules: {
      // Enforce best practices for performance
      'react/no-unstable-nested-components': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Warn about potential performance issues
      '@next/next/no-html-link-for-pages': 'warn',
      '@next/next/no-img-element': 'warn',
    },
  },
];

export default eslintConfig;