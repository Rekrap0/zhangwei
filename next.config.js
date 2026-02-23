/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set basePath for deployment under a subpath (e.g., '/game')
  // Leave empty string for root deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Automatically prefix asset paths
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

module.exports = nextConfig;

const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
