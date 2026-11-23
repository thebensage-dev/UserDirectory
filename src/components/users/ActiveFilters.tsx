import { X } from "lucide-react";
import { countryName } from "@/lib/countries";
import { NO_FILTERS, type ListQuery } from "@/lib/listQuery";
import { AGE_RANGES } from "@/lib/userOptions";
import type { QueryPatch } from "./UserToolbar";

type Tag = { label: string; remove: Parameters<QueryPatch>[0] };

export default function ActiveFilters({
  query,
  onChange,
}: {
  query: ListQuery;
  onChange: QueryPatch;
}) {
  const tags: Tag[] = [];
  if (query.country) {
    tags.push({ label: `Country: ${countryName(query.country)}`, remove: { country: null } });
  }
  const range = AGE_RANGES.find((r) => r.value === query.age);
  if (range) tags.push({ label: `Age: ${range.label}`, remove: { age: null } });
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
          aria-label={`Remove filter ${t.label}`}
          className="filter-tag"
        >
          {t.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button type="button" onClick={() => onChange(NO_FILTERS)} className="link ml-1 text-xs">
        Clear all
      </button>
    </div>
  );
}
