import { Info } from "lucide-react";
import { ACCESS_MAILTO, signInHref, type Access } from "@/lib/access";
import RequestSentNotice from "./RequestSentNotice";

/**
 * The banner on the directory for anyone who can't edit (visitors, and people signed in without
 * edit access yet), plus the "Request sent" dialog when they come back from authentik's "Request
 * access" page.
 */
export default function AccessNotice({
  access,
  requested = false,
}: {
  access: Access;
  requested?: boolean;
}) {
  return (
    <>
      {requested && <RequestSentNotice />}
      <VisitorNotice access={access} />
    </>
  );
}

function VisitorNotice({ access }: { access: Access }) {
  if (access.signedIn) return <MemberNotice access={access} />;
  return (
    <div
      role="note"
      className="card mt-6 flex items-start gap-3 border-primary/30 bg-primary-soft/40 p-4 text-sm"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden />
      <p className="leading-relaxed text-foreground-muted">
        <span className="font-medium text-foreground">You&apos;re browsing as a visitor.</span> Try
        adding or editing someone to see the form checks at work; saving changes needs an account.{" "}
        {access.requestAccessUrl ? (
          <>
            <a href={access.requestAccessUrl} className="link">
              Request access
            </a>{" "}
            and I&apos;ll approve it, or{" "}
            <a href={ACCESS_MAILTO} className="link">
              email me
            </a>
            .
          </>
        ) : (
          <>
            I&apos;m happy to create one and give you temporary access:{" "}
            <a href={ACCESS_MAILTO} className="link">
              email me
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}

/** Signed in (perhaps from another app, through single sign-on) but not an editor yet. */
function MemberNotice({ access }: { access: Access }) {
  return (
    <div
      role="note"
      className="card mt-6 flex items-start gap-3 border-primary/30 bg-primary-soft/40 p-4 text-sm"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden />
      <p className="leading-relaxed text-foreground-muted">
        <span className="font-medium text-foreground">
          You&apos;re signed in, but can&apos;t edit yet.
        </span>{" "}
        Try adding or editing someone to see the form checks at work.{" "}
        {access.requestAccessUrl && (
          <>
            <a href={access.requestAccessUrl} className="link">
              Request edit access
            </a>{" "}
            and I&apos;ll approve it.{" "}
          </>
        )}
        Already approved?{" "}
        <a href={signInHref("/users")} className="link">
          Refresh your sign-in
        </a>
        .
      </p>
    </div>
  );
}
