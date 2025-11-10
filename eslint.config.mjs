import nextPlugin from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      ".turbo/**",
      "build/**",
      "dist/**",
    ],
  },
  ...nextPlugin,
];

export default eslintConfig;
