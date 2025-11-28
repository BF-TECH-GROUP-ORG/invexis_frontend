import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },
  experimental: {
    // Enable optimized prefetching
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
  // Enable automatic static optimization
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
