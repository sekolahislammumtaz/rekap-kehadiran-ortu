/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow external packages if needed
  experimental: {
    serverComponentsExternalPackages: ["xlsx", "@prisma/client"]
  }
};

export default nextConfig;
