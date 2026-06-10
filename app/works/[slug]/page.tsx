import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getContentBySlug } from "@/lib/mdx";
import { mdxOptions } from "@/lib/mdx-options";
import { formatDate } from "@/lib/date";
import { workJsonLd } from "@/lib/structured-data";
import { BackLink } from "@/components/ui/BackLink";
import { JsonLd } from "@/components/ui/JsonLd";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("works");
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

/**
 * 作品 metadata：构建期从 mdx front-matter 推导。
 *
 * og:image 策略：
 * - 摄影 / 项目作品集尤其依赖 cover —— 分享时社媒卡片就是作品本身
 * - 有 `cover` → 用作品自己的封面图
 * - 无 `cover` → 不输出 og:image，社交平台会回落到根 `/opengraph-image`
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getContentBySlug("works", slug);
  if (!work) return {};

  const url = `/works/${slug}`;
  const images = work.cover
    ? [{ url: work.cover, alt: work.title }]
    : undefined;

  return {
    title: work.title,
    description: work.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: work.title,
      description: work.excerpt,
      url,
      type: "article",
      publishedTime: work.date,
      tags: work.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: work.title,
      description: work.excerpt,
      images: work.cover ? [work.cover] : undefined,
    },
  };
}

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
      <JsonLd data={workJsonLd(work)} />
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
