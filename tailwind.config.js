/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep Forest Green — primary
        forest: {
          50: '#f1f5f2',
          100: '#dce7df',
          200: '#b9cfc0',
          300: '#8daf98',
          400: '#5f8a70',
          500: '#426b53',
          600: '#325541',
          700: '#294637',
          800: '#1f3d2b',
          900: '#182f22',
          950: '#0d1c14',
        },
        // Warm Beige / Cream — secondary
        cream: {
          50: '#fbf8f1',
          100: '#f5efe1',
          200: '#ece0c8',
          300: '#e0cba6',
          400: '#d3b482',
          500: '#c59f63',
        },
        // Off-white / Ivory — background
        ivory: '#fbf9f4',
        // Dark Charcoal — text
        charcoal: {
          DEFAULT: '#2b2b28',
          light: '#55534d',
          muted: '#807d75',
        },
        // Subtle Gold — accent
        gold: {
          DEFAULT: '#b08d57',
          light: '#c9a96a',
          dark: '#8f6f3f',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
        xl: '10px',
      },
      maxWidth: {
        container: '1240px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,43,40,0.04), 0 8px 24px rgba(43,43,40,0.06)',
        lift: '0 2px 4px rgba(43,43,40,0.05), 0 18px 40px rgba(43,43,40,0.10)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
