import { MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar, Highlight } from "@thebensage-dev/ui";
import { useUserOptions } from "@/hooks/useUserOptions";
import { formatLocation } from "@/lib/format";
import type { User } from "@/types";
import InterestTags from "./InterestTags";
import { fill } from "@thebensage-dev/cms-client";
import { useListText, useProfileHref } from "./DirectoryText";
import UserRowActions, { type UserActionHandlers } from "./UserRowActions";

export default function UserCards({
  users,
  terms = [],
  ...actions
}: UserActionHandlers & { users: User[]; terms?: string[] }) {
  const { countryName } = useUserOptions();
  const { results: text } = useListText();
  const profileHref = useProfileHref();
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <li key={user.id} className="group relative">
          <Link
            href={profileHref(user.id)}
            className="card flex h-full flex-col gap-3 p-5 transition hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center gap-3 pr-16">
              <Avatar name={user.fullName} />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  <Highlight text={user.fullName} terms={terms} />
                </p>
                <p className="truncate text-sm text-foreground-muted">
                  {user.jobTitle ? (
                    <Highlight text={user.jobTitle} terms={terms} />
                  ) : (
                    fill(text.yearsOld, { age: user.age })
                  )}
                </p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-foreground-muted">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">
                <Highlight text={formatLocation(user, countryName)} terms={terms} />
              </span>
              {user.jobTitle && <span className="shrink-0">· {user.age}</span>}
            </p>
            <div className="mt-auto pt-1">
              <InterestTags interests={user.interests} terms={terms} label={text.interests} />
            </div>
          </Link>
          <UserRowActions
            user={user}
            {...actions}
            className="absolute top-3 right-3 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  );
}
