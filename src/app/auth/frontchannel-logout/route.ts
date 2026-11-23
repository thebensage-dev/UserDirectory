import type { NextRequest } from "next/server";
import { frontchannelLogout, issuerOrigin } from "@/server/auth";

// GET /auth/frontchannel-logout?iss=…&sid=…: authentik's front-channel logout (see
// frontchannelLogout). It runs in a hidden frame on authentik's sign-out page, so this one route
// may be framed by authentik (next.config.ts leaves it out of the site-wide frame ban).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const done = await frontchannelLogout(params.get("iss"), params.get("sid"));
  const origin = issuerOrigin();
  return new Response(done ? "Signed out of the User Directory." : "Not for this app.", {
    status: done ? 200 : 400,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": `frame-ancestors ${origin ?? "'none'"}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
