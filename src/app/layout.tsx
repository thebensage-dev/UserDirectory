import type { Metadata } from "next";
import { cookies } from "next/headers";
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
} from "@thebensage-dev/ui";
import { PathLink } from "@thebensage-dev/ui/next";
import { Users } from "lucide-react";
import { fontVariables } from "@/app/fonts";
import SiteFooter from "@/components/layout/SiteFooter";
import { mainSiteUrl } from "@/lib/mainSite";
import { signInHref } from "@/lib/access";
import { accountUrl, authConfigured, currentUser } from "@/server/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "User Directory", template: "%s · User Directory" },
  description:
    "A searchable people directory built with Next.js and React, on a .NET API with PostgreSQL.",
  icons: { icon: { url: "/icon.svg", type: "image/svg+xml" } },
  // Kept out of search results (also sent as X-Robots-Tag, see next.config.ts).
  robots: { index: false, follow: false },
};

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

  return (
    <html lang="en" className={clsx(fontVariables, themeClass(theme))} {...colourAttrs(colours)}>
      <body className="flex min-h-screen flex-col">
        <NuqsAdapter>
          <SiteHeader
            brand={{ name: "User Directory", href: "/" }}
            nav={[{ label: "Directory", href: "/users", icon: Users }]}
            theme={theme}
            cookieDomain={preferenceCookieDomain(mainSite)}
            user={user}
            accountHref={account}
            signInHref={authConfigured() ? signInHref("/users") : undefined}
            labels={{ account: "Your account: name, email and password" }}
            linkComponent={PathLink}
            sticky
          />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </NuqsAdapter>
        <Toaster position="bottom-center" style={toastColours} />
        <CookieNotice policyHref={mainSite && `${mainSite}/privacy#cookies`} />
      </body>
    </html>
  );
}
