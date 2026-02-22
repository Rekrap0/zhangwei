/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;

const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
