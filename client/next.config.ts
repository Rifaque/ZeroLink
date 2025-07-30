// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http', // allow http
        hostname: 'apizerolink.hubzero.in',
      },
      {
        protocol: 'https', // also allow https, in case you switch later
        hostname: 'apizerolink.hubzero.in',
      },
    ],
  },
};

export default nextConfig;
