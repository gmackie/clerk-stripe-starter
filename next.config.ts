import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['img.clerk.com'], // Add Clerk image domain if needed
  },
};

export default nextConfig;
