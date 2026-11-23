// App-specific preferences stored in cookies and read on the server, so the first paint is
// right. The theme preference (readTheme, ThemeToggle) comes from @thebensage-dev/ui.
import { setPreferenceCookie } from "@thebensage-dev/ui";

const VIEWS = ["cards", "table"] as const;
export type View = (typeof VIEWS)[number];

export const VIEW_COOKIE = "view";

/** Turns an untrusted cookie value into a View, falling back to "cards". */
export function readView(value: string | undefined): View {
  return (VIEWS as readonly string[]).includes(value ?? "") ? (value as View) : "cards";
}

export const saveView = (view: View) => setPreferenceCookie(VIEW_COOKIE, view);
