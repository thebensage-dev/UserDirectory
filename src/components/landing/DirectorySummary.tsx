import { Reveal } from "@thebensage-dev/ui";
import type { Block } from "@thebensage-dev/cms-client";
import { getDirectorySummary } from "@/server/users";

/** "12 users · 8 countries · 20 interests", counted by the API (left out while it's empty). The
 *  words come from the CMS. */
export default async function DirectorySummary({
  labels,
}: {
  labels: Block<"directoryHero">["summary"];
}) {
  const summary = await getDirectorySummary();
  if (summary.users <= 0) return null;
  return (
    <Reveal delay={400}>
      <p className="mt-6 text-sm text-foreground-muted">
        <strong className="text-foreground">{summary.users}</strong> {labels.users} ·{" "}
        <strong className="text-foreground">{summary.countries.length}</strong> {labels.countries} ·{" "}
        <strong className="text-foreground">{summary.interests.length}</strong> {labels.interests}
      </p>
    </Reveal>
  );
}
