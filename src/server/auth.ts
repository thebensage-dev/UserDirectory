import "server-only";
import { createAuth, inGroup } from "@thebensage-dev/auth";
import type { Access } from "@/lib/access";

// Sign-in through authentik (@thebensage-dev/auth, from the Infrastructure repo). Browsing is
// public. Any authentik account can sign in (single sign-on across the apps); adding, editing
// and deleting need the user-directory-editors group (or authentik Admins). Someone signed in
// without it sees "request edit access". The API checks the same groups on every write, with
// this app's access token: the session keeps authentik's tokens (`keepTokens`).

export const auth = createAuth({
  app: "user-directory",
  cookiePrefix: "ud",
  name: "the User Directory",
  home: "/users",
  keepTokens: true,
  // Every signed-out visitor is checked, so someone signed in on another site arrives signed in.
  silentSignOn: "always",
});

/** The groups that may edit. Approving someone's request in authentik adds them to the first. */
const EDITOR_GROUPS = ["user-directory-editors", "authentik Admins"];

export type SessionUser = { sub: string; name: string; email: string; canEdit: boolean };

/** The signed-in user, or null. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth.currentSession();
  return (
    session && {
      sub: session.sub,
      name: session.name,
      email: session.email,
      canEdit: inGroup(session.groups, EDITOR_GROUPS),
    }
  );
}

/** What the pages pass to the client about signing in and asking for an account. */
export async function pageAccess(): Promise<Access> {
  const user = await currentUser();
  return {
    signedIn: user !== null,
    canEdit: user?.canEdit ?? false,
    canSignIn: auth.configured(),
    requestAccessUrl: auth.requestAccessUrl() ?? undefined,
  };
}

export const { accessToken, accountUrl, safeReturnTo, configured: authConfigured } = auth;
