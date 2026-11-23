// Cookie names shared by the sign-in code (src/server/auth.ts) and the proxy (src/proxy.ts),
// which can't import server-only code.

/** The encrypted session (signed-in user). */
export const SESSION_COOKIE = "ud_session";

/**
 * Set while the automatic sign-in check is paused: for a few minutes after a check found no
 * authentik session, so a signed-out visitor isn't sent round on every page.
 */
export const SSO_CHECKED_COOKIE = "ud_sso_checked";
