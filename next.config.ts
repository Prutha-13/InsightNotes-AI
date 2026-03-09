import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ["app", "components", "hooks", "lib", "types"],
  },
};

export default nextConfig;
