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
        // Primary - Deep Blues (from owl logo)
        primary: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Accent - Celestial Purple
        accent: {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
          dark: "#7C3AED",
        },
        // Gold - Moonlight highlights
        gold: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          soft: "rgba(245, 158, 11, 0.15)",
        },
        // Night Sky Backgrounds
        night: {
          DEFAULT: "#0A0E1A",
          light: "#111827",
          lighter: "#1F2937",
          card: "#1A1F2E",
        },
        // Semantic Colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        // Surface Colors
        surface: {
          dark: "#1A1F2E",
          light: "#F9FAFB",
        },
        // Text
        muted: "#9CA3AF",
        // Legacy mappings for compatibility
        dark: "#0A0E1A",
        darker: "#070A12",
        "dark-lighter": "#1F2937",
        "surface-dark": "#1A1F2E",
        "surface-light": "#F9FAFB",
      },
      borderRadius: {
        card: "20px",
        button: "12px",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
        "gradient-gold": "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
        "gradient-night": "linear-gradient(180deg, #0A0E1A 0%, #111827 100%)",
        "gradient-hero": "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), #0A0E1A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Kanit", "sans-serif"],
        body: ["var(--font-body)", "Prompt", "sans-serif"],
        sans: ["var(--font-body)", "Prompt", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-gold": "0 0 20px rgba(245, 158, 11, 0.3)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)",
      },
      animation: {
        "glow": "glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "twinkle": "twinkle 8s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
