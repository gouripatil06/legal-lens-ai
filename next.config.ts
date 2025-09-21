import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds (optional)
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      canvas: 'false',
      encoding: 'false',
    },
  },
};

export default nextConfig;
