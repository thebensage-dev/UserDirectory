import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { connection } from "next/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import clsx from "clsx";
import {
  colourAttrs,
  COLOURS_COOKIE,
  CookieNotice,
  preferenceCookieDomain,
  readColours,
  readTheme,
  THEME_COOKIE,
  SiteHeader,
  themeClass,
  iconOrDot,
} from "@thebensage-dev/ui";
import { PathLink, PreviewBanner } from "@thebensage-dev/ui/next";
import { fontVariables } from "@/app/fonts";
import { RefreshOnSave } from "@thebensage-dev/cms-client/react";
import SiteFooter from "@/components/layout/SiteFooter";
import DirectoryTextProvider from "@/components/users/DirectoryText";
import { mainSiteUrl } from "@/lib/mainSite";
import { signInHref } from "@/lib/access";
import { accountUrl, authConfigured, currentUser } from "@/server/auth";
import { cmsPublicUrl, directoryPaths, getContent, resolveLink } from "@/server/cms";
import "./globals.css";

// The name and description come from the CMS (the site's settings).
export async function generateMetadata(): Promise<Metadata> {
  await connection(); // From the CMS at request time, not baked in at build.
  const { name, headline: description } = (await getContent()).settings;
  return {
    title: { default: name, template: `%s · ${name}` },
    description,
    icons: { icon: { url: "/icon.svg", type: "image/svg+xml" } },
    // Kept out of search results (also sent as X-Robots-Tag, see next.config.ts).
    robots: { index: false, follow: false },
  };
}

const toastColours = {
  "--normal-bg": "var(--foreground)",
  "--normal-text": "var(--background)",
  "--normal-border": "transparent",
} as React.CSSProperties;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Shared with the main site (cookieDomain), so its theme and colour picks apply here too.
  const cookieStore = await cookies();
  const theme = readTheme(cookieStore.get(THEME_COOKIE)?.value);
  const colours = readColours(cookieStore.get(COLOURS_COOKIE)?.value);
  const user = await currentUser();
  const account = accountUrl();
  const mainSite = mainSiteUrl();
  // The header's name, links and labels come from the CMS (User Directory settings, Header tab).
  const content = await getContent();
  const { settings } = content;
  const nav = (settings.header?.nav ?? []).flatMap((item) => {
    const link = resolveLink(content, item.link);
    if (!link) return [];
    return [
      {
        label: item.label,
        href: link.href,
        icon: iconOrDot(item.icon),
        ...(item.wideOnly && { wideOnly: true }),
        ...(link.external && { external: true }),
      },
    ];
  });
  const labels = settings.header?.labels;
  const paths = directoryPaths(content);
  const ui = settings.interface;
  const previewing = (await draftMode()).isEnabled;
  const cmsUrl = cmsPublicUrl();

  return (
    <html lang="en" className={clsx(fontVariables, themeClass(theme))} {...colourAttrs(colours)}>
      <body className="flex min-h-screen flex-col">
        {previewing && cmsUrl && <RefreshOnSave cmsUrl={cmsUrl} />}
        {previewing && (
          <PreviewBanner label={settings.preview.label} exit={settings.preview.exit} />
        )}
        <NuqsAdapter>
          <SiteHeader
            brand={{ name: settings.name, href: "/" }}
            nav={nav}
            theme={theme}
            cookieDomain={preferenceCookieDomain(mainSite)}
            user={user}
            accountHref={account}
            signInHref={authConfigured() ? signInHref(paths.list) : undefined}
            labels={{
              ...ui.header,
              ...(labels?.signIn && { signIn: labels.signIn }),
              ...(labels?.signOut && { signOut: labels.signOut }),
              ...(labels?.account && { account: labels.account }),
              ...(labels?.theme && { theme: labels.theme }),
            }}
            linkComponent={PathLink}
            sticky
          />
          {/* Every word of the directory (forms, dialogs, notices) and where its pages are, for the
              client components on any page. */}
          <DirectoryTextProvider value={{ shared: settings.directory, paths }}>
            <div className="flex-1">{children}</div>
          </DirectoryTextProvider>
          <SiteFooter />
        </NuqsAdapter>
        <Toaster position="bottom-center" style={toastColours} />
        <CookieNotice
          policyHref={mainSite && `${mainSite}/privacy#cookies`}
          labels={{
            region: ui.cookies.region,
            title: ui.cookies.title,
            dismiss: ui.cookies.dismiss,
            details: ui.cookies.details,
          }}
        >
          {ui.cookies.body}
        </CookieNotice>
      </body>
    </html>
  );
}
