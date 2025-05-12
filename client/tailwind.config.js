/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Libre: ["Libre Caslon Text", "serif"],
        Lexend: [" Lexend", "sans-serif"],
      },
      colors: {
        primary: "#fff",
        secondary: "#010312",
        tertiary: "#010312",
        quaternary: "#005C08",
        Blue: "#113EF3",
        Red: "#D60104",
        Yellow: "#F3EC11",
      },
    },
  },
  plugins: [],
};
