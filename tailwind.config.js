/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0F1417",
        surface: "#17212B",
        elevated: "#1F2C38",
        border: "#26333F",
        accent: {
          DEFAULT: "#2AABEE",
          dim: "#1C86BD",
          soft: "rgba(42, 171, 238, 0.12)",
        },
        online: "#3DD68C",
        danger: "#F0554B",
        text: {
          primary: "#E8EDF2",
          muted: "#7D8B99",
          faint: "#546472",
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.03)",
        glow: "0 0 0 3px rgba(61, 214, 140, 0.15)",
      },
      keyframes: {
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-3px)", opacity: "1" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(61, 214, 140, 0.45)" },
          "100%": { boxShadow: "0 0 0 6px rgba(61, 214, 140, 0)" },
        },
      },
      animation: {
        typingDot: "typingDot 1.2s infinite ease-in-out",
        pulseRing: "pulseRing 1.6s infinite",
      },
    },
  },
  plugins: [],
};
