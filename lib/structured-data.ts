import { profile } from "./profile";
import { absoluteUrl, getSiteUrl } from "./site";
import type { ContentItem } from "./mdx";

/**
 * Schema.org JSON-LD 结构化数据 helper。
 *
 * 用途：详情页嵌入 `<script type="application/ld+json">` 后，
 * Google 等爬虫可显示更精美的搜索结果（作者 / 发布日期 / 缩略图）。
 *
 * 设计取舍：
 * - blog 用 `BlogPosting`（更精确的子类），works 用 `CreativeWork`（摄影 / 项目作品）
 * - `image` 必须是 absolute URL：cover 已是完整 URL 时直接用，否则用 metadataBase 展开
 * - 不放 `WebSite` schema（个人站作用很小）、不放 `BreadcrumbList`
 *   （站内已有"返回列表"按钮，breadcrumb 是冗余）
 * - `inLanguage` 用 BCP 47 格式 `zh-CN`，与 profile.locale 的 OG 格式 `zh_CN` 区别
 *
 * `JSON.stringify` 会自动 skip `undefined` 字段，所以可选字段
 * （cover/excerpt/tags 缺失时）不会污染输出。
 */

/** 作者节点 —— blog 与 works 共享，避免重复定义 */
const authorNode = {
  "@type": "Person" as const,
  name: profile.name,
  url: getSiteUrl(),
};

/** 把 cover 字段（可能是相对路径，也可能是完整 URL）规范化为 absolute URL。 */
function resolveCover(cover: string | undefined): string[] | undefined {
  if (!cover) return undefined;
  return [cover.startsWith("http") ? cover : absoluteUrl(cover)];
}

/** profile.locale 是 OG 格式 `zh_CN`，BCP 47 用 `zh-CN`。 */
const inLanguage = profile.locale.replace("_", "-");

/**
 * 博客文章 JSON-LD（`BlogPosting`）。
 */
export function articleJsonLd(post: ContentItem): Record<string, unknown> {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    /**
     * 当前 schema 没有独立的 modified 字段（front-matter 没设计过），
     * 用 date 作为合理 fallback。Google 接受。
     */
    dateModified: post.date,
    author: authorNode,
    publisher: authorNode,
    image: resolveCover(post.cover),
    url,
    mainEntityOfPage: url,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    inLanguage,
  };
}

/**
 * 作品集 JSON-LD（`CreativeWork`）。
 *
 * 摄影 / 项目作品不属于 BlogPosting；CreativeWork 是 schema.org 中
 * 同时覆盖照片、设计、代码项目的最自然类型。
 */
export function workJsonLd(work: ContentItem): Record<string, unknown> {
  const url = absoluteUrl(`/works/${work.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    headline: work.title,
    datePublished: work.date,
    dateModified: work.date,
    author: authorNode,
    creator: authorNode,
    image: resolveCover(work.cover),
    url,
    description: work.excerpt,
    keywords: work.tags?.join(", "),
    inLanguage,
  };
}
