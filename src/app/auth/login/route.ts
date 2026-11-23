import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { authConfigured, beginLogin } from "@/server/auth";

// GET /auth/login?returnTo=/users/3 sends the browser to authentik. With silent=1 (from
// src/proxy.ts) it's the automatic single sign-on check, which never shows authentik's page.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!authConfigured()) redirect("/users");
  const url = await beginLogin(params.get("returnTo") ?? "/users", {
    silent: params.get("silent") === "1",
  });
  redirect(url.href);
}
