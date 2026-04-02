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
        // GrowthSpan brand tokens (light theme — matches growthspan.ca)
        brand: {
          bg: '#ffffff',
          surface: '#f8f8f8',
          border: '#e5e7eb',
          accent: '#4d65ff',
          'accent-hover': '#3a52e8',
          blue: '#4d65ff',
          'blue-deep': '#3a52e8',
          text: '#111111',
          muted: '#6b7280',
          subtle: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
}
export default config
