import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'cdn-icons-png.flaticon.com',
      'healthviber.devpandasdemo.com',
    ],
    // If you prefer using remotePatterns for more control, uncomment below:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'healthviber.devpandasdemo.com',
    //     port: '',
    //     pathname: '/wp-content/uploads/**',
    //   },
    // ],
  },
  // Add any other Next.js config options below
};

export default nextConfig;
