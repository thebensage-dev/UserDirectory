import { countryName } from "@/lib/countries";
import type { User } from "@/types";

export function formatLocation(user: Pick<User, "city" | "country">) {
  const country = countryName(user.country);
  return user.city ? `${user.city}, ${country}` : country;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export const pluralise = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;
