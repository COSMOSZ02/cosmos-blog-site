import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getContentBySlug } from "@/lib/mdx";
import { mdxOptions } from "@/lib/mdx-options";
import { formatDate } from "@/lib/date";
import { extractHeadings } from "@/lib/toc";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { BackLink } from "@/components/ui/BackLink";

/**
 * 构建期生成所有 slug 的静态页。
 * 新增/修改 mdx 文件后重跑 build 即可。
 */
export async function generateStaticParams() {
  const slugs = await getAllSlugs("posts");
  return slugs.map((slug) => ({ slug }));
}

/**
 * 仅渲染 generateStaticParams 列出的 slug，
 * 其它路径直接走 not-found，避免线上路径被任意试探时触发 SSR。
 */
export const dynamicParams = false;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getContentBySlug("posts", slug);

  if (!post) notFound();

  const headings = extractHeadings(post.raw);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <BackLink href="/blog" text="返回列表" />

      <header className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTimeText}</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{post.tags.join(" / ")}</span>
            </>
          )}
        </div>
      </header>

      {/*
        TOC：
        - lg 以下（含移动端 / 平板）：details/summary 折叠形式，出现在文章上方
        - lg+：fixed 浮在主体右侧空白处，跟随视口；
          位置公式 lg:right-[max(1rem,calc((100vw-48rem)/2-14rem))]
          —— 让目录始终留在 main（max-w-3xl=48rem）的右侧白边里，
          屏幕足够宽时贴中线偏右，屏幕较窄时贴 1rem 边距，永远不和文字重叠。
      */}
      <TableOfContents
        items={headings}
        variant="collapsible"
        className="mb-8 lg:hidden"
      />
      <TableOfContents
        items={headings}
        variant="static"
        className="hidden lg:block lg:fixed lg:top-24 lg:w-52 lg:right-[max(1rem,calc((100vw-48rem)/2-14rem))] lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
      />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={post.raw} options={mdxOptions} />
      </article>
    </main>
  );
}
