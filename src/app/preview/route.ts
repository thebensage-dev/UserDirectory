import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { verifyPreviewToken } from "@thebensage-dev/cms-client";

// GET /preview?path=…&expires=…&token=…: the CMS's Preview button. A link signed with
// PREVIEW_SECRET turns on draft mode (a cookie for this browser), so the pages show their latest
// drafts, then opens the page. A wrong or expired link opens the homepage, as published.
export async function GET(request: NextRequest) {
  const secret = process.env.PREVIEW_SECRET;
  const path = secret ? verifyPreviewToken(secret, request.nextUrl.searchParams) : null;
  if (!path) redirect("/");
  (await draftMode()).enable();
  redirect(path);
}
