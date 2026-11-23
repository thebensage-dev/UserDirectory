import { logoSvg } from "@thebensage-dev/ui";

// The favicon: SharedUI's logo in the palette's colours (palette.json), rendered at build time.
export const dynamic = "force-static";

export function GET() {
  return new Response(logoSvg(), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
