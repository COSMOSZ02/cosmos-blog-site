import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";

import {
  type ArticleFrontMatter,
  type SinglePageFrontMatter,
  articleFrontMatterSchema,
  singlePageFrontMatterSchema,
  parseFrontMatter,
} from "./content-schema";

/**
 * 内容集合定义。
 * - 在 content/ 下新增同名目录即可扩展（例如未来加入 notes / talks）。
 */
export const COLLECTIONS = {
  posts: "posts",
  works: "works",
} as const;

export type Collection = keyof typeof COLLECTIONS;

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * 类型从 zod schema 推导，与 `lib/content-schema.ts` 保持单一来源。
 * 这两个 type alias 只是给 lib/mdx 的下游导出更友好的命名，
 * schema 才是真正的"事实"。
 */
export type { ArticleFrontMatter, SinglePageFrontMatter };

export interface ContentMeta extends ArticleFrontMatter {
  slug: string;
  collection: Collection;
  readingTimeMinutes: number; // 向上取整的分钟数
  readingTimeText: string; // e.g. "3 min read"
}

export interface ContentItem extends ContentMeta {
  /** MDX 原文（未编译），交给 next-mdx-remote/rsc 的 <MDXRemote source={raw} /> 渲染。 */
  raw: string;
}

/**
 * 是否为生产环境。生产环境会过滤掉 draft: true 的内容。
 */
const isProd = process.env.NODE_ENV === "production";

/**
 * 判断文件是否为有效的 MDX 内容文件：
 * - 后缀必须是 .mdx
 * - 文件名不能以 _ 或 . 开头（约定为模板/隐藏文件）
 *
 * Exported for unit tests; production usage 仅通过 `listSlugs()` 内部调用。
 */
export function isContentFile(filename: string): boolean {
  if (!filename.endsWith(".mdx")) return false;
  if (filename.startsWith("_")) return false;
  if (filename.startsWith(".")) return false;
  return true;
}

/**
 * 安全地把 slug 解析回磁盘上的文件路径，防止 ../ 之类的路径穿越。
 *
 * Exported for unit tests; 生产代码内部调用即可。
 */
export function resolveContentPath(
  collection: Collection,
  slug: string,
): string {
  // slug 仅允许字母/数字/连字符/下划线/点，避免目录穿越
  if (!/^[a-zA-Z0-9._-]+$/.test(slug)) {
    throw new Error(`[mdx] 非法 slug: ${slug}`);
  }
  const collectionDir = path.join(CONTENT_ROOT, COLLECTIONS[collection]);
  const filePath = path.join(collectionDir, `${slug}.mdx`);

  // 二次防御：解析后的路径必须仍在 collection 目录内
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(collectionDir + path.sep)) {
    throw new Error(`[mdx] slug 越界: ${slug}`);
  }
  return normalized;
}

/**
 * 读取一个集合下的所有 MDX 文件名（不含后缀），按目录遍历。
 * 目录不存在时返回空数组（容忍空集合）。
 *
 * Exported for unit tests。
 */
export async function listSlugs(collection: Collection): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, COLLECTIONS[collection]);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw err;
  }
  return entries.filter(isContentFile).map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * 解析单个 MDX 文件，返回 raw + meta。
 * 用 React.cache 包装以在同一请求内复用结果。
 */
export const getContentBySlug = cache(
  async (
    collection: Collection,
    slug: string,
  ): Promise<ContentItem | null> => {
    const filePath = resolveContentPath(collection, slug);
    let file: string;
    try {
      file = await fs.readFile(filePath, "utf8");
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return null;
      throw err;
    }

    const { data, content } = matter(file);
    const fm = parseFrontMatter(
      articleFrontMatterSchema,
      data,
      `${collection}/${slug}.mdx`,
    );

    if (fm.draft && isProd) return null;

    const stats = readingTime(content);

    return {
      ...fm,
      slug,
      collection,
      raw: content,
      readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
      readingTimeText: stats.text,
    };
  },
);

/**
 * 列出某个集合下所有内容的元信息，按日期倒序。
 * 不返回 raw，列表页无需正文。
 */
export const getAllContent = cache(
  async (collection: Collection): Promise<ContentMeta[]> => {
    const slugs = await listSlugs(collection);

    const items = await Promise.all(
      slugs.map(async (slug) => {
        const item = await getContentBySlug(collection, slug);
        if (!item) return null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { raw: _raw, ...meta } = item;
        return meta;
      }),
    );

    return items
      .filter((x): x is ContentMeta => x !== null)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },
);

/**
 * 给 generateStaticParams 用的 slug 列表。
 */
export const getAllSlugs = cache(
  async (collection: Collection): Promise<string[]> => {
    const items = await getAllContent(collection);
    return items.map((it) => it.slug);
  },
);

/* -------------------------------------------------------------------------- */
/*  单页 MDX（不属于任何 collection，例如 /about）                              */
/* -------------------------------------------------------------------------- */

export interface SinglePage extends SinglePageFrontMatter {
  /** MDX 正文原文 */
  raw: string;
}

/** 单页文件名白名单：仅小写字母 + 连字符。 */
const SINGLE_PAGE_NAME_RE = /^[a-z][a-z0-9-]*$/;

/**
 * 读取 `content/<name>.mdx` 这样的单页 MDX。
 *
 * - 与 collection 完全隔离：单页文件直接放在 `content/` 根下，
 *   不会出现在 `getAllContent("posts")` 等列表里；
 * - 文件名必须满足 `[a-z][a-z0-9-]*`，避免目录穿越；
 * - 文件不存在返回 `null`，由调用方决定走 notFound 还是回退。
 */
export const getSinglePage = cache(
  async (name: string): Promise<SinglePage | null> => {
    if (!SINGLE_PAGE_NAME_RE.test(name)) {
      throw new Error(`[mdx] 非法单页名: ${name}`);
    }
    const filePath = path.join(CONTENT_ROOT, `${name}.mdx`);
    const normalized = path.normalize(filePath);
    if (!normalized.startsWith(CONTENT_ROOT + path.sep)) {
      throw new Error(`[mdx] 单页越界: ${name}`);
    }

    let file: string;
    try {
      file = await fs.readFile(normalized, "utf8");
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return null;
      throw err;
    }

    const { data, content } = matter(file);
    const fm = parseFrontMatter(
      singlePageFrontMatterSchema,
      data,
      `${name}.mdx`,
    );

    return {
      ...fm,
      raw: content,
    };
  },
);
