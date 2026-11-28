import clsx from "clsx";
import CmsButtons from "@/components/landing/CmsButtons";
import GeneralSection from "@/components/layout/GeneralSection";
import type { BlockProps } from "@/blocks/types";

/** A row of buttons on their own. */
export default function ButtonsBlock({ block, content, page }: BlockProps<"buttons">) {
  return (
    <GeneralSection page={page}>
      <div className={clsx("flex flex-wrap gap-3", block.align === "center" && "justify-center")}>
        <CmsButtons buttons={block.actions} content={content} />
      </div>
    </GeneralSection>
  );
}
