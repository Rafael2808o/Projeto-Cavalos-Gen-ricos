
twind.install({
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#1A5D1A',
        secondary: '#E6F3E6',
        accent: '#F4A300',

        primaria: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#1A5D1A',   
          800: '#166534',
          900: '#14532d',
        },

        secundaria: {
          50:  '#f8fdf9',
          100: '#f0fdf4',
          200: '#E6F3E6',   
          300: '#d1f3d8',
          400: '#a8e6b8',
          500: '#7fd99b',
          600: '#6dd18a',
          700: '#5bc879',
          800: '#49bf68',
          900: '#37b657',
        },

        terciaria: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#F4A300',   
          800: '#92400e',
          900: '#78350f',
        },

        neutra: {
          50:  '#f4f4f9',
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#374151',
          600: '#1f2937',
          700: '#111827',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
});
