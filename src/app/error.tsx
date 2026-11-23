"use client";

import { CircleAlert } from "lucide-react";
import { EmptyState } from "@thebensage-dev/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={CircleAlert}
        title="Something went wrong"
        action={
          <button type="button" onClick={reset} className="btn btn-secondary">
            Try again
          </button>
        }
      >
        The page couldn&apos;t be loaded. Check the server is running and try again.
      </EmptyState>
    </main>
  );
}
