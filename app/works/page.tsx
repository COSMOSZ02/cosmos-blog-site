import Link from "next/link";
import { getAllContent } from "@/lib/mdx";

export default async function WorksPage() {
  const works = await getAllContent("works");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">作品集</h1>

      {works.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          还没有发布作品，敬请期待。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {works.map((work) => (
            <li key={work.slug}>
              <Link
                href={`/works/${work.slug}`}
                className="group block rounded-lg border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                <h2 className="text-lg font-medium group-hover:underline">
                  {work.title}
                </h2>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <time dateTime={work.date}>{work.date}</time>
                </div>
                {work.excerpt && (
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {work.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
