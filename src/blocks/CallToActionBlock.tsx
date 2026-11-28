import { Reveal } from "@thebensage-dev/ui";
import CmsButtons from "@/components/landing/CmsButtons";
import { SECTION, type BlockProps } from "@/blocks/types";

/** A wide card with a heading, a sentence and buttons. */
export default function CallToActionBlock({ block, content }: BlockProps<"callToAction">) {
  return (
    <section className={SECTION}>
      <Reveal
        onScroll
        className="card brand-wash flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <span aria-hidden className="brand-rule mb-4" />
          <h2 className="title-card text-xl">{block.title}</h2>
          {block.body && <p className="mt-1 text-foreground-muted">{block.body}</p>}
        </div>
        <CmsButtons buttons={block.actions} content={content} />
      </Reveal>
    </section>
  );
}
