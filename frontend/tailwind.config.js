/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6f00ff',
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d9c2ff',
          300: '#c094ff',
          400: '#a657ff',
          500: '#6f00ff',
          600: '#6200e6',
          700: '#5200bf',
          800: '#430099',
          900: '#360080',
        },
        accent: {
          DEFAULT: '#00d4aa',
          50: '#edfff9',
          100: '#d5fff2',
          200: '#aeffe6',
          300: '#70ffd3',
          400: '#2bffb9',
          500: '#00d4aa',
          600: '#00b892',
          700: '#009075',
          800: '#00715d',
          900: '#005d4d',
        },
        surface: '#1e293b',
        background: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
