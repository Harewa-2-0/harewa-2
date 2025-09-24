import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
};

export default nextConfig; 
