import clsx from "clsx";
import { Search } from "lucide-react";
import { Avatar } from "@thebensage-dev/ui";

const PEOPLE = [
  { name: "Amara Okafor", job: "Frontend developer", country: "GB" },
  { name: "Siobhán Murphy", job: "Marine biologist", country: "IE" },
  { name: "Yuki Tanaka", job: "Illustrator", country: "JP" },
  { name: "Lukas Becker", job: "Product designer", country: "DE" },
];
const QUERY = "siobhan";

export default function SearchPreview() {
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
            <span className="typewriter" style={{ "--chars": QUERY.length } as React.CSSProperties}>
              {QUERY}
            </span>
          </div>
          <ul className="space-y-1">
            {PEOPLE.map((p) => (
              <li
                key={p.name}
                className={clsx("preview-row", p.name.startsWith("Sio") && "is-match")}
              >
                <Avatar name={p.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-foreground-muted">{p.job}</span>
                </span>
                <span className="code-badge">{p.country}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
