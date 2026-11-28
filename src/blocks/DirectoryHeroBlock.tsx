import { createElement } from "react";
import { BrandBlobs, Reveal, iconByName } from "@thebensage-dev/ui";
import CmsButtons from "@/components/landing/CmsButtons";
import DirectorySummary from "@/components/landing/DirectorySummary";
import SearchPreview from "@/components/landing/SearchPreview";
import type { BlockProps } from "@/blocks/types";

/** The landing page's opening: tag, headline (part of it in the gradient), intro, buttons, the
 *  live counts and the animated search preview. */
export default function DirectoryHeroBlock({ block, content }: BlockProps<"directoryHero">) {
  const tagIcon = iconByName(block.tagIcon);
  const [start, end] = block.highlight ? block.headline.split(block.highlight) : [block.headline];
  return (
    <section className="relative isolate mx-auto grid w-full max-w-5xl items-center gap-stack px-4 pt-16 pb-section sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
      <BrandBlobs />
      <div>
        <Reveal>
          <span className="tag tag-tone tone-accent inline-flex items-center gap-1.5">
            {tagIcon && createElement(tagIcon, { className: "size-3.5" })}
            {block.tag}
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="title-display mt-5">
            {end === undefined ? (
              block.headline
            ) : (
              <>
                {start}
                <span className="gradient-text">{block.highlight}</span>
                {end}
              </>
            )}
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-5 max-w-xl text-lg text-foreground-muted">{block.intro}</p>
        </Reveal>
        <Reveal delay={300} className="mt-content flex flex-wrap gap-3">
          <CmsButtons buttons={block.actions} content={content} nudge />
        </Reveal>
        {block.summary.show && <DirectorySummary labels={block.summary} />}
      </div>

      <Reveal delay={250}>
        <SearchPreview preview={block.preview} />
      </Reveal>
    </section>
  );
}
