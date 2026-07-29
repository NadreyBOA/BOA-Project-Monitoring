/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        boa: {
          green: '#008457',
          'green-700': '#006A45',
          'green-50': '#E6F3EE',
          violet: '#312B81',
          'violet-50': '#ECEBF5',
          navy: '#044C7E',
          'navy-50': '#E7EFF5',
        },
        status: {
          success: '#008457',
          warning: '#F79009',
          critical: '#E5484D',
          neutral: '#98A2B3',
          info: '#044C7E',
        },
        surface: {
          app: '#F5F6F8',
          card: '#FFFFFF',
          tint: '#F8FAFC',
          border: '#EEF0F3',
        },
        ink: {
          primary: '#0E1726',
          secondary: '#667085',
          tertiary: '#98A2B3',
        },
      },
      borderRadius: {
        card: '22px',
        chip: '16px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(16,23,38,0.06)',
      },
    },
  },
  plugins: [],
};
