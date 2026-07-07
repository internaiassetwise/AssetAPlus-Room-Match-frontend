/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Asset Plus brand palette — same hues, calmer application
        navy: {
          50:  '#F4F7FC',
          100: '#E5EBF6',
          200: '#C7D2E8',
          300: '#9CAED4',
          400: '#6B82B6',
          500: '#3D5896',
          600: '#1E3A8A',  // primary brand navy
          700: '#172E70',
          800: '#102256',
          900: '#0A173D',
          950: '#060E29',
        },
        ember: {
          50:  '#FFF4E8',
          100: '#FFE3CB',
          200: '#FFC596',
          300: '#FFA55F',
          400: '#FB923C',
          500: '#F97316',  // primary brand orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        cream: {
          50:  '#FFFCF2',
          100: '#FEF3C7',
          200: '#FDE68A',
        },
        ink:    '#0F1F47',  // body text
        muted:  '#5B6B9E',  // secondary text
        line:   '#E5EAF2',  // default border
        surface:'#FFFFFF',
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
        thai:    ['"Noto Sans Thai"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Noto Sans Thai"', 'sans-serif'],
      },
      boxShadow: {
        // Subtle elevation — no more chunky comic-book offset shadows
        'xs':     '0 1px 2px 0 rgba(15, 31, 71, 0.04)',
        'soft':   '0 1px 3px 0 rgba(15, 31, 71, 0.06), 0 1px 2px 0 rgba(15, 31, 71, 0.04)',
        'card':   '0 2px 8px -2px rgba(15, 31, 71, 0.08), 0 1px 2px -1px rgba(15, 31, 71, 0.04)',
        'lift':   '0 12px 32px -8px rgba(15, 31, 71, 0.12), 0 4px 12px -4px rgba(15, 31, 71, 0.06)',
        'ember':  '0 8px 20px -6px rgba(249, 115, 22, 0.40)',
        'focus':  '0 0 0 3px rgba(30, 58, 138, 0.18)',
      },
      backgroundImage: {
        // Subtle dotted/grid textures for hero accents
        'grid-soft': "linear-gradient(rgba(30,58,138,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,0.04) 1px, transparent 1px)",
        'dot-soft':  "radial-gradient(rgba(30,58,138,0.10) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-up': 'fadeUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}