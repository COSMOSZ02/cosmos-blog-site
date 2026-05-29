import Link from "next/link";
import { getAllContent } from "@/lib/mdx";

export default async function BlogPage() {
  const posts = await getAllContent("posts");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">博客</h1>

      {posts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          还没有发布文章，敬请期待。
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-lg border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                <h2 className="text-lg font-medium group-hover:underline">
                  {post.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <time dateTime={post.date}>{post.date}</time>
                  <span aria-hidden>·</span>
                  <span>{post.readingTimeText}</span>
                </div>
                {post.excerpt && (
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {post.excerpt}
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
