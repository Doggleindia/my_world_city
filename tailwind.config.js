/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#081a33',
          800: '#0b2547',
          700: '#103464',
        },
        brand: {
          DEFAULT: '#1f5fbf',
          600: '#1f5fbf',
          700: '#184d9e',
        },
        ember: {
          DEFAULT: '#d9532a',
          600: '#d9532a',
          700: '#bf4421',
        },
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(8, 26, 51, 0.18)',
      },
    },
  },
  plugins: [],
}
