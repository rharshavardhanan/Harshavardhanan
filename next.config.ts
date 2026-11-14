import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The browser tests build into their own folder (see playwright.config.ts),
  // so running them never breaks a preview server built into .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  // Off on purpose: with it on, an unknown address under /work/ answers 200
  // with the not-found text instead of a real 404 (checked 2026-11-13).
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
