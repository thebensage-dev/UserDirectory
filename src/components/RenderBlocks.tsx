import type { ComponentType } from "react";
import type { LayoutBlock } from "@thebensage-dev/cms-client";
import { BLOCKS } from "@/blocks/registry";
import type { BlockContext } from "@/blocks/types";

type AnyBlock = ComponentType<{ block: LayoutBlock } & BlockContext>;

/** A page's blocks in order, each drawn by its component (src/blocks/registry.ts). */
export default function RenderBlocks({
  blocks,
  ctx,
}: {
  blocks: LayoutBlock[] | null | undefined;
  ctx: BlockContext;
}) {
  return (blocks ?? []).map((block, i) => {
    const Component = BLOCKS[block.blockType] as AnyBlock | undefined;
    return Component ? <Component key={block.id ?? i} block={block} {...ctx} /> : null;
  });
}
