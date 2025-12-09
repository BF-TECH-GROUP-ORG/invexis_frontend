import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
  experimental: {
    // Enable optimized prefetching
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
  // Enable automatic static optimization
  reactStrictMode: true,
};

export default createNextIntlPlugin()(nextConfig);
