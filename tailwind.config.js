/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#EFF5FF",
          100: "#DBE7FE",
          200: "#BFD3FE",
          300: "#93B4FD",
          400: "#608FFA",
          500: "#3B6FF5",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        navy: {
          700: "#1E2A42",
          800: "#111A2C",
          900: "#0B1220",
        },
      },
    },
  },
  plugins: [],
};
