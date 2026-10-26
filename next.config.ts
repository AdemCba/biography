import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Production build is a fully static site (out/): cheap hosting, fast pages, every push = new deploy.
  output: isDev ? undefined : "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // The admin panel (files named *.admin.tsx / *.admin.ts) only exists in `next dev`.
  // It edits the content files on disk; publishing happens by committing and pushing them.
  pageExtensions: isDev ? ["admin.tsx", "admin.ts", "tsx", "ts"] : ["tsx", "ts"],
};

export default nextConfig;
