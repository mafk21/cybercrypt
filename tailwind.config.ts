import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: "#ecffff",
          100: "#cfffff",
          200: "#a0ffff",
          300: "#6cfffe",
          400: "#32f4ff",
          500: "#0be9ff",
          600: "#00cbd3",
          700: "#00a3ab",
          800: "#087e87",
          900: "#0a6b75",
          950: "#03424c",
        },
        purple: {
          50: "#faf8ff",
          100: "#f3f0ff",
          200: "#ede4ff",
          300: "#ddc7ff",
          400: "#c69fff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3f0f5c",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
