import { loadListQuery } from "@/lib/listQuery";
import type { DirectorySummary, User } from "@/types";

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    fullName: "Alice Smith",
    email: "alice@example.com",
    phone: null,
    age: 28,
    country: "GB",
    city: null,
    jobTitle: null,
    bio: null,
    interests: ["Sports", "Music"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export const DEFAULT_LIST_QUERY = loadListQuery(new URLSearchParams());

export const makeSummary = (overrides: Partial<DirectorySummary> = {}): DirectorySummary => ({
  people: 2,
  averageAge: 30,
  countries: [
    ["GB", 1],
    ["US", 1],
  ],
  interests: [
    ["Coding", 2],
    ["Music", 1],
  ],
  ...overrides,
});
