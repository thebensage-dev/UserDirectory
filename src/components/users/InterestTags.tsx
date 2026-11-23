import clsx from "clsx";
import { normalise } from "@thebensage-dev/ui";

export default function InterestTags({
  interests,
  terms = [],
}: {
  interests: string[];
  terms?: string[];
}) {
  if (interests.length === 0) return null;
  const matches = (interest: string) => terms.some((t) => normalise(interest).includes(t));
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Interests">
      {interests.map((interest) => (
        <li
          key={interest}
          className={clsx("tag", matches(interest) && "bg-accent-soft text-foreground")}
        >
          {interest}
        </li>
      ))}
    </ul>
  );
}
