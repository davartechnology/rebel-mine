import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'rebel-bg': '#080a0f',
        'rebel-bg2': '#0d1018',
        'rebel-bg3': '#12151e',
        'rebel-red': '#e8192c',
        'rebel-red2': '#ff3347',
        'rebel-silver': '#c8d0de',
        'rebel-silver2': '#e8edf5',
        'rebel-blue': '#1a6fff',
        'rebel-blue2': '#4d8fff',
        'rebel-gold': '#c9a84c',
        'rebel-muted': '#4a5568',
      },
      fontFamily: {
        'display': ['Bebas Neue', 'sans-serif'],
        'condensed': ['Barlow Condensed', 'sans-serif'],
        'body': ['Barlow', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}

export default config