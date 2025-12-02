/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <--- ENSURE THIS PATH IS CORRECT
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        "bu-navy": "#0B1A3B",
        "bu-blue": "#155EEF",
        "bu-primary": "#1E3A8A",
        "bu-primary-soft": "#3d5adf",
        "bu-sky": "#E0ECFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 45px rgba(21,94,239,0.25)",
      },
    },
  },
  plugins: [],
}