import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#3B82F6",
          dark: "#1E40AF",
          bg: "rgba(37, 99, 235, 0.1)",
          bg2: "rgba(37, 99, 235, 0.15)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
          3: "rgb(var(--surface-3) / <alpha-value>)",
        },
        dark: "rgb(var(--bg-primary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        foreground: "rgb(var(--text-foreground) / <alpha-value>)",
        danger: "#EF4444",
        success: "#22C55E",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
    },
  },
  plugins: [],
};
export default config;
