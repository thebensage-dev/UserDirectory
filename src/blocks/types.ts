import type { Block, LayoutBlock, Page } from "@thebensage-dev/cms-client";
import type { SearchParams } from "nuqs/server";
import type { Content } from "@/server/cms";

/** What every block gets besides its own fields: the site's content, the page it's on, the
 *  values of the page path's [name] segments (a profile's [id]) and the address's query. */
export type BlockContext = {
  content: Content;
  page: Page;
  params: Record<string, string>;
  searchParams: SearchParams;
};

/** The props of the component that draws one block type. */
export type BlockProps<T extends LayoutBlock["blockType"]> = { block: Block<T> } & BlockContext;

/** The landing page's sections share this width and bottom spacing. */
export const SECTION = "relative mx-auto w-full max-w-5xl px-4 pb-section sm:px-6";
