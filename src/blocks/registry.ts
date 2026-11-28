import type { ComponentType } from "react";
import type { LayoutBlock } from "@thebensage-dev/cms-client";
import CallToActionBlock from "@/blocks/CallToActionBlock";
import CardGridBlock from "@/blocks/CardGridBlock";
import DirectoryHeroBlock from "@/blocks/DirectoryHeroBlock";
import LegalHeaderBlock from "@/blocks/LegalHeaderBlock";
import PageHeaderBlock from "@/blocks/PageHeaderBlock";
import TextSectionBlock from "@/blocks/TextSectionBlock";
import TimelineBlock from "@/blocks/TimelineBlock";
import UserDirectoryBlock from "@/blocks/UserDirectoryBlock";
import UserProfileBlock from "@/blocks/UserProfileBlock";
import ButtonsBlock from "@/blocks/ButtonsBlock";
import ColumnsBlock from "@/blocks/ColumnsBlock";
import ContentBlock from "@/blocks/ContentBlock";
import ImageBlock from "@/blocks/ImageBlock";
import ImageTextBlock from "@/blocks/ImageTextBlock";
import type { BlockProps } from "@/blocks/types";

type BlockType = LayoutBlock["blockType"];

/**
 * The component that draws each block type this app renders (the CMS's BLOCKS_BY_SITE for
 * "user-directory"). The main site's block types are left out and render nothing.
 */
export const BLOCKS: { [T in BlockType]?: ComponentType<BlockProps<T>> } = {
  directoryHero: DirectoryHeroBlock,
  cardGrid: CardGridBlock,
  timeline: TimelineBlock,
  callToAction: CallToActionBlock,
  pageHeader: PageHeaderBlock,
  content: ContentBlock,
  image: ImageBlock,
  imageText: ImageTextBlock,
  columns: ColumnsBlock,
  buttons: ButtonsBlock,
  legalHeader: LegalHeaderBlock,
  textSection: TextSectionBlock,
  userDirectory: UserDirectoryBlock,
  userProfile: UserProfileBlock,
};
