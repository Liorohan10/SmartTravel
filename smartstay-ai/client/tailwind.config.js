/*** Tailwind config ***/
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        display: ['Lora', 'Georgia', 'serif']
      },
      colors: {
        primary: {
          100: '#E0F7FA',
          400: '#26C6DA', 
          500: '#00BCD4',
          700: '#0097A7'
        },
        neutral: {
          100: '#F8F9FA',
          200: '#E9ECEF', 
          500: '#ADB5BD',
          800: '#343A40',
          900: '#212529'
        },
        success: { 500: '#28A745' },
        warning: { 500: '#FFC107' },
        error: { 500: '#DC3545' }
      },
      boxShadow: {
        'elevation-1': '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'elevation-2': '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.12)', 
        'elevation-3': '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.16)',
        'glow-primary': '0 0 20px rgba(0,188,212,0.3)',
        'glow-focus': '0 0 0 3px rgba(0,188,212,0.2)',
        'glass-light': 'inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-dark': 'inset 0 1px 0 rgba(255,255,255,0.05)'
      },
      backgroundImage: {
        'aurora-calm': 'radial-gradient(50% 50% at 20% 10%, rgba(132,250,176,0.4), transparent 60%), radial-gradient(40% 40% at 80% 20%, rgba(143,211,244,0.3), transparent 60%)',
        'aurora-vivid': 'radial-gradient(60% 60% at 30% 10%, rgba(161,196,253,0.5), transparent 70%), radial-gradient(50% 50% at 70% 80%, rgba(194,233,251,0.4), transparent 60%)', 
        'aurora-dawn': 'radial-gradient(40% 40% at 20% 10%, rgba(246,211,101,0.3), transparent 60%), radial-gradient(50% 50% at 80% 20%, rgba(253,160,133,0.25), transparent 60%)',
        'shimmer': 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.2) 37%, transparent 63%)'
      },
      keyframes: {
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(-2%,-1%,0) scale(1.02)' },
          '66%': { transform: 'translate3d(2%,1%,0) scale(1.03)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 }
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'theme-transition-light': {
          '0%': { 
            opacity: 0,
            transform: 'scale(0.95) rotate(-2deg)',
            filter: 'brightness(0.8) saturate(0.7)'
          },
          '50%': {
            opacity: 0.7,
            transform: 'scale(1.02) rotate(0deg)',
            filter: 'brightness(1.1) saturate(1.3)'
          },
          '100%': { 
            opacity: 1,
            transform: 'scale(1) rotate(0deg)',
            filter: 'brightness(1) saturate(1)'
          }
        },
        'theme-transition-dark': {
          '0%': { 
            opacity: 0,
            transform: 'scale(1.05) rotate(2deg)',
            filter: 'brightness(1.2) saturate(1.4)'
          },
          '50%': {
            opacity: 0.6,
            transform: 'scale(0.98) rotate(0deg)',
            filter: 'brightness(0.9) saturate(0.8)'
          },
          '100%': { 
            opacity: 1,
            transform: 'scale(1) rotate(0deg)',
            filter: 'brightness(1) saturate(1)'
          }
        },
        'aurora-ripple': {
          '0%': { 
            transform: 'scale(0)',
            opacity: 1
          },
          '100%': { 
            transform: 'scale(4)',
            opacity: 0
          }
        }
      },
      animation: {
        'aurora-drift': 'aurora-drift 60s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out',
        'theme-transition-light': 'theme-transition-light 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'theme-transition-dark': 'theme-transition-dark 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'aurora-ripple': 'aurora-ripple 1.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'theme': 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      transitionDuration: {
        'theme': '800ms'
      }
    },
  },
  plugins: [],
}
