import { longDate } from "@thebensage-dev/cms-client";
import { LegalIntro } from "@thebensage-dev/ui";
import type { BlockProps } from "@/blocks/types";

/** The top of a legal text: "Last updated" and the date, the heading and its opening paragraph. */
export default function LegalHeaderBlock({ block, page }: BlockProps<"legalHeader">) {
  return (
    <LegalIntro
      updatedLabel={block.updatedLabel}
      updated={block.updated ? longDate(block.updated) : null}
      title={block.heading || page.title}
      intro={block.intro}
    />
  );
}
