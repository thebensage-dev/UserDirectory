import { FeatureGrid, Reveal, SectionHeading, type Feature, iconOrDot } from "@thebensage-dev/ui";
import { SECTION, type BlockProps } from "@/blocks/types";

export default function CardGridBlock({ block }: BlockProps<"cardGrid">) {
  const features: Feature[] = (block.items ?? []).map((item) => ({
    icon: iconOrDot(item.icon),
    title: item.title,
    description: item.description,
    ...(item.tags?.length ? { tags: item.tags } : {}),
  }));
  return (
    <section aria-labelledby={`${block.anchor}-title`} className={SECTION}>
      <Reveal onScroll>
        <SectionHeading
          id={`${block.anchor}-title`}
          title={block.title}
          intro={block.intro || undefined}
        />
      </Reveal>
      <FeatureGrid
        features={features}
        columns={block.columns === "2" ? 2 : 3}
        tagsLabel={block.tagsLabel || undefined}
        className="mt-content"
      />
    </section>
  );
}
