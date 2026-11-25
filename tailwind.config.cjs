/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

/**
 * Smart E-Mobility Hub Design System (VNU-HCM / HCMUT)
 * Role-based semantic tokens backed by CSS custom properties in src/index.css.
 */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        '2xs': '360px',
        xs: '390px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1728px',
        '4xl': '1920px',
      },
      colors: {
        white: '#FFFFFF',
        black: '#000000',

        // Primary Brand (BK Sky Blue #1488D8)
        primary: {
          300: '#72BFF6',
          DEFAULT: '#1488D8',
          700: '#0D6DB5',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          soft: 'var(--primary-soft)',
          line: 'var(--primary-line)',
          on: 'var(--on-primary)',
        },

        // Secondary Brand (BK Deep Navy #030391 — Sidebars & Auth Hero)
        navy: {
          300: '#4F6AD2',
          DEFAULT: '#030391',
          700: '#010156',
          soft: 'var(--navy-soft)',
          on: 'var(--on-navy)',
        },

        // Tertiary Eco Accent (EV Green #10B981)
        eco: {
          300: '#6EE7B7',
          DEFAULT: '#10B981',
          700: '#047857',
          soft: 'var(--eco-soft)',
          on: 'var(--on-eco)',
        },

        // Neutral Surfaces & Borders
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          muted: 'var(--ink-muted)',
        },
        focus: 'var(--focus)',
        overlay: 'var(--overlay)',

        // Semantic Status Colors
        info: {
          300: '#93C5FD',
          DEFAULT: 'var(--info)',
          700: '#1D4ED8',
          soft: 'var(--info-soft)',
        },
        ok: {
          300: '#86EFAC',
          DEFAULT: 'var(--ok)',
          700: '#15803D',
          soft: 'var(--ok-soft)',
        },
        warn: {
          300: '#FDE68A',
          DEFAULT: 'var(--warn)',
          700: '#B45309',
          soft: 'var(--warn-soft)',
        },
        danger: {
          300: '#FCA5A5',
          DEFAULT: 'var(--danger)',
          700: '#B91C1C',
          soft: 'var(--danger-soft)',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', ...defaultTheme.fontFamily.sans],
        display: ['Be Vietnam Pro', ...defaultTheme.fontFamily.sans],
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        label: ['11px', { lineHeight: '16px', letterSpacing: '0.06em' }],
        caption: ['12px', { lineHeight: '16px' }],
        'body-sm': ['13.5px', { lineHeight: '20px' }],
        body: ['15px', { lineHeight: '22px' }],
        'body-lg': ['17px', { lineHeight: '26px' }],
        title: ['20px', { lineHeight: '28px' }],
        heading: ['24px', { lineHeight: '32px' }],
        display: ['32px', { lineHeight: '40px' }],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: 'var(--sh-card)',
        1: 'var(--sh-1)',
        2: 'var(--sh-2)',
        3: 'var(--sh-3)',
        brand: 'var(--sh-brand)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { backgroundColor: 'var(--surface-2)' },
          '50%': { backgroundColor: 'var(--surface-3)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'qr-scan': {
          '0%, 100%': { top: '8%' },
          '50%': { top: '88%' },
        },
      },
      animation: {
        skeleton: 'skeleton 1.6s ease-in-out infinite',
        rise: 'rise 220ms cubic-bezier(0.2, 0, 0, 1) both',
        'slide-in-left': 'slide-in-left 220ms cubic-bezier(0.2, 0, 0, 1) both',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.2, 0, 0, 1) both',
        'qr-scan': 'qr-scan 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
