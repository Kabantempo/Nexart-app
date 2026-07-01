import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'i.pravatar.cc' },
      { hostname: 'cvqeysnymnkfxfithhsr.supabase.co' },
    ],
  },
};

export default nextConfig;
