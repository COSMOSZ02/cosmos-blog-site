import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import readingTime from "reading-time";

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
 * Front-matter 通用字段。
 * 所有字段做了「宽松解析 + 严格出参」的处理：
 * - 解析时用 unknown 接收，避免 gray-matter 把任意值塞进来导致下游崩溃；
 * - 出参时统一为已校验的类型。
 */
export interface FrontMatter {
  title: string;
  date: string; // ISO 字符串，原样保留以便上层用 date-fns 处理时区
  excerpt?: string;
  tags?: string[];
  cover?: string;
  draft?: boolean;
}

export interface ContentMeta extends FrontMatter {
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
 */
function isContentFile(filename: string): boolean {
  if (!filename.endsWith(".mdx")) return false;
  if (filename.startsWith("_")) return false;
  if (filename.startsWith(".")) return false;
  return true;
}

/**
 * 把任意 front-matter 输入收敛到 FrontMatter 形态。
 * 对必需字段缺失的内容直接抛错，避免静默渲染出错误页面。
 */
function normalizeFrontMatter(
  raw: Record<string, unknown>,
  source: string,
): FrontMatter {
  const title = raw.title;
  const date = raw.date;

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error(`[mdx] ${source} 缺少必填字段 title`);
  }
  if (typeof date !== "string" || date.trim() === "") {
    throw new Error(`[mdx] ${source} 缺少必填字段 date`);
  }

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : undefined;

  return {
    title,
    date,
    excerpt: typeof raw.excerpt === "string" ? raw.excerpt : undefined,
    tags,
    cover: typeof raw.cover === "string" ? raw.cover : undefined,
    draft: typeof raw.draft === "boolean" ? raw.draft : false,
  };
}

/**
 * 安全地把 slug 解析回磁盘上的文件路径，防止 ../ 之类的路径穿越。
 */
function resolveContentPath(collection: Collection, slug: string): string {
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
 */
async function listSlugs(collection: Collection): Promise<string[]> {
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
    const fm = normalizeFrontMatter(
      data as Record<string, unknown>,
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
