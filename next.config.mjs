/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ["pdf-parse", "pdf2json"],
      },    
};

export default nextConfig;
