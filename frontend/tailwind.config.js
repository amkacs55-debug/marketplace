/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#05070B",
          secondary: "#0B1220",
          tertiary: "#111827",
        },
        accent: {
          blue: "#00F0FF",
          purple: "#9D00FF",
          cyan: "#00FFFF",
          ml: "#0088FF",
          pubg: "#FF7A18",
          standoff: "#4CC2FF",
        },
      },
      fontFamily: {
        display: ["Unbounded", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "scan": "scan 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,240,255,0.35)" },
          "50%": { boxShadow: "0 0 40px rgba(0,240,255,0.65)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        scan: {
          "0%, 100%": { transform: "translateY(-100%)" },
          "50%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
