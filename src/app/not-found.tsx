import { UserRoundX } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { EmptyState } from "@thebensage-dev/ui";
import { directoryPaths, getContent } from "@/server/cms";

// The wording comes from the CMS (User Directory settings, Page not found tab).
export default async function NotFound() {
  await connection(); // The wording comes from the CMS at request time.
  const content = await getContent();
  const { notFound } = content.settings;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-section sm:px-6">
      <EmptyState
        headingLevel={1}
        icon={UserRoundX}
        title={notFound.title}
        action={
          <Link href={directoryPaths(content).list} className="btn btn-secondary">
            {notFound.back}
          </Link>
        }
      >
        {notFound.body}
      </EmptyState>
    </main>
  );
}
