/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './data.js',          // ← ADD THIS: badge color classes live in data.js
    './lib/**/*.{js,jsx}', // ← optional, in case lib files use classes too
  ],
  // ← ADD THIS safelist: guarantees these dynamic badge colors are always built
  safelist: [
    'bg-teal-500', 'bg-blue-600', 'bg-red-600', 'bg-amber-500', 'bg-pink-500',
    'bg-emerald-500', 'bg-indigo-500', 'bg-brand', 'bg-green-600', 'bg-navy-800',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy:  { 900: '#081a33', 800: '#0b2547', 700: '#103464' },
        brand: { DEFAULT: '#1f5fbf', 600: '#1f5fbf', 700: '#184d9e', 800: '#0b3f80' },
        ember: { DEFAULT: '#d9532a', 600: '#d9532a', 700: '#bf4421' },
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(8, 26, 51, 0.18)',
      },
    },
  },
  plugins: [],
}