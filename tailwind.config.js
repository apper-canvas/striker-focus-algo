/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E', 
        accent: '#FFD700',
        surface: {
          50: '#FDF8F3',
          100: '#F5DEB3',
          200: '#E5D1A6',
          300: '#D5C499',
          400: '#C5B78C',
          500: '#B5AA7F',
          600: '#A59D72',
          700: '#959065',
          800: '#858358',
          900: '#75764B'
        },
        background: '#2C1810',
        success: '#228B22',
        warning: '#FF8C00',
        error: '#DC143C',
        info: '#4682B4'
      },
      fontFamily: { 
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'], 
        heading: ['Righteous', 'ui-sans-serif', 'system-ui'] 
      },
      animation: {
        'coin-drop': 'coinDrop 0.3s ease-out',
        'striker-pulse': 'strikerPulse 2s ease-in-out infinite',
      },
      keyframes: {
        coinDrop: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '50%': { transform: 'scale(0.8) translateY(-10px)', opacity: '0.7' },
          '100%': { transform: 'scale(0.5) translateY(0)', opacity: '0' }
        },
        strikerPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 69, 19, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(139, 69, 19, 0)' }
        }
      }
    },
  },
  plugins: [],
}