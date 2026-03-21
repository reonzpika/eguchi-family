import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: [
          "var(--font-plus-jakarta)",
          "var(--font-noto-sans-jp)",
          "sans-serif",
        ],
        sans: [
          "var(--font-be-vietnam)",
          "var(--font-noto-sans-jp)",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
