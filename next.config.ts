import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevents Turbopack from inferring a higher-level workspace root when other lockfiles exist.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
