import { RichText } from "@thebensage-dev/ui";
import CmsButtons from "@/components/landing/CmsButtons";
import GeneralSection from "@/components/layout/GeneralSection";
import type { BlockProps } from "@/blocks/types";

/** The general text section: eyebrow, heading, formatted text and buttons. */
export default function ContentBlock({ block, content, page }: BlockProps<"content">) {
  return (
    <GeneralSection page={page} id={block.anchor} className="max-w-3xl">
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
