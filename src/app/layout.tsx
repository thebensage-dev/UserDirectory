import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import clsx from "clsx";
import {
  colourAttrs,
  COLOURS_COOKIE,
  CookieNotice,
  MobileMenu,
  Logo,
  preferenceCookieDomain,
  readColours,
  readTheme,
  THEME_COOKIE,
  ThemeToggle,
  themeClass,
} from "@thebensage-dev/ui";
import { NavLink } from "@thebensage-dev/ui/next";
import { LogIn, LogOut, UserCog, Users } from "lucide-react";
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
          <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
              <Link href="/" className="rounded-md">
                <Logo name="User Directory" />
              </Link>
              {/* Phones: one menu button with the same links and controls (nothing scrolls sideways). */}
              <MobileMenu label="Menu">
                <Link href="/users" className="mobile-menu-link">
                  <Users aria-hidden />
                  Directory
                </Link>
                <hr className="mobile-menu-divider" />
                <div className="mobile-menu-row">
                  Theme
                  <ThemeToggle
                    initialTheme={theme}
                    cookieDomain={preferenceCookieDomain(mainSite)}
                  />
                </div>
                {user ? (
                  <>
                    {account && (
                      <a href={account} className="mobile-menu-link">
                        <UserCog aria-hidden />
                        <span className="truncate">{user.name}</span>
                      </a>
                    )}
                    <form action="/auth/logout" method="post">
                      <button type="submit" className="mobile-menu-link w-full">
                        <LogOut aria-hidden />
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  authConfigured() && (
                    <a href={signInHref("/users")} className="mobile-menu-link">
                      <LogIn aria-hidden />
                      Sign in
                    </a>
                  )
                )}
              </MobileMenu>
              <nav className="hidden items-center gap-2 sm:flex">
                <NavLink href="/users">Directory</NavLink>
                {user ? (
                  <form action="/auth/logout" method="post" className="flex items-center gap-2">
                    {account ? (
                      <a
                        href={account}
                        className="flex items-center gap-1.5 rounded-md text-sm text-foreground-muted transition hover:text-foreground"
                        title="Your account: name, email and password"
                      >
                        <UserCog className="size-4" aria-hidden />
                        <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
                        <span className="sr-only sm:hidden">Your account</span>
                      </a>
                    ) : (
                      <span className="hidden max-w-40 truncate text-sm text-foreground-muted sm:inline">
                        {user.name}
                      </span>
                    )}
                    <button
                      type="submit"
                      className="icon-btn"
                      title="Sign out"
                      aria-label="Sign out"
                    >
                      <LogOut className="size-4" />
                    </button>
                  </form>
                ) : (
                  authConfigured() && (
                    <a
                      href={signInHref("/users")}
                      className="btn btn-secondary"
                      aria-label="Sign in"
                      title="Sign in"
                    >
                      <LogIn className="size-4" aria-hidden />
                      <span className="hidden sm:inline">Sign in</span>
                    </a>
                  )
                )}
                <ThemeToggle initialTheme={theme} cookieDomain={preferenceCookieDomain(mainSite)} />
              </nav>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </NuqsAdapter>
        <Toaster position="bottom-center" style={toastColours} />
        <CookieNotice policyHref={mainSite && `${mainSite}/privacy#cookies`} />
      </body>
    </html>
  );
}
