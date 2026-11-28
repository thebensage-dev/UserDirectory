import type { UserOptions as ApiUserOptions } from "@thebensage-dev/api-client";

/**
 * The allowed countries (code and name), interests, age ranges and sorts, from the API
 * (`GET /users/options`). The server reads them once per request and passes them on, so the
 * form, filters and server agree with the API and server and browser render identical names.
 */
export type UserOptions = ApiUserOptions;

export type AgeRange = UserOptions["ageRanges"][number];

export const ageRangeLabel = ({ min, max }: AgeRange) =>
  max === null ? `${min}+` : `${min}–${max}`;

/** Looks up a country's name by its code; an unknown code shows as itself. */
export function countryNames({ countries }: Pick<UserOptions, "countries">) {
  const names = new Map(countries.map(({ code, name }) => [code, name]));
  return (code: string) => names.get(code) ?? code;
}
