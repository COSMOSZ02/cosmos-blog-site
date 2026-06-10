import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/site";

/**
 * `app/sitemap.ts` 是 Next 16 的 metadata file convention：
 * 构建期被编译为 `/sitemap.xml`，无运行时开销。
 *
 * 字段说明（参见 sitemaps.org 规范）：
 * - `lastModified`：用 front-matter date 而非文件 mtime —— mtime 会被
 *   git checkout / CI build 改写，不稳定；front-matter date 是作者侧权威值。
 * - `changeFrequency` / `priority`：Google 多年来宣布忽略这两个字段，
 *   但 Bing / 一些其它爬虫仍会参考。零成本写一下，无害。
 *
 * URL 必须是 absolute；通过 `lib/site.ts` 的解析链拿 base，
 * 未购域名时自动走 `*.vercel.app`，买域名后切到 `NEXT_PUBLIC_SITE_URL`。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 静态路由
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/works"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 动态路由：blog + works 详情
  // `getAllContent` 已经按日期倒序，并自动过滤 draft（生产环境）。
  const [posts, works] = await Promise.all([
    getAllContent("posts"),
    getAllContent("works"),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "yearly", // 文章发布后基本不再大改
    priority: 0.7,
  }));

  const workEntries: MetadataRoute.Sitemap = works.map((work) => ({
    url: absoluteUrl(`/works/${work.slug}`),
    lastModified: new Date(work.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries, ...workEntries];
}
