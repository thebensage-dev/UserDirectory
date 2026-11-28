import clsx from "clsx";
import { RichText, SectionHeading } from "@thebensage-dev/ui";
import GeneralSection from "@/components/layout/GeneralSection";
import type { BlockProps } from "@/blocks/types";

/** Two or three columns of text, with an optional heading above. */
export default function ColumnsBlock({ block, page }: BlockProps<"columns">) {
  const id = block.anchor || `columns-${block.id ?? "block"}`;
  return (
    <GeneralSection page={page} id={block.anchor}>
      {block.title && <SectionHeading id={`${id}-title`} title={block.title} intro={block.intro} />}
      <div
        className={clsx(
          "grid gap-stack",
          block.title && "mt-content",
          block.columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
        )}
      >
        {block.columns.map((column, i) => (
          <div key={column.id ?? i}>
            {column.heading && <h3 className="title-card">{column.heading}</h3>}
            <RichText
              data={column.body}
              className={clsx(
                "space-y-3 leading-relaxed text-foreground-muted",
                column.heading && "mt-2",
              )}
            />
          </div>
        ))}
      </div>
    </GeneralSection>
  );
}
