import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ===== PERFORMANCE OPTIMIZATIONS =====

  // Optimize images for faster loading and smaller payloads
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
    ],
    // Enable AVIF for modern browsers (30% smaller than WebP)
    formats: ['image/avif', 'image/webp'],
    // Optimize device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Aggressive Turbopack/Webpack optimization
  experimental: {
    // Optimize package imports to reduce bundle size and compilation time
    // Only imports what's actually used instead of bundling entire packages
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      '@mui/x-data-grid',
      'lucide-react',
      'recharts',
      'date-fns',
      'dayjs',
      'framer-motion',
      '@emotion/styled',
      '@emotion/react',
    ],

    // Optimize CSS modules to reduce CSS-in-JS overhead
    optimizeCss: false,

    // Parallel routes for independent page segments (faster route transitions)
    parallelRoutesFallbacks: true,
  },

  // Enable React strict mode for safer component lifecycle
  reactStrictMode: true,

  // Build optimization settings
  swcMinify: true, // Use SWC for faster minification than Terser

  // Disable static generation warnings for non-SSG pages
  staticPageGenerationTimeout: 120,

  // Optimize TypeScript checking
  typescript: {
    // Speed up build by using faster type checking
    tsconfigPath: './tsconfig.json',
  },

  // Optimize webpack module resolution
  webpack: (config, { isServer }) => {
    // Reduce module resolution overhead
    config.resolve = {
      ...config.resolve,
      // Use faster module resolution
      mainFields: isServer
        ? ['main', 'module']
        : ['module', 'main'],
      // Reduce filesystem calls during resolution
      cacheWithContext: true,
    };



    return config;
  },

  // Reduce initial page load time
  compress: true,

  // Optimize HTTP/2 Server Push
  poweredByHeader: false, // Remove X-Powered-By header to save bytes

  // Disable sourcemaps in production for faster builds (enable only if needed)
  productionBrowserSourceMaps: false,
};

export default createNextIntlPlugin()(nextConfig);
