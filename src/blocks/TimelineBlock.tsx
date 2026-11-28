import {
  Reveal,
  SectionHeading,
  StepTimeline,
  type TimelineStep,
  iconByName,
} from "@thebensage-dev/ui";
import type { BlockProps } from "@/blocks/types";

/** Steps down a line, then the stack as tags. */
export default function TimelineBlock({ block }: BlockProps<"timeline">) {
  const steps: TimelineStep[] = block.steps.map((step) => {
    const stepIcon = iconByName(step.icon);
    return {
      title: step.title,
      description: step.description,
      ...(stepIcon ? { icon: stepIcon } : {}),
      ...(step.actor ? { actor: step.actor } : {}),
    };
  });
  return (
    <section
      id={block.anchor}
      aria-labelledby={`${block.anchor}-title`}
      className="relative mx-auto w-full max-w-5xl scroll-mt-20 px-4 pb-section sm:px-6"
    >
      <Reveal onScroll>
        <SectionHeading
          id={`${block.anchor}-title`}
          title={block.title}
          intro={block.intro || undefined}
        />
      </Reveal>
      <StepTimeline
        steps={steps}
        label={block.title}
        {...(block.showCount === false && { countLabel: false as const })}
        className="mt-content"
      />
      {block.tags?.length ? (
        <Reveal onScroll className="mt-stack flex flex-wrap gap-2">
          {block.tags.map((item) => (
            <span key={item} className="tag border border-border bg-surface px-3 py-1">
              {item}
            </span>
          ))}
        </Reveal>
      ) : null}
    </section>
  );
}
