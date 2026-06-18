
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          600: '#2563EB',
          700: '#1F4E79',
          800: '#1e3a5f',
          900: '#172d4a',
        },
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#27AE60',
          600: '#16a34a',
          700: '#15803d',
        },
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#E74C3C',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          500: '#F39C12',
          600: '#d97706',
          700: '#b45309',
        },
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(31,78,121,0.3)'   },
          '70%':  { boxShadow: '0 0 0 8px rgba(31,78,121,0)'   },
          '100%': { boxShadow: '0 0 0 0 rgba(31,78,121,0)'     },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)'    },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)'  },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)'  },
        },
      },
      animation: {
        'fade-in':        'fade-in 200ms ease-out',
        'slide-up':       'slide-up 240ms ease-out',
        'slide-in-right': 'slide-in-right 250ms ease-out',
        'slide-in-left':  'slide-in-left 250ms ease-out',
        'pulse-ring':     'pulse-ring 1.6s ease-out infinite',
        shake:            'shake 420ms ease-in-out',
      },
    },
  },
  plugins: [],
};