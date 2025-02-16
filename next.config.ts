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
  }
};

export default nextConfig;
