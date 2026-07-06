/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0F766E',
          dark: '#0B5A54',
          light: '#CCEAE7',
          card: '#F2FBFA',
        },
        surface: '#F5F5F5',
        border: '#E2E2E2',
        muted: '#5B5B5B',
        error: '#B91C1C',
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        body: '14px',
        input: '16px',
        heading: '18px',
        'heading-lg': '20px',
      },
    },
  },
  plugins: [],
};
