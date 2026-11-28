import { NextResponse, type NextRequest } from "next/server";
import { singleSignOn } from "@thebensage-dev/auth/proxy";
import { DRAFT_COOKIE, securityPolicy } from "@thebensage-dev/cms-client";

// Before every page: the automatic single sign-on check (see @thebensage-dev/auth/proxy), then
// the frame rules.
export function proxy(request: NextRequest) {
  const response =
    singleSignOn(request, { cookiePrefix: "ud", mode: "always" }) ?? NextResponse.next();
  return withFrameRules(request, response);
}

/** No framing, except by the CMS's Live Preview while this browser is in draft mode. */
function withFrameRules(request: NextRequest, response: NextResponse) {
  const previewing = request.cookies.has(DRAFT_COOKIE);
  response.headers.set(
    "Content-Security-Policy",
    securityPolicy({ previewing, cmsUrl: process.env.CMS_PUBLIC_URL || process.env.CMS_URL }),
  );
  if (!previewing) response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  // Everything but Next's built files and the front-channel logout page (framed by authentik,
  // with its own rules).
  matcher: ["/((?!_next/static|_next/image|auth/frontchannel-logout).*)"],
};
