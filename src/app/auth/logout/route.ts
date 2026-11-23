import { signOut } from "@/server/auth";

// POST only, from the header's sign-out form, so a link or image can't sign someone out. Then
// authentik's "Sign out" page signs out of every app (see signOut).
//
// Not a redirect: the site's CSP (form-action 'self', next.config.ts) also covers where a form
// submission is redirected, so the browser would block a redirect to authentik. A tiny page that
// moves on by itself is a new navigation, which the CSP allows.
export async function POST() {
  const next = await signOut();
  const href = next.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${href}"><title>Signing out</title></head><body><p>Signing out of every app… <a href="${href}">Continue</a></p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
