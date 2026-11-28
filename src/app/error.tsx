"use client";

import { CircleAlert } from "lucide-react";
import { EmptyState } from "@thebensage-dev/ui";
import { useDirectoryText } from "@/components/users/DirectoryText";

/** When a page can't load (the API is down). The wording is the CMS's, handed down by the
 *  layout, which still renders. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const text = useDirectoryText().shared.errorPage;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-section sm:px-6">
      <EmptyState
        headingLevel={1}
        icon={CircleAlert}
        title={text.title}
        action={
          <button type="button" onClick={reset} className="btn btn-secondary">
            {text.retry}
          </button>
        }
      >
        {text.body}
      </EmptyState>
    </main>
  );
}
