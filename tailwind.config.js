/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        boa: {
          green:        '#1B7A4B',
          'green-dark': '#145c38',
          'green-light':'#e8f5ee',
          navy:         '#1B2E5E',
          'navy-dark':  '#111e3f',
          'navy-light': '#e8ecf5',
          black:        '#0e0e0e',
          white:        '#ffffff',
          'gray-bg':    '#f7f7f5',
          'gray-surf':  '#efefec',
          'gray-border':'#dcdcd8',
          'gray-text':  '#6b6b65',
          red:          '#c0392b',
          'red-light':  '#fdf0ef',
          orange:       '#d4830a',
          'orange-light':'#fdf6e8',
        }
      }
    }
  },
  plugins: [],
}
