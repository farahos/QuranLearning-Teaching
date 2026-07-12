/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        quran: {
          bg: "#f6f8f4",
          surface: "#ffffff",
          soft: "#eef5ef",
          text: "#17211b",
          muted: "#627066",
          line: "#dfe7df",
          green: "#167447",
          bright: "#0f9f67",
          gold: "#b88922",
          blue: "#2463a8",
          red: "#c24135",
        },
      },
      boxShadow: {
        quran: "0 16px 45px rgba(24, 38, 29, 0.08)",
        modal: "0 25px 80px rgba(0, 0, 0, 0.22)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
