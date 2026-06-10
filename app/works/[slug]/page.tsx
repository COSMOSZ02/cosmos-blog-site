import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getContentBySlug } from "@/lib/mdx";
import { mdxOptions } from "@/lib/mdx-options";
import { formatDate } from "@/lib/date";
import { BackLink } from "@/components/ui/BackLink";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("works");
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getContentBySlug("works", slug);

  if (!work) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <BackLink href="/works" text="返回作品集" />

      <header className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {work.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <time dateTime={work.date}>{formatDate(work.date)}</time>
          {work.tags && work.tags.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{work.tags.join(" / ")}</span>
            </>
          )}
        </div>
      </header>

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={work.raw} options={mdxOptions} />
      </article>
    </main>
  );
}
