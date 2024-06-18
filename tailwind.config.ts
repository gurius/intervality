import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'on-surface': 'hsl(var(--on-surface) / <alpha-value>)',

        primary: 'hsl(var(--primary) / <alpha-value>)',
        'on-primary': 'hsl(var(--on-primary) / <alpha-value>)',

        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        'on-secondary': 'hsl(var(--on-secondary) / <alpha-value>',

        container: 'hsl(var(--container) / <alpha-value>)',
        'on-container': 'hsl(var(--on-container) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          '"Ubuntu Condensed"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: [
          '"Brygada 1918"',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
