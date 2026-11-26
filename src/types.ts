import type { Person, PersonPage } from "@thebensage-dev/api-client";

// People and pages come straight from the People API's generated types (@thebensage-dev/api-client).
export type User = Person;
export type UserPage = PersonPage;

/** The API's summary, reshaped for the filter menu and stats: [code or name, people] pairs. */
export type DirectorySummary = {
  people: number;
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
