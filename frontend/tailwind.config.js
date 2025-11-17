/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text-primary': '#1a1a1a',
        'text-secondary': '#2c3e50',
        'text-muted': '#6c757d',
        'accent': '#0d47a1',
        'accent-hover': '#1565c0',
      },
      fontFamily: {
        'serif': ['Georgia', '"Times New Roman"', 'Times', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        'content': '700px',
      },
    },
  },
  plugins: [],
}

