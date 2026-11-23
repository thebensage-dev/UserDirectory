import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";
import { COUNTRY_CODES } from "@/lib/countries";
import { AGE_RANGES } from "@/lib/userOptions";

export const SORT_LABELS = {
  "id-desc": "Recently added",
  "id-asc": "First added",
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  "age-asc": "Age (youngest)",
  "age-desc": "Age (oldest)",
  "country-asc": "Country (A–Z)",
  "country-desc": "Country (Z–A)",
} as const;

export type SortValue = keyof typeof SORT_LABELS;
export type SortColumn = "id" | "name" | "age" | "country";
type SortDir = "asc" | "desc";

const SORT_VALUES = Object.keys(SORT_LABELS) as SortValue[];

export const parseSortValue = (value: SortValue) => {
  const [column, dir] = value.split("-") as [SortColumn, SortDir];
  return { column, dir };
};

export const PAGE_SIZES = [12, 24, 48] as const;

export const listQueryParsers = {
  q: parseAsString.withDefault(""),
  country: parseAsStringLiteral(COUNTRY_CODES),
  age: parseAsStringLiteral(AGE_RANGES.map((r) => r.value)),
  interests: parseAsArrayOf(parseAsString).withDefault([]),
  /** null = automatic: best match while searching, otherwise newest first. */
  sort: parseAsStringLiteral(SORT_VALUES),
  page: parseAsInteger.withDefault(1),
  size: parseAsNumberLiteral(PAGE_SIZES).withDefault(PAGE_SIZES[0]),
};

export type ListQuery = inferParserType<typeof listQueryParsers>;

export const loadListQuery = createLoader(listQueryParsers);

export const NO_FILTERS = { country: null, age: null, interests: null } as const;

export const countActiveFilters = (q: Pick<ListQuery, "country" | "age" | "interests">) =>
  (q.country ? 1 : 0) + (q.age ? 1 : 0) + q.interests.length;
