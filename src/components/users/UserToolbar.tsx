"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { debounce, type Options } from "nuqs";
import { SearchBox, SegmentedControl, type SegmentOption } from "@thebensage-dev/ui";
import { SORT_FIELDS, type ListQuery, type SortValue } from "@/lib/listQuery";
import type { View } from "@/lib/preferences";
import type { DirectorySummary } from "@/types";
import ActiveFilters from "./ActiveFilters";
import { useListText } from "./DirectoryText";
import FilterMenu from "./FilterMenu";

export type QueryPatch = (
  patch: { [K in keyof ListQuery]?: ListQuery[K] | null },
  options?: Options,
) => void;

const RELEVANCE = "relevance";
const SEARCH_UPDATE = { limitUrlUpdates: debounce(250) };

export default function UserToolbar({
  summary,
  query,
  onChange,
  resultCount,
  view,
  onViewChange,
  searchRef,
}: {
  summary: DirectorySummary;
  query: ListQuery;
  onChange: QueryPatch;
  resultCount: number;
  view: View;
  onViewChange: (view: View) => void;
  searchRef: React.Ref<HTMLInputElement>;
}) {
  const { toolbar: text, sorts } = useListText();
  const viewOptions: SegmentOption<View>[] = [
    { value: "cards", label: text.cards, icon: LayoutGrid },
    { value: "table", label: text.table, icon: Table2 },
  ];
  const searching = query.q.trim() !== "";
  const sortValue = query.sort ?? (searching ? RELEVANCE : "id-desc");

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBox
          ref={searchRef}
          value={query.q}
          onChange={(q) => onChange({ q: q || null }, SEARCH_UPDATE)}
          placeholder={text.searchPlaceholder}
          labels={{ search: text.search, clear: text.clearSearch }}
          className="flex-1"
        />
        <div className="flex gap-2">
          <FilterMenu
            summary={summary}
            query={query}
            onChange={onChange}
            resultCount={resultCount}
          />
          <select
            value={sortValue}
            onChange={(e) =>
              onChange({
                sort: e.target.value === RELEVANCE ? null : (e.target.value as SortValue),
              })
            }
            aria-label={text.sort}
            className="input w-auto min-w-0 flex-1 sm:flex-none"
          >
            {searching && <option value={RELEVANCE}>{text.bestMatch}</option>}
            {(Object.entries(SORT_FIELDS) as [SortValue, keyof typeof sorts][]).map(
              ([value, field]) => (
                <option key={value} value={value}>
                  {sorts[field] as string}
                </option>
              ),
            )}
          </select>
          <SegmentedControl
            label={text.layout}
            options={viewOptions}
            value={view}
            onChange={onViewChange}
          />
        </div>
      </div>

      <ActiveFilters query={query} onChange={onChange} />
    </div>
  );
}
