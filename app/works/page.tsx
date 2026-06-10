import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent } from "@/lib/mdx";
import { formatDate, groupByYear } from "@/lib/date";

export const metadata: Metadata = {
  title: "作品",
  description: "做过的产品、写过的代码、按过的快门。",
  alternates: { canonical: "/works" },
  openGraph: {
    title: "作品",
    description: "做过的产品、写过的代码、按过的快门。",
    url: "/works",
    type: "website",
  },
};

export default async function WorksPage() {
  const works = await getAllContent("works");
  const groups = groupByYear(works);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">作品</h1>

      {works.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          还没有发布作品，敬请期待。
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section
              key={group.year}
              aria-labelledby={`year-${group.year}`}
              className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[5rem_1fr]"
            >
              <h2
                id={`year-${group.year}`}
                className="font-mono text-xl text-zinc-300 sm:sticky sm:top-20 sm:self-start dark:text-zinc-700"
              >
                {group.year}
              </h2>

              <ol className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                {group.items.map((work) => (
                  <li key={work.slug}>
                    <Link
                      href={`/works/${work.slug}`}
                      className="group block py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-base font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                          {work.title}
                        </h3>
                        <time
                          dateTime={work.date}
                          className="shrink-0 font-mono text-xs text-zinc-500 dark:text-zinc-400"
                        >
                          {formatDate(work.date)}
                        </time>
                      </div>
                      {work.tags && work.tags.length > 0 && (
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {work.tags.join(" / ")}
                        </div>
                      )}
                      {work.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                          {work.excerpt}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
