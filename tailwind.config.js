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
        dark: {
          bg: '#212529',
          surface: '#1a1d20',
          card: '#2b3035',
          header: '#212529',
          border: '#495057',
          borderLight: 'rgba(255, 255, 255, 0.15)',
          muted: '#adb5bd',
          text: '#dee2e6',
          light: '#f8f9fa',
        },
        bs: {
          info: '#0dcaf0',
          warning: '#ffc107',
          success: '#198754',
          danger: '#dc3545',
          primary: '#0d6efd',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
