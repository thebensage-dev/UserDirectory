import { cookies } from "next/headers";
import DirectoryTextProvider from "@/components/users/DirectoryText";
import UserDirectory from "@/components/users/UserDirectory";
import UserOptionsProvider from "@/components/users/UserOptionsProvider";
import type { BlockProps } from "@/blocks/types";
import { ACCESS_REQUESTED_PARAM, ACCESS_REQUESTED_VALUE } from "@/lib/access";
import { loadListQuery } from "@/lib/listQuery";
import { VIEW_COOKIE, readView } from "@/lib/preferences";
import { pageAccess } from "@/server/auth";
import { getDirectorySummary, getUserOptions, queryUsers } from "@/server/users";

/**
 * The whole directory: stats, search, filters, sort, cards or table, paging, and the add, edit
 * and delete dialogs. The users come from the API, driven by the address's query (search and
 * paging run in the API); every word is the block's own (the CMS).
 */
export default async function UserDirectoryBlock({
  block,
  searchParams,
}: BlockProps<"userDirectory">) {
  const view = readView((await cookies()).get(VIEW_COOKIE)?.value);
  const accessRequested = searchParams[ACCESS_REQUESTED_PARAM] === ACCESS_REQUESTED_VALUE;
  const [options, summary, access] = await Promise.all([
    getUserOptions(),
    getDirectorySummary(),
    pageAccess(),
  ]);
  const result = await queryUsers(await loadListQuery(options)(searchParams));

  return (
    <DirectoryTextProvider value={{ list: block }}>
      <UserOptionsProvider options={options}>
        <UserDirectory
          result={result}
          summary={summary}
          initialView={view}
          access={access}
          accessRequested={accessRequested}
        />
      </UserOptionsProvider>
    </DirectoryTextProvider>
  );
}
