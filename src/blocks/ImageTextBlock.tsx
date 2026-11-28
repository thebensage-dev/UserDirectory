import { mediaImage } from "@thebensage-dev/cms-client";
import { Figure, MediaText, RichText } from "@thebensage-dev/ui";
import CmsButtons from "@/components/landing/CmsButtons";
import GeneralSection from "@/components/layout/GeneralSection";
import type { BlockProps } from "@/blocks/types";
import { cmsPublicUrl } from "@/server/cms";

/** An uploaded image beside a heading, formatted text and buttons. */
export default function ImageTextBlock({ block, content, page }: BlockProps<"imageText">) {
  const image = mediaImage(content, block.image, cmsPublicUrl());
  return (
    <GeneralSection page={page} id={block.anchor}>
      <MediaText media={image && <Figure {...image} />} mediaSide={block.imageSide ?? "left"}>
        <Heading eyebrow={block.eyebrow} heading={block.heading} />
        <RichText
          data={block.body}
          className="mt-content space-y-4 leading-relaxed text-foreground-muted"
        />
        {block.actions?.length ? (
          <div className="mt-content flex flex-wrap gap-3">
            <CmsButtons buttons={block.actions} content={content} />
          </div>
        ) : null}
      </MediaText>
    </GeneralSection>
  );
}

function Heading({ eyebrow, heading }: { eyebrow?: string | null; heading?: string | null }) {
  return (
    <>
      {eyebrow && <p className="eyebrow tone-secondary mb-eyebrow">{eyebrow}</p>}
      {heading && <h2 className="title-section">{heading}</h2>}
    </>
  );
}
