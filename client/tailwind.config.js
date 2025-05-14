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
        tertiary: "#00AD0E",
        quaternary: "#005C08",
        Blue: "#113EF3",
        Red: "#D60104",
        Yellow: "#F3EC11",
      },
      boxShadow: {
        500: "0px 4px 8px #00AD0E, 0px -2px 16px #00AD0E",
        400: "0px 2px 2px #00AD0E, 0px 1px 6px #00AD0E",
      },
    },
  },
  plugins: [],
};
