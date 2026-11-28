"use client";

import { useListText } from "./DirectoryText";
import clsx from "clsx";
import { toneAt, toneClass } from "@thebensage-dev/ui";
import type { DirectorySummary } from "@/types";

export default function UserStats({ summary }: { summary: DirectorySummary }) {
  const { stats: text } = useListText();
  if (summary.users === 0) return null;

  const stats = [
    { label: text.users, value: summary.users },
    { label: text.averageAge, value: summary.averageAge },
    { label: text.countries, value: summary.countries.length },
    { label: text.topInterest, value: summary.interests[0]?.[0] ?? "—" },
  ];

  return (
    <dl className="mt-content grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.label} className={clsx("card tone-card px-4 pt-4 pb-3", toneClass(toneAt(i)))}>
          <dt className="eyebrow">{s.label}</dt>
          <dd className="mt-1 truncate text-2xl font-semibold tracking-tight">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
