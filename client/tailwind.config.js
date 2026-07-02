/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF9F2E',
          cyan: '#12B9D6',
          navy: '#192B55',
          green: '#20B978',
          purple: '#3E12B8',
          red: '#F04444',
          ink: '#20242A',
          muted: '#6F7782',
          line: '#E4E9EF',
          page: '#F7F9FB',
        },
      },
      boxShadow: {
        panel: '0 12px 32px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
