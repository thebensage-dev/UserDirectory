import "server-only";
import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import * as oidc from "openid-client";
import type { Access } from "@/lib/access";
import { SESSION_COOKIE, SSO_CHECKED_COOKIE } from "@/lib/authCookies";

// Sign-in through authentik (OpenID Connect, authorization code + PKCE). Browsing is public.
// Any authentik account can sign in (single sign-on across the apps); adding, editing and
// deleting need the user-directory-editors group (or authentik Admins), read from the token's
// `groups` claim. Someone signed in without it sees "request edit access". The People API checks
// the same groups on every write.
//
// The session is an encrypted cookie (no session table). It holds the user's name and email,
// for the header, and authentik's access and refresh tokens: the People API, which holds the
// data, accepts this app's access tokens for writes. accessToken() refreshes an expiring one.
//
// Single sign-on: someone already signed in to authentik (in another app, say) is signed in here
// without a click. src/proxy.ts sends a signed-out visitor's page view through a silent check
// (prompt=none): authentik answers at once, with a code when it has a session and with
// error=login_required when it hasn't, and either way the visitor lands back on the same page.

export type SessionUser = { sub: string; name: string; email: string; canEdit: boolean };

/** The groups that may edit. Approving someone's request in authentik adds them to the first. */
const EDITOR_GROUPS = ["user-directory-editors", "authentik Admins"];

type Session = Omit<SessionUser, "canEdit"> & {
  /** The person's authentik groups, from the ID token (updated on every refresh). */
  groups: string[];
  /** authentik's session id (ID token `sid`), matched by front-channel logout. */
  sid?: string;
  accessToken: string;
  refreshToken?: string;
  /** When the access token expires, in seconds since 1970. */
  accessExpires: number;
  /** When the session itself ends, in seconds since 1970 (the JWT's exp). */
  exp?: number;
};

/** Refresh this long before the access token runs out, so it can't expire mid-request. */
const REFRESH_MARGIN_SECONDS = 60;
const nowSeconds = () => Math.floor(Date.now() / 1000);

const LOGIN_COOKIE = "ud_login";
const SESSION_HOURS = 8;
/** How long to wait before checking again after a check found no authentik session. */
const SSO_RECHECK_MINUTES = 10;
/** authentik's answers to prompt=none that just mean "not signed in here". */
const SILENT_MISSES = new Set(["login_required", "consent_required", "interaction_required"]);

type AuthEnv = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  appUrl: string;
  secret: string;
  internalUrl?: string;
};

function readEnv(): AuthEnv | null {
  const {
    OIDC_ISSUER_URL: issuer,
    OIDC_CLIENT_ID: clientId,
    OIDC_CLIENT_SECRET: clientSecret,
    APP_URL: appUrl,
    AUTH_SECRET: secret,
    OIDC_INTERNAL_URL: internalUrl,
  } = process.env;
  if (!issuer || !clientId || !clientSecret || !appUrl || !secret) return null;
  return {
    // Exactly as given: authentik's issuer ends in a slash and must match character for character.
    issuer,
    clientId,
    clientSecret,
    appUrl: appUrl.replace(/\/$/, ""),
    secret,
    internalUrl: internalUrl?.replace(/\/$/, "") || undefined,
  };
}

/** True when the OIDC variables are set, so the sign-in button can work. */
export function authConfigured(): boolean {
  return readEnv() !== null;
}

/** authentik's shared "Request access" page (blueprint flow `request-access`), this app ticked. */
const REQUEST_ACCESS_PATH = "/if/flow/request-access/?app=user-directory";

/** authentik's "Your account" page (blueprint flow `account`): name, email and password. */
export function accountUrl(): string | null {
  const env = readEnv();
  return env ? new URL("/if/flow/account/?app=user-directory", env.issuer).href : null;
}

/** What the pages pass to the client about signing in and asking for an account. */
export async function pageAccess(): Promise<Access> {
  const env = readEnv();
  const user = await currentUser();
  return {
    signedIn: user !== null,
    canEdit: user?.canEdit ?? false,
    canSignIn: env !== null,
    requestAccessUrl: env ? new URL(REQUEST_ACCESS_PATH, env.issuer).href : undefined,
  };
}

function requireEnv(): AuthEnv {
  const env = readEnv();
  if (!env) throw new Error("Sign-in isn't configured (see .env.example).");
  return env;
}

// Cookies are encrypted with a key derived from AUTH_SECRET.
const keyFor = (secret: string) => createHash("sha256").update(secret).digest();

async function seal(payload: Record<string, unknown>, expiresIn: string | number, secret: string) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .encrypt(keyFor(secret));
}

async function unseal(token: string | undefined, secret: string) {
  if (!token) return null;
  try {
    return (await jwtDecrypt(token, keyFor(secret))).payload;
  } catch {
    return null;
  }
}

