/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',
          secondary: '#38BDF8',
          accent: '#F59E0B',
          bg: 'rgb(var(--brand-bg) / <alpha-value>)',
          surface: 'rgb(var(--brand-surface) / <alpha-value>)',
          card: 'rgb(var(--brand-card) / <alpha-value>)',
          sidebar: 'rgb(var(--brand-sidebar) / <alpha-value>)',
          footer: 'rgb(var(--brand-footer) / <alpha-value>)',
          text: 'rgb(var(--brand-text) / <alpha-value>)',
          secondaryText: 'rgb(var(--brand-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--brand-muted) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
          input: 'rgb(var(--brand-input) / <alpha-value>)',
          icon: 'rgb(var(--brand-icon) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.25)',
        glow: '0 0 40px rgba(37, 99, 235, 0.15)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('light', 'html.light &')
    },
  ],
}
