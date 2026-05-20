/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidade Mania de Camisa: azul-claro vibrante + branco
        brand: {
          50: '#EAF7FE',
          100: '#D3EEFD',
          200: '#A8DDFB',
          300: '#7CCCF8',
          400: '#43B4F1',
          500: '#1AA5EC',
          600: '#0B86C7',
          700: '#0A6B9E',
          800: '#0C587F',
          900: '#0E4A6A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(14, 74, 106, 0.08), 0 8px 24px rgba(14, 74, 106, 0.06)',
      },
    },
  },
  plugins: [],
};
