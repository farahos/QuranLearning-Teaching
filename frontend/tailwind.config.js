/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        quran: {
          bg: "#f5f7f3",
          surface: "#ffffff",
          soft: "#eef5ef",
          soft2: "#eaf3f4",
          text: "#17211b",
          muted: "#5c6b62",
          line: "#e2e8e2",
          green: "#167447",
          bright: "#0f9f67",
          teal: "#0f6d6a",
          gold: "#b88922",
          amber: "#b7791f",
          blue: "#2463a8",
          red: "#c24135",
          ink: "#0e1f16",
          sidebar: "#0b3324",
        },
      },
      boxShadow: {
        quran: "0 16px 45px rgba(24, 38, 29, 0.08)",
        modal: "0 25px 80px rgba(0, 0, 0, 0.22)",
        card: "0 1px 2px rgba(16, 24, 20, 0.04), 0 8px 24px rgba(16, 24, 20, 0.06)",
      },
      width: {
        sidebar: "260px",
        "sidebar-collapsed": "76px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
