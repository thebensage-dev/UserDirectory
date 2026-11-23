import { Briefcase, Calendar, CalendarClock, ChevronLeft, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@thebensage-dev/ui";
import CountryLabel from "@/components/users/CountryLabel";
import InterestTags from "@/components/users/InterestTags";
import UserProfileActions from "@/components/users/UserProfileActions";
import { formatDate } from "@/lib/format";
import { pageAccess } from "@/server/auth";
import { getUser } from "@/server/users";

type Props = { params: Promise<{ id: string }> };

async function loadUser({ params }: Props) {
  const user = await getUser(Number((await params).id));
  if (!user) notFound();
  return user;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: (await loadUser(props)).fullName };
}

export default async function UserPage(props: Props) {
  const user = await loadUser(props);
  const access = await pageAccess();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-foreground-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All users
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
              <h1 className="text-2xl font-semibold tracking-tight">{user.fullName}</h1>
              <p className="mt-0.5 text-foreground-muted">
                {[user.jobTitle, `${user.age} years old`].filter(Boolean).join(" · ")}
              </p>
            </div>
            <UserProfileActions user={user} access={access} />
          </div>

          {user.bio && <p className="mt-6 max-w-prose leading-relaxed">{user.bio}</p>}

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-2">
            <Detail icon={Mail} label="Email">
              {user.email && (
                <a href={`mailto:${user.email}`} className="link break-all">
                  {user.email}
                </a>
              )}
            </Detail>
            <Detail icon={Phone} label="Phone">
              {user.phone && (
                <a href={`tel:${user.phone.replace(/[^\d+]/g, "")}`} className="link">
                  {user.phone}
                </a>
              )}
            </Detail>
            <Detail icon={MapPin} label="Location">
              {user.city && `${user.city}, `}
              <CountryLabel code={user.country} />
            </Detail>
            <Detail icon={Briefcase} label="Job title">
              {user.jobTitle}
            </Detail>
            <Detail icon={Calendar} label="Member since">
              {formatDate(user.createdAt)}
            </Detail>
            <Detail icon={CalendarClock} label="Last updated">
              {formatDate(user.updatedAt)}
            </Detail>
          </dl>

          <h2 className="eyebrow mt-8">Interests</h2>
          <div className="mt-2">
            <InterestTags interests={user.interests} />
          </div>
        </div>
      </article>
    </main>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
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
        {empty ? "Not provided" : children}
      </dd>
    </div>
  );
}
