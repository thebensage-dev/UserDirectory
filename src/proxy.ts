import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SSO_CHECKED_COOKIE } from "@/lib/authCookies";

// Automatic single sign-on: a signed-out visitor's page view first goes through a silent check
// with authentik (/auth/login?silent=1, see src/server/auth.ts). Someone already signed in to
// authentik comes back signed in; everyone else comes back to the same page, signed out, with no
// error. It only runs for real page loads in a browser (Sec-Fetch headers), never for prefetches,
// Server Actions, uptime checks or crawlers, and pauses after each check (SSO_CHECKED_COOKIE).
export function proxy(request: NextRequest) {
  const { cookies, headers, method, nextUrl } = request;
  const pageLoad =
    method === "GET" &&
    headers.get("sec-fetch-mode") === "navigate" &&
    headers.get("sec-fetch-dest") === "document" &&
    !headers.has("next-router-prefetch") &&
    !headers.has("rsc");
  if (
    !pageLoad ||
    !process.env.OIDC_ISSUER_URL ||
    cookies.has(SESSION_COOKIE) ||
    cookies.has(SSO_CHECKED_COOKIE)
  ) {
    return NextResponse.next();
  }

  // From APP_URL: behind the proxy, the request's own URL can be the container's (and http).
  const login = new URL("/auth/login", process.env.APP_URL || nextUrl);
  login.searchParams.set("silent", "1");
  login.searchParams.set("returnTo", nextUrl.pathname + nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // Pages only: not the sign-in routes themselves, Next's files or the favicon.
  matcher: ["/((?!auth/|_next/|icon\\.svg|favicon\\.ico|robots\\.txt).*)"],
};
