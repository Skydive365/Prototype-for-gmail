import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hidden so it doesn't cover the component in previews and visual comparisons.
  devIndicators: false,
};

export default nextConfig;
