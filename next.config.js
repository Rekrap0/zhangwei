/** @type {import('next').NextConfig} */
const nextConfig = {
  // OpenNext Cloudflare adapter configuration
};

module.exports = nextConfig;

// Initialize OpenNext Cloudflare for local development
const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
