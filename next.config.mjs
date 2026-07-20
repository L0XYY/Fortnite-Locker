/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Official Epic renders are served from the community API CDN.
    remotePatterns: [
      { protocol: "https", hostname: "fortnite-api.com" },
      { protocol: "https", hostname: "media.fortniteapi.io" },
    ],
  },
};

export default nextConfig;
