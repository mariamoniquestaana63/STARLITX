import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: {
          bg: "#0a0a0f",
          surface: "#12121a",
          border: "#2a1a3a",
          gold: "#c9a227",
          purple: "#7c3aed",
          crimson: "#dc2626",
          teal: "#0d9488",
        },
      },
      fontFamily: {
        fantasy: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
