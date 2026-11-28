import { Footer, type FooterLink, iconByName } from "@thebensage-dev/ui";
import { getContent, resolveLink, type CmsLink, type Content } from "@/server/cms";

type LinkRow = { label: string; icon?: string | null; link: CmsLink };

/** The CMS's footer links. A main-site link (privacy, terms, Portfolio) is left out while
 *  MAIN_SITE_URL is unset. */
function footerLinks(content: Content, rows: LinkRow[] | null | undefined): FooterLink[] {
  return (rows ?? []).flatMap((row) => {
    const link = resolveLink(content, row.link);
    if (!link) return [];
    const Icon = iconByName(row.icon);
    return [
      {
        label: row.label,
        href: link.href,
        ...(Icon && { icon: Icon }),
        ...(link.external && { external: true }),
      },
    ];
  });
}

/** Footer for every page (the CMS's User Directory settings, Footer tab). */
export default async function SiteFooter() {
  const content = await getContent();
  const { name, footer } = content.settings;
  return (
    <Footer
      brand={{ name, href: "/" }}
      tagline={footer.tagline}
      {...(footer.owner && { owner: footer.owner })}
      groups={(footer.groups ?? []).map((group) => ({
        title: group.title,
        links: footerLinks(content, group.links),
      }))}
      legal={footerLinks(content, footer.legal)}
      labels={content.settings.interface.footer}
    />
  );
}
