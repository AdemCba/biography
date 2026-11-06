import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/*/search/", "/*/search-index.json", "/admin/"] }],
    sitemap: [absoluteUrl("/sitemap.xml")],
  };
}
