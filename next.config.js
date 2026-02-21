/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用 edge runtime 以兼容 Cloudflare Workers
  // 注意：如果某些页面需要，可以在页面级别设置 runtime
};

module.exports = nextConfig;
