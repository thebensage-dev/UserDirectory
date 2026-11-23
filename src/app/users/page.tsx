import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { SearchParams } from "nuqs/server";
import UserDirectory from "@/components/users/UserDirectory";
import { ACCESS_REQUESTED_PARAM, ACCESS_REQUESTED_VALUE } from "@/lib/access";
import { loadListQuery } from "@/lib/listQuery";
import { VIEW_COOKIE, readView } from "@/lib/preferences";
import { pageAccess } from "@/server/auth";
import { getDirectorySummary, queryUsers } from "@/server/users";

export const metadata: Metadata = { title: "Directory" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await loadListQuery(searchParams);
  const view = readView((await cookies()).get(VIEW_COOKIE)?.value);
  const accessRequested = (await searchParams)[ACCESS_REQUESTED_PARAM] === ACCESS_REQUESTED_VALUE;

  const [result, summary] = await Promise.all([queryUsers(query), getDirectorySummary()]);

  return (
    <UserDirectory
      result={result}
      summary={summary}
      initialView={view}
      access={await pageAccess()}
      accessRequested={accessRequested}
    />
  );
}
