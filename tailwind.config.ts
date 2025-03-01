import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gray: {
          500: '#000000', // Change gray-500 to black
          600: '#000000', // Change gray-600 to black
          700: '#000000', // Change gray-700 to black
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