let configPromise: Promise<oidc.Configuration> | undefined;

/**
 * Discovers authentik once per process. When OIDC_INTERNAL_URL is set (the local Docker stack),
 * server-to-server calls go to that origin instead of the issuer's, which inside a container
 * would point back at the container itself. The browser still uses the public URL. authentik
 * builds its issuer from the request's host, so the public host is passed along as
 * X-Forwarded-Host (authentik trusts it from private network addresses).
 */
function getConfig(env: AuthEnv): Promise<oidc.Configuration> {
  configPromise ??= (async () => {
    const publicUrl = new URL(env.issuer);
    const fetchVia: oidc.CustomFetch = (url, options) => {
      // openid-client's body type is a little wider than the DOM's; it only sends what fetch accepts.
      const init = options as RequestInit;
      const target = new URL(url);
      if (!env.internalUrl || target.origin !== publicUrl.origin) return fetch(url, init);
      const internal = new URL(env.internalUrl);
      target.protocol = internal.protocol;
      target.host = internal.host;
      const headers = new Headers(init.headers);
      headers.set("X-Forwarded-Host", publicUrl.host);
      headers.set("X-Forwarded-Proto", publicUrl.protocol.replace(":", ""));
      return fetch(target, { ...init, headers });
    };
    const insecure = env.issuer.startsWith("http://") ? [oidc.allowInsecureRequests] : [];
    const config = await oidc.discovery(
      new URL(env.issuer),
      env.clientId,
      env.clientSecret,
      undefined,
      { [oidc.customFetch]: fetchVia, execute: insecure },
    );
    config[oidc.customFetch] = fetchVia;
    return config;
  })().catch((err) => {
    configPromise = undefined;
    throw err;
  });
  return configPromise;
}

const cookieOptions = (env: AuthEnv, maxAgeSeconds: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.appUrl.startsWith("https://"),
  path: "/",
  maxAge: maxAgeSeconds,
});

/** Only same-site paths, so the login can't be used to redirect somewhere else. */
export function safeReturnTo(value: string | null | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : "/users";
}

/**
 * Starts a sign-in: remembers state and the PKCE verifier, returns authentik's URL. A silent one
 * (prompt=none) never shows a page: authentik sends the browser straight back either way.
 */
export async function beginLogin(returnTo: string, { silent = false } = {}): Promise<URL> {
  const env = requireEnv();
  const jar = await cookies();
  // Pauses the automatic check, so a visitor with no authentik session isn't sent round again on
  // every page. Set first: if authentik can't be reached, the visitor still gets the page.
  if (silent) jar.set(SSO_CHECKED_COOKIE, "1", cookieOptions(env, SSO_RECHECK_MINUTES * 60));
  const config = await getConfig(env);
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();

  jar.set(
    LOGIN_COOKIE,
    await seal({ verifier, state, returnTo: safeReturnTo(returnTo), silent }, "15m", env.secret),
    cookieOptions(env, 15 * 60),
  );

  return oidc.buildAuthorizationUrl(config, {
    redirect_uri: `${env.appUrl}/auth/callback`,
    // offline_access: a refresh token, so writes keep working after the 60-minute access token.
    scope: "openid profile email offline_access",
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
    code_challenge_method: "S256",
    state,
    ...(silent && { prompt: "none" }),
  });
}

/** Finishes a sign-in from authentik's redirect. Returns where to send the user next. */
export async function completeLogin(search: string): Promise<string> {
  const env = requireEnv();
  const jar = await cookies();
  const pending = await unseal(jar.get(LOGIN_COOKIE)?.value, env.secret);
  jar.delete(LOGIN_COOKIE);
  if (typeof pending?.verifier !== "string" || typeof pending.state !== "string") {
    throw new Error("The sign-in expired. Please try again.");
  }

  const returnTo = safeReturnTo(typeof pending.returnTo === "string" ? pending.returnTo : null);
  // A silent check that found no authentik session: carry on signed out, with no error.
  const error = new URLSearchParams(search).get("error");
  if (pending.silent === true && error && SILENT_MISSES.has(error)) return returnTo;

  const config = await getConfig(env);
  // Rebuilt from APP_URL: behind the proxy, the request's own URL is the container's.
  const callbackUrl = new URL(`${env.appUrl}/auth/callback${search}`);
  const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
    pkceCodeVerifier: pending.verifier,
    expectedState: pending.state,
  });
  const claims = tokens.claims();
  if (!claims) throw new Error("authentik didn't return an ID token.");

  const session: Session = {
    sub: claims.sub,
    name: String(claims.name ?? claims.preferred_username ?? claims.email ?? "Signed in"),
    email: String(claims.email ?? ""),
    groups: groupsOf(claims),
    sid: typeof claims.sid === "string" ? claims.sid : undefined,
    ...tokenFields(tokens),
  };
  jar.set(
    SESSION_COOKIE,
    await seal(session, `${SESSION_HOURS}h`, env.secret),
    cookieOptions(env, SESSION_HOURS * 3600),
  );
  jar.delete(SSO_CHECKED_COOKIE);
  return returnTo;
}

