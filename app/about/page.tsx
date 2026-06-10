import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getSinglePage } from "@/lib/mdx";
import { mdxOptions } from "@/lib/mdx-options";

/**
 * About 页 metadata：从 `content/about.mdx` front-matter 推导，
 * 让"内容文件"成为 SEO 文案的唯一来源。
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getSinglePage("about");
  if (!page) return { title: "关于" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: page.title,
      description: page.description,
      url: "/about",
      type: "profile",
    },
  };
}

export default async function AboutPage() {
  const page = await getSinglePage("about");

  // content/about.mdx 缺失时走 not-found，避免渲染空白
  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {page.description}
          </p>
        )}
      </header>

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={page.raw} options={mdxOptions} />
      </article>
    </main>
  );
}
