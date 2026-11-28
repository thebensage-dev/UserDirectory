import { Briefcase, Calendar, CalendarClock, ChevronLeft, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fill } from "@thebensage-dev/cms-client";
import { Avatar } from "@thebensage-dev/ui";
import CountryLabel from "@/components/users/CountryLabel";
import DirectoryTextProvider from "@/components/users/DirectoryText";
import InterestTags from "@/components/users/InterestTags";
import UserProfileActions from "@/components/users/UserProfileActions";
import type { BlockProps } from "@/blocks/types";
import { formatDate } from "@/lib/format";
import { countryNames } from "@/lib/userOptions";
import { pageAccess } from "@/server/auth";
import { directoryPaths } from "@/server/cms";
import { getUser, getUserOptions } from "@/server/users";

/** One user's profile card, for the user in the page address's [id] (from the API), with the
 *  edit and delete buttons. Its labels are the block's own (the CMS). */
export default async function UserProfileBlock({
  block,
  content,
  params,
}: BlockProps<"userProfile">) {
  const user = await getUser(Number(params.id));
  if (!user) notFound();
  const [options, access] = await Promise.all([getUserOptions(), pageAccess()]);
  const text = block.labels;

  return (
    <DirectoryTextProvider value={{ profile: block }}>
      <Link
        href={directoryPaths(content).list}
        className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-foreground-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {text.back}
      </Link>

      <article className="card mt-6 overflow-hidden">
        <div className="relative h-28 bg-primary-soft">
          <div aria-hidden className="dot-grid absolute inset-0" />
          <div aria-hidden className="brand-stripe absolute inset-x-0 top-0" />
        </div>

        <div className="px-6 pb-8">
          {/* Opaque backing: the avatar colour is translucent. "relative" lifts it above the
              banner, which is positioned and would otherwise paint over it. */}
          <div className="relative -mt-10 w-fit rounded-full bg-surface ring-4 ring-surface">
            <Avatar name={user.fullName} size="lg" />
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="title-section">{user.fullName}</h1>
              <p className="mt-0.5 text-foreground-muted">
                {[user.jobTitle, fill(text.yearsOld, { age: user.age })]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <UserProfileActions user={user} access={access} options={options} />
          </div>

          {user.bio && <p className="mt-6 max-w-prose leading-relaxed">{user.bio}</p>}

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-2">
            <Detail icon={Mail} label={text.email} emptyText={text.notProvided}>
              {user.email && (
                <a href={`mailto:${user.email}`} className="link break-all">
                  {user.email}
                </a>
              )}
            </Detail>
            <Detail icon={Phone} label={text.phone} emptyText={text.notProvided}>
              {user.phone && (
                <a href={`tel:${user.phone.replace(/[^\d+]/g, "")}`} className="link">
                  {user.phone}
                </a>
              )}
            </Detail>
            <Detail icon={MapPin} label={text.location} emptyText={text.notProvided}>
              {user.city && `${user.city}, `}
              <CountryLabel code={user.country} name={countryNames(options)(user.country)} />
            </Detail>
            <Detail icon={Briefcase} label={text.jobTitle} emptyText={text.notProvided}>
              {user.jobTitle}
            </Detail>
            <Detail icon={Calendar} label={text.memberSince} emptyText={text.notProvided}>
              {formatDate(user.createdAt)}
            </Detail>
            <Detail icon={CalendarClock} label={text.lastUpdated} emptyText={text.notProvided}>
              {formatDate(user.updatedAt)}
            </Detail>
          </dl>

          <h2 className="eyebrow mt-8">{text.interests}</h2>
          <div className="mt-2">
            <InterestTags interests={user.interests} label={text.interests} />
          </div>
        </div>
      </article>
    </DirectoryTextProvider>
  );
}

function Detail({
  icon: Icon,
  label,
  emptyText,
  children,
}: {
  icon: LucideIcon;
  label: string;
  /** Shown when there's nothing to show (the CMS's "Not provided"). */
  emptyText: string;
  children: React.ReactNode;
}) {
  const empty = children == null || children === "" || children === false;
  return (
    // dl > div > dt + dd only (valid HTML); the icon sits inside the dt, spanning both rows.
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3">
      <dt className="contents">
        <Icon className="row-span-2 mt-0.5 size-5 text-foreground-muted" aria-hidden />
        <span className="eyebrow">{label}</span>
      </dt>
      <dd className={clsx("col-start-2 mt-0.5", empty && "text-foreground-muted")}>
        {empty ? emptyText : children}
      </dd>
    </div>
  );
}
