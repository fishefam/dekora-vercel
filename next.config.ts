import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@/components/icons": "lucide-react",
    },
  },
};

export default nextConfig;
