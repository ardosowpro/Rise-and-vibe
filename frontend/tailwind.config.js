/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          600: "#2a2a38",
          700: "#1e1e2a",
          800: "#16161f",
          900: "#101018",
          950: "#0a0a0f",
        },
        accent: {
          DEFAULT: "#e15743",
          bright: "#f07c69",
          soft: "#f6b3a5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(225, 87, 67, 0.5)",
        "glow-sm": "0 0 20px -6px rgba(225, 87, 67, 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 24px -8px rgba(225,87,67,0.5)" },
          "50%": { boxShadow: "0 0 44px -6px rgba(225,87,67,0.75)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-glow": "pulse-glow 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
