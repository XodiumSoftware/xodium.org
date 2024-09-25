/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "il-primary": "#dc3dcb",
        "il-primary-dark": "#b32da3",
        "il-secondary": "#19f5aa",
        "il-secondary-dark": "#13c488",
      },
    },
  },
};
