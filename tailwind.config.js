/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        boa: {
          blue: '#003087',
          gold: '#C8A951',
          light: '#E8F0FE',
        }
      }
    }
  },
  plugins: [],
}
