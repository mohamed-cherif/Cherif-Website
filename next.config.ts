import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // photos and figures are served at 90 so fine detail (wiring, text) survives
    qualities: [75, 90],
  },
};

export default nextConfig;
