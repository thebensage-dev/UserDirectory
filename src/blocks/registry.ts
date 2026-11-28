import { GENERAL_BLOCKS, type BlockRegistry } from "@thebensage-dev/cms-client/react";
import DirectoryHeroBlock from "@/blocks/DirectoryHeroBlock";
import UserDirectoryBlock from "@/blocks/UserDirectoryBlock";
import UserProfileBlock from "@/blocks/UserProfileBlock";
import type { BlockContext } from "@/blocks/types";

/**
 * The component that draws each block type this app renders (the CMS's BLOCKS_BY_SITE for
 * "user-directory"): the general blocks from the client package, then this app's own.
 */
export const BLOCKS: BlockRegistry<BlockContext> = {
  ...GENERAL_BLOCKS,
  directoryHero: DirectoryHeroBlock,
  userDirectory: UserDirectoryBlock,
  userProfile: UserProfileBlock,
};
