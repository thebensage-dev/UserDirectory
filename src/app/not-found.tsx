import { UserRoundX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@thebensage-dev/ui";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={UserRoundX}
        title="Not found"
        action={
          <Link href="/users" className="btn btn-secondary">
            Back to all users
          </Link>
        }
      >
        That user may have been deleted, or the link is wrong.
      </EmptyState>
    </main>
  );
}
