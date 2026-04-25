import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow loading images from localhost backend in development
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        // Backend static files (uploads/mockup + uploads from admin)
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        // Cloudflare R2 production (*.r2.cloudflarestorage.com)
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        // Cloudflare R2 custom public domain
        protocol: "https",
        hostname: "*.cloudflare.com",
        pathname: "/**",
      },
      {
        // Unsplash (mockup data)
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
