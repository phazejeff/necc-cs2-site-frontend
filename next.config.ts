import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
      return [
        {
          source: '/',
          destination: '/rankings',
          permanent: true
        }
      ]
  },
  env: {
    API_ROOT : "https://necc-api.poopdealer.lol"
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'distribution.faceit-cdn.net'
      },
      {
        protocol: 'https',
        hostname: 'assets.faceit-cdn.net'
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net'
      }
    ]
  }
};

export default nextConfig;
