/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#10b981', // emerald
          accentHover: '#059669',
          neon: '#06b6d4', // cyan
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
