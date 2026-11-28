import { X } from "lucide-react";
import { useUserOptions } from "@/hooks/useUserOptions";
import { NO_FILTERS, type ListQuery } from "@/lib/listQuery";
import { ageRangeLabel } from "@/lib/userOptions";
import type { QueryPatch } from "./UserToolbar";
import { fill } from "@thebensage-dev/cms-client";
import { useListText } from "./DirectoryText";

type Tag = { label: string; remove: Parameters<QueryPatch>[0] };

export default function ActiveFilters({
  query,
  onChange,
}: {
  query: ListQuery;
  onChange: QueryPatch;
}) {
  const { countryName, ageRanges } = useUserOptions();
  const { filters: text } = useListText();
  const tags: Tag[] = [];
  if (query.country) {
    tags.push({
      label: fill(text.activeCountry, { value: countryName(query.country) }),
      remove: { country: null },
    });
  }
  const range = ageRanges.find((r) => r.value === query.age);
  if (range) {
    tags.push({
      label: fill(text.activeAge, { value: ageRangeLabel(range) }),
      remove: { age: null },
    });
  }
  for (const interest of query.interests) {
    const rest = query.interests.filter((i) => i !== interest);
    tags.push({ label: interest, remove: { interests: rest.length ? rest : null } });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((t) => (
        <button
          key={t.label}
          type="button"
          onClick={() => onChange(t.remove)}
          aria-label={fill(text.remove, { label: t.label })}
          className="filter-tag"
        >
          {t.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={() => onChange(NO_FILTERS)} className="link ml-1 text-xs">
        {text.clearAll}
      </button>
    </div>
  );
}
