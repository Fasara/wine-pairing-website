import type { Config } from 'tailwindcss';

// Contrast notes (WCAG AA needs 4.5:1 for body text):
//   sage-700 on white 5.9:1, sage-800 on sage-50 9.6:1, ink on cream 13:1.
// sage-500/600 are decorative / large-text only (sage-600 on white is 4.3:1).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#EEF2EA',
          100: '#DDE5D5',
          200: '#C4D2B8',
          500: '#9CAF88',
          600: '#6B8062',
          700: '#556B4D',
          800: '#3F5139',
          900: '#2C3A28',
        },
        cream: '#FAF8F4',
        ink: '#2B2D2A',
        muted: '#5C625A',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
