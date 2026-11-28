import { createContext, useContext } from "react";
import type { UserOptions } from "@/lib/userOptions";

export type UserOptionsValue = UserOptions & { countryName: (code: string) => string };

export const UserOptionsContext = createContext<UserOptionsValue | null>(null);

/** The API's options (see UserOptionsProvider), with a country-name lookup. */
export function useUserOptions(): UserOptionsValue {
  const value = useContext(UserOptionsContext);
  if (!value) throw new Error("useUserOptions needs a <UserOptionsProvider> above it.");
  return value;
}
