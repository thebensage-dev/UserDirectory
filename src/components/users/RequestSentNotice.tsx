"use client";

import { CircleCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Modal } from "@thebensage-dev/ui";
import { ACCESS_REQUESTED_PARAM } from "@/lib/access";

/**
 * The dialog people see when authentik's "Request access" page sends them back to
 * `/users?access=requested`. Closing it drops the parameter, so a reload doesn't show it again.
 */
export default function RequestSentNotice() {
  const [open, setOpen] = useState(true);
  const titleId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const close = () => {
    setOpen(false);
    const rest = new URLSearchParams(searchParams);
    rest.delete(ACCESS_REQUESTED_PARAM);
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <Modal open={open} onClose={close} labelledBy={titleId} size="sm">
      <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft">
          <CircleCheck className="size-7 text-primary-ink" aria-hidden />
        </span>
        <h2 id={titleId} className="mt-4 text-xl font-semibold">
          Request sent
        </h2>
        <p className="mt-2 leading-relaxed text-foreground-muted">
          Thanks for asking. I&apos;ve been notified and will look at it soon. Your account already
          works across the site; once editing is approved you&apos;ll get an email, and you can make
          changes here.
        </p>
        <button type="button" onClick={close} className="btn btn-primary mt-6 w-full" autoFocus>
          Got it
        </button>
      </div>
    </Modal>
  );
}
