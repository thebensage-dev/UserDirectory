import { Footer, type FooterLink } from "@thebensage-dev/ui";
import { mainSiteUrl } from "@/lib/mainSite";

const OWNER = "TheBensage";
/** This app's source code (the repo must be public). */
const GITHUB_URL = "https://github.com/thebensage-dev/UserDirectory";

/**
 * Footer for every page. The privacy notice and terms live on the main site (MAIN_SITE_URL, read
 * at request time); without it, those links are left out.
 */
export default function SiteFooter() {
  const mainSite = mainSiteUrl();
  const more: FooterLink[] = [{ label: "Source code", href: GITHUB_URL, external: true }];
  if (mainSite) more.unshift({ label: "Portfolio", href: mainSite });

  return (
    <Footer
      brand={{ name: "User Directory", href: "/" }}
      tagline={`A demo of server-rendered search, filtering and editing, part of ${OWNER}'s portfolio.`}
      owner={OWNER}
      groups={[
        {
          title: "Directory",
          links: [
            { label: "Overview", href: "/" },
            { label: "Browse people", href: "/users" },
          ],
        },
        { title: `More from ${OWNER}`, links: more },
      ]}
      legal={
        mainSite
          ? [
              { label: "Privacy", href: `${mainSite}/privacy` },
              { label: "Cookies", href: `${mainSite}/privacy#cookies` },
              { label: "Terms", href: `${mainSite}/terms` },
            ]
          : []
      }
    />
  );
}
