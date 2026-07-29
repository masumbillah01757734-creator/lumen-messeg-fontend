/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0B0A09",
        surface: "#14120F",
        elevated: "#1D1A16",
        border: "#2B2620",
        accent: {
          DEFAULT: "#FF7A3D",
          dim: "#D9601F",
          bright: "#FFB37A",
          soft: "rgba(255, 122, 61, 0.14)",
        },
        online: "#43D97B",
        danger: "#F2564F",
        text: {
          primary: "#F4EFE9",
          muted: "#9C9187",
          faint: "#645B52",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        ember: "linear-gradient(135deg, #FF7A3D 0%, #D9601F 100%)",
        "ember-radial": "radial-gradient(circle at 30% 20%, rgba(255,122,61,0.35), rgba(11,10,9,0) 60%)",
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.04)",
        glow: "0 0 0 3px rgba(67, 217, 123, 0.15)",
        ember: "0 4px 24px -6px rgba(255, 122, 61, 0.45)",
      },
      keyframes: {
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-3px)", opacity: "1" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(67, 217, 123, 0.45)" },
          "100%": { boxShadow: "0 0 0 6px rgba(67, 217, 123, 0)" },
        },
        emberPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        typingDot: "typingDot 1.2s infinite ease-in-out",
        pulseRing: "pulseRing 1.6s infinite",
        emberPulse: "emberPulse 1.8s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
