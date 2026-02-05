module.exports = {
  // OPTIMIZATION: Specify content paths for tree-shaking unused CSS
  // This ensures Tailwind only generates CSS for classes actually used in your code
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
    './src/layouts/**/*.{js,jsx,ts,tsx}',
  ],
  
  theme: {
    // OPTIMIZATION: Override default theme to include only what you use
    // Remove unused defaults to reduce CSS generation time
    extend: {
      colors: {
        customDark: '#081422',
      },
      // OPTIMIZATION: Limit animations to only those used
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
      // OPTIMIZATION: Use spacing scale sparingly
      spacing: {
        // Define only the spacing values you actually use
      },
    },
  },
  
  // OPTIMIZATION: Disable unused Tailwind features for faster builds
  corePlugins: {
    // Only enable what you use - this reduces CSS size
    // Example: disable 'aspectRatio' if you don't use it
  },

  // OPTIMIZATION: Use JIT mode (enabled by default in v3+)
  // Generates CSS on-demand instead of pre-generating everything
  
  // OPTIMIZATION: Enable CSS minification in production
  minify: true,
  
  // Plugins for enhanced functionality
  plugins: [],
};
