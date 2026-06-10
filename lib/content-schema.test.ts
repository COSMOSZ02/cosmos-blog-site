import { describe, expect, it } from "vitest";
import {
  articleFrontMatterSchema,
  formatZodIssues,
  parseFrontMatter,
  singlePageFrontMatterSchema,
} from "./content-schema";

/**
 * Schema 单测：覆盖合法 / 非法路径 + 错误信息聚合。
 *
 * 不依赖文件系统，纯函数测试，是 ROI 最高的一档。
 */

describe("articleFrontMatterSchema", () => {
  const minimalValid = { title: "Hello", date: "2026-05-29" };

  it("接受最小合法集（title + date）", () => {
    const result = articleFrontMatterSchema.parse(minimalValid);
    // 默认 draft: false 由 schema 注入
    expect(result).toMatchObject({
      title: "Hello",
      date: "2026-05-29",
      draft: false,
    });
  });

  it("接受完整字段集", () => {
    const result = articleFrontMatterSchema.parse({
      ...minimalValid,
      excerpt: "摘要",
      tags: ["前端", "Next"],
      cover: "/images/cover.jpg",
      draft: true,
    });
    expect(result).toEqual({
      title: "Hello",
      date: "2026-05-29",
      excerpt: "摘要",
      tags: ["前端", "Next"],
      cover: "/images/cover.jpg",
      draft: true,
    });
  });

  it("拒绝缺失 title", () => {
    const r = articleFrontMatterSchema.safeParse({ date: "2026-05-29" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "title")).toBe(true);
    }
  });

  it("拒绝空字符串 title", () => {
    const r = articleFrontMatterSchema.safeParse({
      ...minimalValid,
      title: "",
    });
    expect(r.success).toBe(false);
  });

  it("拒绝缺失 date", () => {
    const r = articleFrontMatterSchema.safeParse({ title: "Hello" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "date")).toBe(true);
    }
  });

  it.each([
    "2026/05/29",
    "29-05-2026",
    "May 29, 2026",
    "not-a-date",
    "",
    "2026-5-29", // 月份必须两位
  ])("拒绝非 YYYY-MM-DD 格式 date：%s", (date) => {
    const r = articleFrontMatterSchema.safeParse({ title: "Hello", date });
    expect(r.success).toBe(false);
  });

  it("拒绝 tags 中的空字符串元素（不再静默过滤）", () => {
    const r = articleFrontMatterSchema.safeParse({
      ...minimalValid,
      tags: ["前端", ""],
    });
    expect(r.success).toBe(false);
  });

  it("拒绝 tags 中的非字符串元素（不再静默过滤）", () => {
    const r = articleFrontMatterSchema.safeParse({
      ...minimalValid,
      // 故意混入数字，模拟用户写错
      tags: ["前端", 42 as unknown as string],
    });
    expect(r.success).toBe(false);
  });

  it("draft 缺省值为 false", () => {
    const result = articleFrontMatterSchema.parse(minimalValid);
    expect(result.draft).toBe(false);
  });

  it("excerpt 是可选字段，缺失通过", () => {
    const result = articleFrontMatterSchema.parse(minimalValid);
    expect(result.excerpt).toBeUndefined();
  });
});

describe("singlePageFrontMatterSchema", () => {
  it("接受仅含 title", () => {
    const result = singlePageFrontMatterSchema.parse({ title: "关于" });
    expect(result.title).toBe("关于");
  });

  it("接受 title + description", () => {
    const result = singlePageFrontMatterSchema.parse({
      title: "关于",
      description: "关于这个网站",
    });
    expect(result).toEqual({ title: "关于", description: "关于这个网站" });
  });

  it("拒绝缺失 title", () => {
    const r = singlePageFrontMatterSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("不接受 collection 才有的字段被强行传入时静默通过 —— zod 默认会 strip", () => {
    // zod 默认 strip 未声明字段，这是 v4 的 default behavior
    const result = singlePageFrontMatterSchema.parse({
      title: "关于",
      date: "2026-05-29",
    } as unknown);
    expect(result).toEqual({ title: "关于" });
    expect((result as Record<string, unknown>).date).toBeUndefined();
  });
});

describe("formatZodIssues", () => {
  it("把所有 issues 聚合到多行可读字符串", () => {
    const r = articleFrontMatterSchema.safeParse({
      title: "",
      date: "not-a-date",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const text = formatZodIssues(r.error, "posts/foo.mdx");
      expect(text).toContain("[mdx] posts/foo.mdx 校验失败：");
      expect(text).toContain("- title:");
      expect(text).toContain("- date:");
      // 多个 issue 各占一行
      expect(text.split("\n").length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("parseFrontMatter", () => {
  it("成功路径：返回类型化数据", () => {
    const data = parseFrontMatter(
      articleFrontMatterSchema,
      { title: "Hi", date: "2026-05-29" },
      "posts/x.mdx",
    );
    expect(data.title).toBe("Hi");
  });

  it("失败路径：抛 Error，且 message 含 source 与字段名", () => {
    expect(() =>
      parseFrontMatter(
        articleFrontMatterSchema,
        { title: "" },
        "posts/x.mdx",
      ),
    ).toThrow(/posts\/x\.mdx/);
    expect(() =>
      parseFrontMatter(
        articleFrontMatterSchema,
        { title: "" },
        "posts/x.mdx",
      ),
    ).toThrow(/校验失败/);
  });
});
