"use client";

import { useMemo } from "react";
import { UserOptionsContext } from "@/hooks/useUserOptions";
import { countryNames, type UserOptions } from "@/lib/userOptions";

/** Hands the API's options, read by the page on the server, to the client components below. */
export default function UserOptionsProvider({
  options,
  children,
}: {
  options: UserOptions;
  children?: React.ReactNode;
}) {
  const value = useMemo(() => ({ ...options, countryName: countryNames(options) }), [options]);
  return <UserOptionsContext value={value}>{children}</UserOptionsContext>;
}
