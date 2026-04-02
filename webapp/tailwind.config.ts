import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // GrowthSpan brand tokens
        brand: {
          bg: '#171717',
          surface: '#1d1d1d',
          border: '#2a2a2a',
          accent: '#cbfb45',
          'accent-hover': '#b8e53a',
          blue: '#2895f7',
          'blue-deep': '#0082f3',
          text: '#f5f5f5',
          muted: '#a3a3a3',
          subtle: '#525252',
        },
      },
    },
  },
  plugins: [],
}
export default config
