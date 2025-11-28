module.exports = {
  theme: {
    extend: {
      colors: {
        customDark: '#081422', // Add more custom colors here
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  // ...other Tailwind config options...
};