function groupsOf(claims: oidc.IDToken | undefined): string[] {
  const groups = claims?.groups;
  return Array.isArray(groups) ? groups.filter((g): g is string => typeof g === "string") : [];
}

const mayEdit = (groups: string[]) => groups.some((group) => EDITOR_GROUPS.includes(group));

function tokenFields(tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers) {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessExpires: nowSeconds() + (tokens.expiresIn() ?? 300),
  };
}

async function readSession(env: AuthEnv): Promise<Session | null> {
  const payload = await unseal((await cookies()).get(SESSION_COOKIE)?.value, env.secret);
  if (typeof payload?.sub !== "string" || typeof payload.accessToken !== "string") return null;
  const session: Session = {
    sub: payload.sub,
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    groups: Array.isArray(payload.groups) ? payload.groups.map(String) : [],
    sid: typeof payload.sid === "string" ? payload.sid : undefined,
    accessToken: payload.accessToken,
    refreshToken: typeof payload.refreshToken === "string" ? payload.refreshToken : undefined,
    accessExpires: Number(payload.accessExpires ?? 0),
    exp: payload.exp,
  };
  // An expired access token with no way to refresh it can't write, so it isn't a session.
  if (!session.refreshToken && session.accessExpires <= nowSeconds()) return null;
  return session;
}

/** The signed-in user, or null. Always null when sign-in isn't configured. */
export async function currentUser(): Promise<SessionUser | null> {
  const env = readEnv();
  if (!env) return null;
  const session = await readSession(env);
  return (
    session && {
      sub: session.sub,
      name: session.name,
      email: session.email,
      canEdit: mayEdit(session.groups),
    }
  );
}

/**
 * The signed-in person's access token for the People API, or null when nobody is signed in.
 * Refreshes it first when it's about to expire, which rewrites the session cookie, so call it
 * only from Server Actions and route handlers. A failed refresh (revoked in authentik, say)
 * signs the person out here.
 */
export async function accessToken(): Promise<string | null> {
  const env = readEnv();
  if (!env) return null;
  const session = await readSession(env);
  if (!session) return null;
  if (session.accessExpires - REFRESH_MARGIN_SECONDS > nowSeconds()) return session.accessToken;
  if (!session.refreshToken) return null;

  const jar = await cookies();
  try {
    const tokens = await oidc.refreshTokenGrant(await getConfig(env), session.refreshToken);
    const { exp, ...rest } = session;
    const end = exp ?? nowSeconds() + SESSION_HOURS * 3600;
    // A refresh brings the current groups, so an approval shows up within the hour.
    const claims = tokens.claims();
    const refreshed = {
      ...rest,
      ...(claims && { groups: groupsOf(claims) }),
      ...tokenFields(tokens),
    };
    // authentik may not rotate the refresh token; keep the old one then.
    refreshed.refreshToken ??= session.refreshToken;
    jar.set(SESSION_COOKIE, await seal(refreshed, end, env.secret), {
      ...cookieOptions(env, Math.max(0, end - nowSeconds())),
    });
    return refreshed.accessToken;
  } catch {
    jar.delete(SESSION_COOKIE);
    return null;
  }
}

/**
 * Signs out everywhere (single logout): drops this app's session and returns authentik's
 * "Sign out" page (flow `sign-out`), which ends the authentik session, signs the other apps out
 * through their front-channel logout and sends the person back here.
 */
export async function signOut(): Promise<string> {
  (await cookies()).delete(SESSION_COOKIE);
  const env = readEnv();
  return env ? new URL("/if/flow/sign-out/?app=user-directory", env.issuer).href : "/users";
}

/**
 * Front-channel logout: authentik's "Sign out" page (flow `sign-out`, used by every app) loads
 * this in a hidden frame after ending the authentik session, so signing out anywhere signs out
 * here too. Only for this app's issuer, and only the session from that authentik session (sid)
 * when both know it. Returns false for a request that isn't for this app.
 */
export async function frontchannelLogout(iss: string | null, sid: string | null): Promise<boolean> {
  const env = readEnv();
  if (!env || iss !== env.issuer) return false;
  const session = await readSession(env);
  if (session?.sid && sid && session.sid !== sid) return true;
  (await cookies()).delete(SESSION_COOKIE);
  return true;
}

/** The origin allowed to frame the front-channel logout page (authentik's). */
export function issuerOrigin(): string | null {
  const env = readEnv();
  return env ? new URL(env.issuer).origin : null;
}
