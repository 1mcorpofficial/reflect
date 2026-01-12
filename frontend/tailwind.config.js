/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* Apple-inspired spacing (8pt grid) */
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      /* Apple-inspired border radius */
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      /* Apple-inspired typography */
      fontFamily: {
        sans: ['var(--font-system)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.4' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'lg': ['20px', { lineHeight: '1.4' }],
        'xl': ['24px', { lineHeight: '1.3' }],
        '2xl': ['32px', { lineHeight: '1.2' }],
      },
      /* Apple-inspired shadows (depth) */
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      /* Apple-inspired colors */
      colors: {
        accent: {
          DEFAULT: 'var(--accent-blue)',
          hover: 'var(--accent-blue-hover)',
          light: 'var(--accent-blue-light)',
        },
        semantic: {
          green: 'var(--semantic-green)',
          amber: 'var(--semantic-amber)',
          red: 'var(--semantic-red)',
        },
      },
      /* Apple-inspired transitions */
      transitionDuration: {
        'fast': 'var(--motion-fast)',
        'base': 'var(--motion-base)',
        'slow': 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        'apple': 'var(--motion-ease)',
        'apple-in': 'var(--motion-ease-in)',
        'apple-out': 'var(--motion-ease-out)',
      },
    },
  },
  plugins: [],
}
