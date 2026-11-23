"use client";

import { LogIn, Mail, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { ACCESS_MAILTO, signInHref, type Access } from "@/lib/access";

/**
 * Shown in the form when the server refuses a change: a signed-out visitor's, or one from someone
 * signed in without edit access. Both can fill in the form and see every check.
 */
export default function SignInRequired({ message, access }: { message: string; access: Access }) {
  const pathname = usePathname();

  return (
    <div role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm sm:col-span-2">
      <p className="font-medium text-danger-ink">{message}</p>
      <p className="mt-1 leading-relaxed text-foreground-muted">
        {access.signedIn
          ? "Everything you entered passed the checks, but your account doesn't have edit access yet. Ask for it and I'll approve it."
          : "Everything you entered passed the checks, but visitors can't save changes. I'm happy to give you temporary access to try the rest."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {access.requestAccessUrl ? (
          <a href={access.requestAccessUrl} className="btn btn-secondary">
            <UserPlus className="size-4" />
            {access.signedIn ? "Request edit access" : "Request access"}
          </a>
        ) : (
          <a href={ACCESS_MAILTO} className="btn btn-secondary">
            <Mail className="size-4" />
            Email me for access
          </a>
        )}
        {access.canSignIn && !access.signedIn && (
          <a href={signInHref(pathname)} className="btn btn-primary">
            <LogIn className="size-4" />
            Sign in
          </a>
        )}
      </div>
    </div>
  );
}
