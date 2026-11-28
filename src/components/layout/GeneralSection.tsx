import clsx from "clsx";
import type { Page } from "@thebensage-dev/cms-client";

/**
 * Lays out a general block (text, image, columns…): in the page's column on a wide or narrow
 * page, in a centred column of its own on a full-width page (whose blocks lay themselves out).
 */
export default function GeneralSection({
  page,
  id,
  className,
  children,
}: {
  page: Page;
  id?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const full = page.width === "full";
  return (
    <section
      id={id || undefined}
      className={clsx(
        "scroll-mt-8",
        full ? "mx-auto w-full max-w-5xl px-4 py-section sm:px-6" : "mt-subsection",
        className,
      )}
    >
      {children}
    </section>
  );
}
