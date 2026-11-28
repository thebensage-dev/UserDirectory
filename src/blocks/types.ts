import type { LayoutBlock } from "@thebensage-dev/cms-client";
import type {
  BlockContext as SharedContext,
  BlockProps as SharedProps,
} from "@thebensage-dev/cms-client/react";
import type { SearchParams } from "nuqs/server";
import type { Content } from "@/server/cms";

/** What this app's own blocks may need besides the shared context: the values of the page
 *  path's [name] segments (a profile's [id]) and the address's query. */
export type BlockContext = SharedContext & {
  content: Content;
  params: Record<string, string>;
  searchParams: SearchParams;
};

/** The props of the component that draws one block type. */
export type BlockProps<T extends LayoutBlock["blockType"]> = SharedProps<T, BlockContext>;
