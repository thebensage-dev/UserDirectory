// Users and pages come straight from the API's generated types (@thebensage-dev/api-client).
export type { User, UserPage } from "@thebensage-dev/api-client";

/** The API's summary, reshaped for the filter menu and stats: [code or name, users] pairs. */
export type DirectorySummary = {
  users: number;
  averageAge: number;
  countries: [string, number][];
  interests: [string, number][];
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Set when the change was refused only because nobody is signed in. */
      signInRequired?: true;
    };
