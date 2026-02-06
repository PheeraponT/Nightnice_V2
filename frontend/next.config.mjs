/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nightnice.life",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.nightnice.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5005",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "76.13.18.207",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "76.13.18.207",
        pathname: "/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Proxy API requests to avoid CORS in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://76.13.18.207/api/:path*",
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
