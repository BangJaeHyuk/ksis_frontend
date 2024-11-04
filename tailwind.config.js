/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      weight: {
        75: "15rem",
      },
      height: {
        75: "18rem",
        128: "32rem",
        140: "35rem",
        145: "38.5rem",
        150: "40rem",
        160: "46rem",
        170: "50rem",
        280: "83.5rem",

        "1/12": "8.333333%",
        "11/12": "91.666667%",
      },
      borderRadius: {
        smd: "0.25rem",
      },
      keyframes: {
        flow: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        flow: "flow 20s linear infinite",
      },
      zIndex: {
        100: "100",
        200: "200",
      },
    },
  },
  plugins: [],
};
