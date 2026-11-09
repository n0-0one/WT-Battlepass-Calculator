/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wt: {
          dark: '#0c0e12',
          card: '#12161f',
          surface: '#181e2b',
          border: '#263147',
          gold: '#e5a93c',
          goldLight: '#fcd34d',
          goldDark: '#b47818',
          accent: '#d97706',
          bronze: '#92400e',
          slate: '#334155',
          steel: '#64748b',
          silver: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px -3px rgba(229, 169, 60, 0.25)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.25)',
        'tactical': '0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(38, 49, 71, 0.5)',
      }
    },
  },
  plugins: [],
}
