import { z } from "zod";

/**
 * 内容 front-matter 的 zod schema 定义 —— 校验单一来源。
 *
 * 设计原则：
 * - **schema 是 SSOT，类型 `z.infer<typeof schema>` 自动推导**，
 *   避免手写 interface 与 schema 漂移。
 * - 校验失败时不直接抛 ZodError，而是用 `formatZodIssues` 包装为
 *   人类可读的多行错误，方便作者一眼看到所有问题。
 * - 严格优于宽松：`tags` 元素必须非空字符串、`date` 必须是 ISO 日期；
 *   宁愿构建期抛错，也不要静默过滤错误数据导致渲染期才发现。
 */

/**
 * collection（posts / works）下文章的 front-matter。
 *
 * 必填：title、date
 * 可选：excerpt、tags、cover、draft
 */
export const articleFrontMatterSchema = z.object({
  title: z.string().min(1, "title 不能为空"),
  /**
   * `z.iso.date()` 校验 `YYYY-MM-DD` 格式（仅日期）。
   * 模板与现有内容都是此格式；如未来要精确到时分秒，再切到 `z.iso.datetime()`。
   */
  date: z.iso.date("date 必须是 YYYY-MM-DD 格式"),
  excerpt: z.string().min(1).optional(),
  tags: z.array(z.string().min(1, "tag 不能为空字符串")).optional(),
  cover: z.string().min(1).optional(),
  draft: z.boolean().optional().default(false),
});

/**
 * 单页（如 /about）front-matter。
 *
 * 比 collection 简单：无 date / tags / draft；title 仍必填。
 */
export const singlePageFrontMatterSchema = z.object({
  title: z.string().min(1, "title 不能为空"),
  description: z.string().min(1).optional(),
});

export type ArticleFrontMatter = z.infer<typeof articleFrontMatterSchema>;
export type SinglePageFrontMatter = z.infer<typeof singlePageFrontMatterSchema>;

/* -------------------------------------------------------------------------- */
/*  错误格式化                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 把 ZodError 的 issues 数组格式化为多行字符串。
 *
 * 输出形如：
 *   [mdx] posts/foo.mdx 校验失败：
 *     - title: title 不能为空
 *     - date: date 必须是 YYYY-MM-DD 格式
 */
export function formatZodIssues(error: z.ZodError, source: string): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    return `  - ${path}: ${issue.message}`;
  });
  return `[mdx] ${source} 校验失败：\n${lines.join("\n")}`;
}

/**
 * 通用解析入口：成功返回 data，失败抛 Error（带格式化好的多行信息）。
 *
 * 类型签名利用 `z.ZodType<T>` 让调用方自带类型；
 * 也可以用 `parseFrontMatter(schema, ...)` 形式靠类型推导自动出参。
 */
export function parseFrontMatter<T extends z.ZodType>(
  schema: T,
  raw: unknown,
  source: string,
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(formatZodIssues(result.error, source));
  }
  return result.data;
}
