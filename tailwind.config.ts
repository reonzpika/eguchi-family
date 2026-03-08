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
        primary: "#F97B6B",
        "primary-light": "#FDECEA",
        secondary: "#F9C784",
        "bg-warm": "#FFFAF5",
        muted: "#9E9E9E",
        success: "#7CC9A0",
        "success-light": "#EBF7F2",
        "border-warm": "#F0E8DF",
        foreground: "#2D2D2D",
        error: "#C73E1D",
      },
    },
  },
  plugins: [],
};

export default config;
