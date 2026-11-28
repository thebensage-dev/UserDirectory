"use client";

import { createContext, useContext } from "react";
import type { UserDirectoryBlock, SettingsFor, UserProfileBlock } from "@thebensage-dev/cms-client";

/** Every word of the directory's screens, from the CMS. */
export type DirectoryText = {
  /** Shared by the list and the profile: the form, dialogs and access messages (settings). */
  shared: SettingsFor<"user-directory">["directory"];
  /** The list's own wording (the user directory block), on the list page. */
  list?: UserDirectoryBlock;
  /** The profile's own wording (the user profile block), on a profile page. */
  profile?: UserProfileBlock;
  /** Where the CMS placed the directory and the profiles (the pages holding their blocks). */
  paths: DirectoryPaths;
};

/** The list page's address, and the profile page's, with an [id] segment. */
export type DirectoryPaths = { list: string; profile: string };

const DirectoryTextContext = createContext<DirectoryText | null>(null);

/** Hands the CMS's wording, read on the server, to the client components below. Nested
 *  providers add to their parent's (the layout gives `shared`, a block its own part). */
export default function DirectoryTextProvider({
  value,
  children,
}: {
  value: Partial<DirectoryText>;
  children?: React.ReactNode;
}) {
  const parent = useContext(DirectoryTextContext);
  const merged = { ...parent, ...value } as DirectoryText;
  return <DirectoryTextContext value={merged}>{children}</DirectoryTextContext>;
}

export function useDirectoryText(): DirectoryText {
  const value = useContext(DirectoryTextContext);
  if (!value) throw new Error("useDirectoryText needs a <DirectoryTextProvider> above it.");
  return value;
}

/** The list's wording; only on the list page. */
export function useListText(): UserDirectoryBlock {
  const { list } = useDirectoryText();
  if (!list) throw new Error("The directory's list wording is missing (the user directory block).");
  return list;
}

/** A user's profile address, on the page the CMS holds the profile block on. */
export function useProfileHref(): (id: number) => string {
  const { paths } = useDirectoryText();
  return (id) => paths.profile.replace("[id]", String(id));
}
