"use client";

import clsx from "clsx";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useUserOptions } from "@/hooks/useUserOptions";
import { NO_FILTERS, countActiveFilters, type ListQuery } from "@/lib/listQuery";
import { ageRangeLabel } from "@/lib/userOptions";
import type { DirectorySummary } from "@/types";
import { fill } from "@thebensage-dev/cms-client";
import { useListText } from "./DirectoryText";
import type { QueryPatch } from "./UserToolbar";

type Props = {
  summary: DirectorySummary;
  query: ListQuery;
  onChange: QueryPatch;
  resultCount: number;
};

export default function FilterMenu({ summary, query, onChange, resultCount }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const active = countActiveFilters(query);
  const { countryName, ageRanges } = useUserOptions();
  const { filters: text } = useListText();
  const ageChoices = [
    { value: null, label: text.anyAge },
    ...ageRanges.map((r) => ({ value: r.value, label: ageRangeLabel(r) })),
  ];

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggleInterest = (interest: string) => {
    const next = query.interests.includes(interest)
      ? query.interests.filter((i) => i !== interest)
      : [...query.interests, interest];
    onChange({ interests: next.length ? next : null });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className={clsx("btn btn-secondary px-3", active && "border-primary text-primary-ink")}
      >
        <SlidersHorizontal className="size-4" />
        {text.button}
        {active > 0 && <span className="count-badge">{active}</span>}
      </button>

      {open && (
        <div
          id={`${id}-panel`}
          role="dialog"
          aria-label={text.title}
          className="menu-panel left-0 sm:right-0 sm:left-auto"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-semibold">{text.title}</h2>
            {active > 0 && (
              <button type="button" onClick={() => onChange(NO_FILTERS)} className="link text-sm">
                {text.clearAll}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] space-y-5 overflow-y-auto p-4">
            <section>
              <label htmlFor={`${id}-country`} className="label">
                {text.country}
              </label>
              <select
                id={`${id}-country`}
                value={query.country ?? ""}
                onChange={(e) => onChange({ country: e.target.value || null })}
                className="input"
              >
                <option value="">{text.anyCountry}</option>
                {summary.countries.map(([code, count]) => (
                  <option key={code} value={code}>
                    {countryName(code)} ({count})
                  </option>
                ))}
              </select>
            </section>

            <section role="group" aria-labelledby={`${id}-age`}>
              <h3 id={`${id}-age`} className="label">
                {text.age}
              </h3>
              <div className="flex flex-wrap gap-2">
                {ageChoices.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    aria-pressed={query.age === r.value}
                    onClick={() => onChange({ age: r.value })}
                    className="toggle-chip"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </section>

            {summary.interests.length > 0 && (
              <section role="group" aria-labelledby={`${id}-interests`}>
                <h3 id={`${id}-interests`} className="label flex items-baseline justify-between">
                  {text.interests}
                  <span className="text-xs font-normal text-foreground-muted">{text.matchAll}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.interests.map(([interest, count]) => (
                    <button
                      key={interest}
                      type="button"
                      aria-pressed={query.interests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                      className="toggle-chip"
                    >
                      {interest}
                      <span className="text-xs opacity-60">{count}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex justify-end border-t border-border px-4 py-3">
            <button type="button" onClick={close} className="btn btn-primary w-full sm:w-auto">
              {fill(resultCount === 1 ? text.showOne : text.showMany, { count: resultCount })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
