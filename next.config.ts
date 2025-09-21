import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: 'false',
      encoding: 'false',
    },
  },
};

export default nextConfig;
