import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      ".tmp-chrome-embed-check/**",
      ".tmp-preview-check/**",
      "node_modules/**",
      "next-env.d.ts"
    ]
  }
];

export default eslintConfig;
