import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.coverr.co",
      },
      {
        protocol: "https",
        hostname: "waterpro.pt",
      },
    ],
  },
  transpilePackages: ["three", "gsap", "next-intl"],
  async redirects() {
    return [
      {
        source: "/loja/para-sua-casa/:slug",
        destination: "/para-sua-casa/:slug",
        permanent: true,
      },
      {
        source: "/categoria-produto/para-sua-casa",
        destination: "/para-sua-casa",
        permanent: true,
      },
      {
        source: "/loja",
        destination: "/para-sua-casa",
        permanent: true,
      },
      {
        source: "/categoria-produto/para-a-sua-empresa",
        destination: "/para-a-sua-empresa",
        permanent: true,
      },
      {
        source: "/loja/para-a-sua-empresa/:slug",
        destination: "/para-a-sua-empresa/:slug",
        permanent: true,
      },
      {
        source: "/home1",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
