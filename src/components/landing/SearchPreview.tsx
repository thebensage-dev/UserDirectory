import clsx from "clsx";
import { Search } from "lucide-react";
import { Avatar } from "@thebensage-dev/ui";
import type { Block } from "@thebensage-dev/cms-client";

/** The animated example search beside the landing page's headline; its query and rows are the
 *  CMS's (the directory hero block's search preview). */
export default function SearchPreview({ preview }: { preview: Block<"directoryHero">["preview"] }) {
  return (
    // A looping illustration of the search, not content: hidden from screen readers.
    <div className="float relative" aria-hidden="true">
      <div className="card overflow-hidden shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          {["bg-secondary", "bg-accent", "bg-primary"].map((c) => (
            <span key={c} className={clsx("size-2.5 rounded-full", c)} />
          ))}
        </div>
        <div className="space-y-3 p-4">
          <div className="input flex items-center gap-2 text-foreground">
            <Search className="size-4 shrink-0 text-foreground-muted" />
            <span
              className="typewriter"
              style={{ "--chars": preview.query.length } as React.CSSProperties}
            >
              {preview.query}
            </span>
          </div>
          <ul className="space-y-1">
            {(preview.rows ?? []).map((row, i) => (
              <li key={row.id ?? i} className={clsx("preview-row", row.match && "is-match")}>
                <Avatar name={row.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{row.name}</span>
                  <span className="block truncate text-xs text-foreground-muted">{row.job}</span>
                </span>
                <span className="code-badge">{row.country}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
