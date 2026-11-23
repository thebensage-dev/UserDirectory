// What the signed-out visitor sees about editing. Shared by the server pages and the client UI.

/** Who to ask for an account. A contact form comes later. */
export const CONTACT_EMAIL = "creativebensonglasgow@gmail.com";

export const ACCESS_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "User Directory access",
)}`;

/** Passed from the server to the client components. */
export type Access = {
  /** Someone is signed in (through authentik, so possibly from another app). */
  signedIn: boolean;
  /** The signed-in person may add, edit and delete: they're in user-directory-editors. */
  canEdit: boolean;
  /** Sign-in is configured, so the "Sign in" button can work. */
  canSignIn: boolean;
  /**
   * authentik's shared "Request access" page with this app ticked: a new account first when
   * signed out, then the apps to ask for. An admin approves each app.
   */
  requestAccessUrl?: string;
};

/** `/users?access=requested`: where authentik sends people after they've asked for access. */
export const ACCESS_REQUESTED_PARAM = "access";
export const ACCESS_REQUESTED_VALUE = "requested";

export const signInHref = (returnTo: string) =>
  `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
