import clsx from "clsx";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { Avatar, Highlight } from "@thebensage-dev/ui";
import { useUserOptions } from "@/hooks/useUserOptions";
import { parseSortValue, type SortColumn, type SortValue } from "@/lib/listQuery";
import type { User } from "@/types";
import CountryLabel from "./CountryLabel";
import InterestTags from "./InterestTags";
import { useListText, useProfileHref } from "./DirectoryText";
import UserRowActions, { type UserActionHandlers } from "./UserRowActions";

type SortProps = { sort?: SortValue | null; onSortChange?: (sort: SortValue) => void };

export default function UserTable({
  users,
  terms = [],
  sort,
  onSortChange,
  ...actions
}: UserActionHandlers & SortProps & { users: User[]; terms?: string[] }) {
  const { countryName } = useUserOptions();
  const { results: text } = useListText();
  const profileHref = useProfileHref();
  const header = (label: string, column: SortColumn) => (
    <SortableHeader label={label} column={column} sort={sort} onSortChange={onSortChange} />
  );

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="eyebrow border-b border-border bg-surface-muted/50">
          <tr>
            {header(text.name, "name")}
            {header(text.age, "age")}
            {header(text.country, "country")}
            <th className="px-4 py-3 font-medium">{text.interests}</th>
            <th className="px-4 py-3">
              <span className="sr-only">{text.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="transition hover:bg-surface-muted/50">
              <td className="px-4 py-3">
                <Link
                  href={profileHref(user.id)}
                  className="group flex items-center gap-3 rounded-md"
                >
                  <Avatar name={user.fullName} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-medium group-hover:text-primary">
                      <Highlight text={user.fullName} terms={terms} />
                    </span>
                    <span className="block truncate text-xs text-foreground-muted">
                      <Highlight text={user.jobTitle ?? user.email} terms={terms} />
                    </span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-foreground-muted tabular-nums">{user.age}</td>
              <td className="px-4 py-3 text-foreground-muted">
                <CountryLabel code={user.country} name={countryName(user.country)} />
              </td>
              <td className="px-4 py-3">
                <InterestTags interests={user.interests} terms={terms} label={text.interests} />
              </td>
              <td className="px-4 py-3">
                <UserRowActions user={user} {...actions} className="justify-end" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({
  label,
  column,
  sort,
  onSortChange,
}: SortProps & { label: string; column: SortColumn }) {
  if (!onSortChange) return <th className="px-4 py-3 font-medium">{label}</th>;

  const current = sort ? parseSortValue(sort) : null;
  const dir = current?.column === column ? current.dir : null;
  const Arrow = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <th
      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}
      className="px-4 py-3 font-medium"
    >
      <button
        type="button"
        onClick={() => onSortChange(`${column}-${dir === "asc" ? "desc" : "asc"}`)}
        className={clsx(
          "inline-flex items-center gap-1 rounded tracking-wide uppercase transition hover:text-foreground",
          dir && "text-foreground",
        )}
      >
        {label}
        <Arrow className={clsx("size-3.5", !dir && "opacity-40")} />
      </button>
    </th>
  );
}
