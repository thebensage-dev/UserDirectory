/** The main site's URL (MAIN_SITE_URL, no trailing slash), read at request time. Its privacy
 *  notice and terms cover this app; links to them are left out when it's unset. */
export function mainSiteUrl(): string | undefined {
  return process.env.MAIN_SITE_URL?.replace(/\/$/, "") || undefined;
}
