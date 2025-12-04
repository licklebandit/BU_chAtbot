/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bugema: {
          blue: '#0033A0',
          light: '#0066CC',
          lighter: '#0099FF'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'typing': 'typing-bounce 1.4s infinite ease-in-out both',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.75s',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
        'typing-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
        },
        bounceIn: {
          '0%': { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
          '20%': { transform: 'scale3d(1.1, 1.1, 1.1)' },
          '40%': { transform: 'scale3d(0.9, 0.9, 0.9)' },
          '60%': { opacity: 1, transform: 'scale3d(1.03, 1.03, 1.03)' },
          '80%': { transform: 'scale3d(0.97, 0.97, 0.97)' },
          '100%': { opacity: 1, transform: 'scale3d(1, 1, 1)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
          '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        },
        slideInRight: {
          '0%': { transform: 'translate3d(100%, 0, 0)', visibility: 'visible' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(0, 51, 160, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 51, 160, 0.1) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(rgba(0, 51, 160, 0.1) 1px, transparent 1px)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 51, 160, 0.2)',
        'neumorphic': '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff',
        'neumorphic-dark': '20px 20px 60px #1a1a1a, -20px -20px 60px #2a2a2a',
      },
    },
  },
  plugins: [],
}