import type { NextConfig } from "next";

// During `bun run deploy`, Convex sets NEXT_PUBLIC_CONVEX_URL for the build.
// Derive the .convex.site URL so Better Auth matches the same deployment without
// a second manual env var (override with NEXT_PUBLIC_CONVEX_SITE_URL if needed).
const convexSiteUrl =
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\.convex\.cloud$/i, ".convex.site") ??
  "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CONVEX_SITE_URL: convexSiteUrl,
  },
};

export default nextConfig;
