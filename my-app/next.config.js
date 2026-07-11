/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Article images come from whatever source (Guardian, Dev.to, HN link
    // targets, Medium) returned the article, so the hostname is unbounded —
    // allow any HTTPS host through the built-in image optimizer instead of
    // an allowlist that would need constant upkeep.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

module.exports = nextConfig;