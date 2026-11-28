import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";
import type { UserOptions } from "@/lib/userOptions";

/** Each sort order the API offers, and the field holding its label in the CMS (the user
 *  directory block's Sort orders). */
export const SORT_FIELDS = {
  "id-desc": "idDesc",
  "id-asc": "idAsc",
  "name-asc": "nameAsc",
  "name-desc": "nameDesc",
  "age-asc": "ageAsc",
  "age-desc": "ageDesc",
  "country-asc": "countryAsc",
  "country-desc": "countryDesc",
} as const;

export type SortValue = keyof typeof SORT_FIELDS;
export type SortColumn = "id" | "name" | "age" | "country";
type SortDir = "asc" | "desc";

const SORT_VALUES = Object.keys(SORT_FIELDS) as SortValue[];

export const parseSortValue = (value: SortValue) => {
  const [column, dir] = value.split("-") as [SortColumn, SortDir];
  return { column, dir };
};

export const PAGE_SIZES = [12, 24, 48] as const;

type Filters = Pick<UserOptions, "countries" | "ageRanges">;

/** The list's URL parameters. Unknown countries and age ranges read as "any". */
export const listQueryParsers = ({ countries, ageRanges }: Filters) => ({
  q: parseAsString.withDefault(""),
  country: parseAsStringLiteral(countries.map((c) => c.code)),
  age: parseAsStringLiteral(ageRanges.map((r) => r.value)),
  interests: parseAsArrayOf(parseAsString).withDefault([]),
  /** null = automatic: best match while searching, otherwise newest first. */
  sort: parseAsStringLiteral(SORT_VALUES),
  page: parseAsInteger.withDefault(1),
  size: parseAsNumberLiteral(PAGE_SIZES).withDefault(PAGE_SIZES[0]),
});

export type ListQuery = inferParserType<ReturnType<typeof listQueryParsers>>;

export const loadListQuery = (options: Filters) => createLoader(listQueryParsers(options));

export const NO_FILTERS = { country: null, age: null, interests: null } as const;

export const countActiveFilters = (q: Pick<ListQuery, "country" | "age" | "interests">) =>
  (q.country ? 1 : 0) + (q.age ? 1 : 0) + q.interests.length;
