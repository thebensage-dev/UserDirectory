import type { NextConfig } from "next";

// Security headers for every response. HTTPS itself is handled by Coolify's proxy.
// The CSP leaves scripts and styles alone (Next.js inlines both); it only blocks
// framing, plugins, <base> hijacking and form posts to other sites.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // Bundles a minimal server (server.js + traced node_modules) for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    // Every page except the front-channel logout route, which authentik loads in a frame
    // (it sets its own frame-ancestors).
    return [
      { source: "/((?!auth/frontchannel-logout).*)", headers: securityHeaders },
      // A demo with sample people: keep every page out of search results. Crawling stays allowed
      // (no robots.txt block), so search engines can see this header.
      { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
