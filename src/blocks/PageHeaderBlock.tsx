import Link from "next/link";
import { crumbsFor } from "@thebensage-dev/cms-client";
import { PageIntro } from "@thebensage-dev/ui";
import CmsButtons from "@/components/landing/CmsButtons";
import type { BlockProps } from "@/blocks/types";

/** The top of an inner page: breadcrumbs, eyebrow, heading, intro and buttons (shared PageIntro). */
export default function PageHeaderBlock({ block, content, page }: BlockProps<"pageHeader">) {
  return (
    <PageIntro
      crumbs={block.breadcrumbs ? crumbsFor(content, page) : []}
      breadcrumbsLabel={block.breadcrumbsLabel || undefined}
      eyebrow={block.eyebrow}
      title={block.heading || page.title}
      intro={block.intro}
      linkComponent={Link}
    >
      {block.actions?.length ? <CmsButtons buttons={block.actions} content={content} /> : null}
    </PageIntro>
  );
}
