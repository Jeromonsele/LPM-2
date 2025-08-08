export default [
  ...require("eslint-config-next")(),
  {
    files: ["src/generated/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/no-unused-expressions": "warn"
    }
  }
];
