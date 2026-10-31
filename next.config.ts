import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // item images uploaded from the back office to Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    // allows 2 MB image uploads (plus form fields) through server actions
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
