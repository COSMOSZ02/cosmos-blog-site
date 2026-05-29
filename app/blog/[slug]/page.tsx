import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getContentBySlug } from "@/lib/mdx";
import { mdxOptions } from "@/lib/mdx-options";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link
          href="/blog"
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← 返回列表
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.date}>{post.date}</time>
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

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={post.raw} options={mdxOptions} />
      </article>
    </main>
  );
}
