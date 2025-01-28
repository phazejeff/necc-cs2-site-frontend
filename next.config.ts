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
    API_ROOT : "http://127.0.0.1:5000"
  }
};

export default nextConfig;
