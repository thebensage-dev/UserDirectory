import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { completeLogin } from "@/server/auth";

// authentik redirects here after sign-in, and after a silent check that found no session.
export async function GET(request: NextRequest) {
  let next: string;
  try {
    next = await completeLogin(request.nextUrl.search);
  } catch (err) {
    // A silent check whose login cookie went missing: just carry on signed out.
    if (request.nextUrl.searchParams.get("error") === "login_required") redirect("/users");
    console.error("Sign-in failed:", err);
    redirect("/users?signin=failed");
  }
  redirect(next);
}
