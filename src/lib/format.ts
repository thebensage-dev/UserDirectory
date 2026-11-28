import type { User } from "@/types";

export const formatLocation = (
  user: Pick<User, "city" | "country">,
  countryName: (code: string) => string,
) => [user.city, countryName(user.country)].filter(Boolean).join(", ");

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
