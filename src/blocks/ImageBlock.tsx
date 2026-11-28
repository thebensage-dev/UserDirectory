import { mediaImage } from "@thebensage-dev/cms-client";
import { Figure } from "@thebensage-dev/ui";
import GeneralSection from "@/components/layout/GeneralSection";
import type { BlockProps } from "@/blocks/types";
import { cmsPublicUrl } from "@/server/cms";

/** One uploaded image with its caption. Nothing while the image is missing. */
export default function ImageBlock({ block, content, page }: BlockProps<"image">) {
  const image = mediaImage(content, block.image, cmsPublicUrl());
  if (!image) return null;
  return (
    <GeneralSection page={page}>
      <Figure {...image} caption={block.caption} small={block.size === "small"} />
    </GeneralSection>
  );
}
