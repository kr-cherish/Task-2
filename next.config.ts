import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MONGO_URI: process.env.NEXT_PUBLIC_MONGO_URI,
  },
};

export default nextConfig;
