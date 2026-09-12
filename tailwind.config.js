/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F2A44",
        "primary-soft": "#1A3F5C",
        "primary-wash": "#E6EEF4",
        accent: "#0F766E",
        "accent-soft": "#D1FAF4",
        red: { DEFAULT: "#B91C1C", soft: "#FEE2E2" },
        amber: { DEFAULT: "#B45309", soft: "#FEF3C7" },
        green: { DEFAULT: "#15803D", soft: "#DCFCE7" },
        bg: "#F4F7FA",
        paper: "#FFFFFF",
        ink: { DEFAULT: "#0F172A", 2: "#334155", 3: "#64748B", 4: "#94A3B8" },
        line: { DEFAULT: "#E2E8F0", dark: "#CBD5E1" },
        cadmus: {
          wine: "#5B0D1C",
          soft: "#541123",
          deep: "#3A0E16",
          cream: "#F6F0EB",
          sand: "#F9EAD0",
          blush: "#EEC3AF",
          sage: "#E1E3A2",
          bronze: "#A16B3E",
          stone: "#CDC9C6",
          bark: "#512818",
        },
      },
      fontFamily: {
        serif: ['"Crimson Pro"', '"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', "SimSun", "Georgia", "serif"],
        sans: ['"Atkinson Hyperlegible"', '"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "Menlo", "monospace"],
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "7.5": "1.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.08)",
        "card-hover": "0 2px 4px rgba(15,23,42,.05), 0 20px 44px -16px rgba(15,42,68,.22)",
        glow: "0 0 0 3px rgba(15,42,68,.08)",
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.2,.7,.3,1) both",
        "fade-in": "fade-in .4s ease both",
        "page-enter": "page-enter .45s cubic-bezier(.22,.61,.36,1) both",
      },
      keyframes: {
        "fade-up": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "page-enter": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
