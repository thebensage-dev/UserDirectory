import { createElement, type ReactNode } from "react";
import type { UserDirectoryBlock, UserProfileBlock } from "@thebensage-dev/cms-client";
import DirectoryTextProvider, { type DirectoryText } from "@/components/users/DirectoryText";
import UserOptionsProvider from "@/components/users/UserOptionsProvider";
import snapshot from "@/content/cms-snapshot.json";
import type { Content } from "@/server/cms";
import { loadListQuery } from "@/lib/listQuery";
import type { UserOptions } from "@/lib/userOptions";
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

/** A shortened `GET /users/options`, sorted by name as the API sends it. */
export const OPTIONS: UserOptions = {
  countries: [
    { code: "AU", name: "Australia" },
    { code: "CA", name: "Canada" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Germany" },
    { code: "IN", name: "India" },
    { code: "IE", name: "Ireland" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
  ],
  interests: ["Art", "Books", "Coding", "Cooking", "Fashion", "Fitness", "Music", "Sports"],
  maxInterests: 5,
  ageRanges: [
    { value: "18-24", min: 18, max: 24 },
    { value: "25-34", min: 25, max: 34 },
    { value: "35-44", min: 35, max: 44 },
    { value: "45-54", min: 45, max: 54 },
    { value: "55+", min: 55, max: null },
  ],
  sorts: ["id-desc", "id-asc", "name-asc", "name-desc", "age-asc", "age-desc"],
};

/** The CMS content the tests see: the snapshot (as published). */
export const CONTENT = snapshot as unknown as Content;

const blockOf = <T>(type: string) =>
  CONTENT.pages.flatMap((page) => page.layout ?? []).find((block) => block.blockType === type) as T;

/** Every word of the directory, as the layout and the blocks hand it down. */
export const TEXT: DirectoryText = {
  shared: CONTENT.settings.directory,
  list: blockOf<UserDirectoryBlock>("userDirectory"),
  profile: blockOf<UserProfileBlock>("userProfile"),
  paths: { list: "/users", profile: "/users/[id]" },
};

/** `render(ui, withOptions)` for components that read the options and the CMS wording from
 *  context. */
export const withOptions = {
  wrapper: ({ children }: { children: ReactNode }) =>
    createElement(
      DirectoryTextProvider,
      { value: TEXT },
      createElement(UserOptionsProvider, { options: OPTIONS }, children),
    ),
};

export const DEFAULT_LIST_QUERY = loadListQuery(OPTIONS)(new URLSearchParams());

export const makeSummary = (overrides: Partial<DirectorySummary> = {}): DirectorySummary => ({
  users: 2,
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
