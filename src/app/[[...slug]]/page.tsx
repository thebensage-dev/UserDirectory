import clsx from "clsx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { SearchParams } from "nuqs/server";
import type { Page } from "@thebensage-dev/cms-client";
import RenderBlocks from "@/components/RenderBlocks";
import { getContent, matchPage } from "@/server/cms";
import { getUser } from "@/server/users";

// Every page comes from the CMS: the address picks the page (a path such as /users/[id] matches
// every profile), its layout lists the blocks, and its width and backdrop lay out the column. The
// directory and profile blocks read the users from the API.

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<SearchParams>;
};

const pathOf = async ({ params }: Props) => "/" + ((await params).slug ?? []).join("/");

/** The page's column: full width (the blocks lay themselves out), or a centred column. */
const WIDTH: Record<Page["width"], string> = {
  full: "relative overflow-hidden",
  wide: "mx-auto w-full max-w-5xl px-4 pt-8 pb-section sm:px-6",
  narrow: "mx-auto w-full max-w-3xl px-4 pt-8 pb-section sm:px-6",
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  await connection(); // The content is read per request.
  const match = matchPage(await getContent(), await pathOf(props));
  // No page: the page itself calls notFound(), which renders the 404 on the server.
  if (!match) return {};
  const { page, params } = match;
  // A profile is titled with the user's name.
  if (params.id && page.layout?.some((block) => block.blockType === "userProfile")) {
    const user = await getUser(Number(params.id));
    return user ? { title: user.fullName } : {};
  }
  const title = page.path === "/" ? undefined : page.meta?.title || page.title;
  return {
    ...(title && { title }),
    ...(page.meta?.description && { description: page.meta.description }),
  };
}

export default async function CmsPage(props: Props) {
  const content = await getContent();
  const match = matchPage(content, await pathOf(props));
  if (!match) notFound();
  const { page, params } = match;

  return (
    <main className={clsx(WIDTH[page.width], page.backdrop === "dotGrid" && "relative")}>
      {page.backdrop === "dotGrid" && (
        <div aria-hidden className="dot-grid absolute inset-x-0 top-0 h-[36rem]" />
      )}
      <RenderBlocks
        blocks={page.layout}
        ctx={{ content, page, params, searchParams: await props.searchParams }}
      />
    </main>
  );
}
