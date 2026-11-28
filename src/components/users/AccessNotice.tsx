"use client";

import { Info } from "lucide-react";
import { accessMailto, signInHref, type Access } from "@/lib/access";
import { useDirectoryText } from "./DirectoryText";
import RequestSentNotice from "./RequestSentNotice";
import Template from "./Template";

/**
 * The banner on the directory for anyone who can't edit (visitors, and people signed in without
 * edit access yet), plus the "Request sent" dialog when they come back from authentik's "Request
 * access" page. Its words are the CMS's (User Directory settings, Directory tab, access).
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
      {access.signedIn ? <MemberNotice access={access} /> : <VisitorNotice access={access} />}
    </>
  );
}

function VisitorNotice({ access }: { access: Access }) {
  const { shared } = useDirectoryText();
  const text = shared.access;
  const email = (
    <a href={accessMailto(shared)} className="link">
      {text.emailMe}
    </a>
  );
  return (
    <Note>
      <span className="font-medium text-foreground">{text.visitorLead}</span> {text.visitorBody}{" "}
      {access.requestAccessUrl ? (
        <Template
          text={text.visitorWithRequest}
          values={{
            request: (
              <a href={access.requestAccessUrl} className="link">
                {text.requestAccess}
              </a>
            ),
            email,
          }}
        />
      ) : (
        <Template text={text.visitorWithoutRequest} values={{ email }} />
      )}
    </Note>
  );
}

/** Signed in (perhaps from another app, through single sign-on) but not an editor yet. */
function MemberNotice({ access }: { access: Access }) {
  const { shared, paths } = useDirectoryText();
  const text = shared.access;
  return (
    <Note>
      <span className="font-medium text-foreground">{text.memberLead}</span> {text.memberBody}{" "}
      {access.requestAccessUrl && (
        <>
          <Template
            text={text.memberRequest}
            values={{
              request: (
                <a href={access.requestAccessUrl} className="link">
                  {text.requestEditAccess}
                </a>
              ),
            }}
          />{" "}
        </>
      )}
      <Template
        text={text.memberRefresh}
        values={{
          refresh: (
            <a href={signInHref(paths.list)} className="link">
              {text.refreshLink}
            </a>
          ),
        }}
      />
    </Note>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="note"
      className="card mt-6 flex items-start gap-3 border-primary/30 bg-primary-soft/40 p-4 text-sm"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden />
      <p className="leading-relaxed text-foreground-muted">{children}</p>
    </div>
  );
}
