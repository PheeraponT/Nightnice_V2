/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Constitution II)
        primary: {
          DEFAULT: "#EB1046",
          gradient: {
            from: "#EB1046",
            to: "#6729FF",
          },
        },
        accent: {
          DEFAULT: "#6729FF",
          light: "#E1BDFF",
        },
        secondary: "#6729FF",
        // Grey Scale
        dark: "#101828",
        darker: "#0D1320",
        "dark-lighter": "#2B3139",
        // Semantic Colors
        success: "#21BF73",
        warning: "#EDAD4F",
        error: "#FF384F",
        "error-light": "#DA5F6D",
        // Neutral
        "surface-dark": "#1C1C1C",
        "surface-light": "#F2F2F2",
        muted: "#C5CBD9",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #EB1046 0%, #6729FF 100%)",
        "gradient-grey": "linear-gradient(135deg, #101828 0%, #2B3139 100%)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
