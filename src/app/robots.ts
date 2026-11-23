import type { MetadataRoute } from "next";

// Crawling stays allowed on purpose: every page sends `X-Robots-Tag: noindex, nofollow` (see
// next.config.ts), and search engines only see that header on pages they may fetch. A
// `Disallow: /` here would hide it, and blocked URLs can still be listed from links elsewhere.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" } };
}
