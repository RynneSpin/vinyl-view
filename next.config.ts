import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.discogs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.discogs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'st.discogs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api-img.discogs.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
