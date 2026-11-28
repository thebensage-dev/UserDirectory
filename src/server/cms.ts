import "server-only";
import { draftMode } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import {
  createCmsClient,
  findPage,
  matchPage,
  resolveLink as resolveCmsLink,
  type CmsLink,
  type ResolvedLink,
  type SiteContent,
} from "@thebensage-dev/cms-client";
import type { DirectoryPaths } from "@/components/users/DirectoryText";
import snapshot from "@/content/cms-snapshot.json";
import { mainSiteUrl } from "@/lib/mainSite";

// Every page, the header, the footer and every word of the directory come from the CMS (Payload,
// the Cms repo); the users themselves come from the API (src/server/users.ts). The client keeps the content in
// memory for a minute, serves the last good copy while the CMS is down, and falls back on
// src/content/cms-snapshot.json (`npm run content:snapshot`) when it has never reached the CMS.
// In draft mode (the CMS's Preview button, src/app/preview/route.ts) it reads the drafts instead.

export type Content = SiteContent<"user-directory">;
export type Settings = Content["settings"];
export type { CmsLink, ResolvedLink };

const client = createCmsClient({
  // Where this server reaches the CMS (inside Docker: http://cms:3000).
  baseUrl: process.env.CMS_URL || "http://localhost:3003",
  site: "user-directory",
  snapshot: snapshot as unknown as Content,
  previewSecret: process.env.PREVIEW_SECRET || undefined,
  // Next's own signals (such as "render this per request") aren't the CMS being down.
  rethrow: unstable_rethrow,
});

/** The site's content, read once per request: the drafts while previewing, else published. */
/** Where the browser reaches the CMS: images load from there, and its Live Preview frames this
 *  site. CMS_PUBLIC_URL when the server's own address (CMS_URL) isn't public, as in Docker. */
export const cmsPublicUrl = () =>
  process.env.CMS_PUBLIC_URL || process.env.CMS_URL || "http://localhost:3003";

export const getContent = cache(async (): Promise<Content> => {
  const draft = (await draftMode()).isEnabled && Boolean(process.env.PREVIEW_SECRET);
  return client.content({ draft });
});

export { findPage, matchPage };

/** Where the CMS placed the directory and the profiles: the pages holding the user directory
 *  and user profile blocks (the seeded /users and /users/[id] until an editor moves them). */
export function directoryPaths(content: Content): DirectoryPaths {
  const holding = (type: "userDirectory" | "userProfile") =>
    content.pages.find((page) => page.layout?.some((block) => block.blockType === type))?.path;
  return {
    list: holding("userDirectory") ?? "/users",
    profile: holding("userProfile") ?? "/users/[id]",
  };
}

/**
 * A CMS link's address here, or null when it can't go anywhere: a main-site link while
 * MAIN_SITE_URL is unset, a deleted page, or a type only the main site uses.
 */
export function resolveLink(
  content: Content,
  link: CmsLink | null | undefined,
  mainSite: string | undefined = mainSiteUrl(),
): ResolvedLink | null {
  return resolveCmsLink(content, link, { mainSite: () => mainSite });
}
