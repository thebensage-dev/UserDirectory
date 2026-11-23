import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { authConfigured, beginLogin, safeReturnTo } from "@/server/auth";

// GET /auth/login?returnTo=… sends the browser to authentik. With silent=1 (from src/proxy.ts)
// it's the automatic single sign-on check, which never shows authentik's page. If authentik can't
// be reached (down, or still setting itself up after a fresh start), the site keeps working
// signed out: a silent check goes back to the page, a click on Sign in says it failed.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!authConfigured()) redirect("/users");
  const silent = params.get("silent") === "1";
  const returnTo = params.get("returnTo") ?? "/users";
  let url: URL;
  try {
    url = await beginLogin(returnTo, { silent });
  } catch (err) {
    console.error("Couldn't reach authentik:", err);
    redirect(silent ? safeReturnTo(returnTo) : "/users?signin=failed");
  }
  redirect(url.href);
}
