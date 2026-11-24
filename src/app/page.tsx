import {
  ArrowRight,
  Database,
  Filter,
  Link2,
  MoonStar,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  BrandBlobs,
  FeatureGrid,
  Reveal,
  SectionHeading,
  StepTimeline,
  type Feature,
  type TimelineStep,
} from "@thebensage-dev/ui";
import SearchPreview from "@/components/landing/SearchPreview";
import { getDirectorySummary } from "@/server/users";

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "Flexible search",
    description:
      "Multi-word, accent-insensitive search across names, jobs, cities and interests, ranked by best match.",
  },
  {
    icon: Filter,
    title: "Combined filters",
    description:
      "Filter by country, age range and interests, with removable chips and live counts.",
  },
  {
    icon: Link2,
    title: "Shareable views",
    description:
      "Search, filters, sort and page all live in the URL, so any view can be bookmarked or shared.",
  },
  {
    icon: ShieldCheck,
    title: "Shared validation",
    description:
      "One schema checks the form as you type and again on the server, with errors beside each field.",
  },
  {
    icon: Zap,
    title: "Server-rendered",
    description:
      "Pages arrive fully rendered from the People API, and changes update the page without a reload.",
  },
  {
    icon: MoonStar,
    title: "Light and dark themes",
    description:
      "Follows the system setting or your choice, applied on the server so there is no flash.",
  },
];

const STEPS: TimelineStep[] = [
  {
    title: "Server Components read the data",
    description:
      "Pages call the People API, a .NET service on PostgreSQL, and stream ready-made HTML.",
  },
  {
    title: "The URL drives the list",
    description:
      "nuqs keeps search and filters in the address bar; the API searches and pages in SQL.",
  },
  {
    title: "Server Actions make the changes",
    description:
      "Validated actions send your signed-in token to the API, then revalidate the page.",
  },
];

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  ".NET API + PostgreSQL",
  "Tailwind CSS v4",
  "zod",
  "nuqs",
  "Vitest",
];

export default async function HomePage() {
  const summary = await getDirectorySummary();

  return (
    <main className="relative overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-x-0 top-0 h-[36rem]" />

      <section className="relative isolate mx-auto grid w-full max-w-5xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
        <BrandBlobs />
        <div>
          <Reveal>
            <span className="tag tag-tone tone-accent inline-flex items-center gap-1.5">
              <Database className="size-3.5" />
              Next.js 16 demo
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              A fast, <span className="gradient-text">searchable</span> people directory
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-lg text-foreground-muted">
              Search, filter and edit records in an accessible app, rendered on the server from a
              .NET API on PostgreSQL, with every change validated in the browser and on the server.
            </p>
          </Reveal>
          <Reveal delay={300} className="mt-8 flex flex-wrap gap-3">
            <Link href="/users" className="btn btn-primary group h-11 px-5">
              Open the directory
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#how" className="btn btn-secondary h-11 px-5">
              How it works
            </a>
          </Reveal>
          {summary.people > 0 && (
            <Reveal delay={400}>
              <p className="mt-6 text-sm text-foreground-muted">
                <strong className="text-foreground">{summary.people}</strong> people ·{" "}
                <strong className="text-foreground">{summary.countries.length}</strong> countries ·{" "}
                <strong className="text-foreground">{summary.interests.length}</strong> interests
              </p>
            </Reveal>
          )}
        </div>

        <Reveal delay={250}>
          <SearchPreview />
        </Reveal>
      </section>

      <section
        aria-labelledby="features-title"
        className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6"
      >
        <Reveal onScroll>
          <SectionHeading id="features-title" title="Features" />
        </Reveal>
        <FeatureGrid features={FEATURES} className="mt-8" />
      </section>

      <section
        id="how"
        aria-labelledby="how-title"
        className="relative mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6"
      >
        <Reveal onScroll>
          <SectionHeading id="how-title" title="How it works" />
        </Reveal>
        <StepTimeline steps={STEPS} label="How it works" countLabel={false} className="mt-8" />
        <Reveal onScroll className="mt-8 flex flex-wrap gap-2">
          {STACK.map((item) => (
            <span key={item} className="tag border border-border bg-surface px-3 py-1">
              {item}
            </span>
          ))}
        </Reveal>
      </section>

      <section className="relative mx-auto w-full max-w-5xl px-4 pt-8 pb-24 sm:px-6">
        <Reveal
          onScroll
          className="card brand-wash flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <span aria-hidden className="brand-rule mb-4" />
            <h2 className="text-xl font-semibold tracking-tight">Explore the directory</h2>
            <p className="mt-1 text-foreground-muted">
              Search, filter, or sign in to add and edit records.
            </p>
          </div>
          <Link href="/users" className="btn btn-primary h-11 px-5">
            Open the directory
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
