import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#060b09",
          900: "#09110e",
          800: "#111c17"
        },
        flood: "#d7fb4f",
        signal: "#26d6ff",
        ember: "#ff5a4e"
      },
      boxShadow: {
        glow: "0 0 50px rgba(215, 251, 79, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
