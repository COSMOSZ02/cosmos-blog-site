import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isContentFile,
  listSlugs,
  resolveContentPath,
} from "./mdx";

/**
 * IO 纯函数单测。
 *
 * 这里直接走真实文件系统：当前仓库的 `content/posts` / `content/works` /
 * `content/about.mdx` 是稳定 fixture，不需要再造 mock。
 *
 * 端到端的 `getAllContent` / `getContentBySlug` 没在本文件覆盖，
 * 它们的"必填字段缺失"路径已由 content-schema.test 覆盖；
 * "draft 过滤" 等需 mock NODE_ENV 的场景留待后续按需补。
 */

describe("isContentFile", () => {
  it("接受常规 .mdx 文件名", () => {
    expect(isContentFile("hello-world.mdx")).toBe(true);
  });

  it("拒绝非 .mdx 后缀", () => {
    expect(isContentFile("hello-world.md")).toBe(false);
    expect(isContentFile("hello-world.txt")).toBe(false);
    expect(isContentFile("hello-world")).toBe(false);
  });

  it("拒绝以 _ 开头的模板文件", () => {
    expect(isContentFile("_template.mdx")).toBe(false);
  });

  it("拒绝以 . 开头的隐藏文件", () => {
    expect(isContentFile(".DS_Store")).toBe(false);
    expect(isContentFile(".hidden.mdx")).toBe(false);
  });
});

describe("resolveContentPath", () => {
  const CONTENT_ROOT = path.join(process.cwd(), "content");

  it("合法 slug 返回 collection 内的绝对路径", () => {
    const p = resolveContentPath("posts", "hello-world");
    expect(p).toBe(path.join(CONTENT_ROOT, "posts", "hello-world.mdx"));
  });

  it("拒绝包含路径分隔符的 slug", () => {
    expect(() => resolveContentPath("posts", "../etc/passwd")).toThrow(
      /非法 slug/,
    );
    expect(() => resolveContentPath("posts", "foo/bar")).toThrow(/非法 slug/);
  });

  it("拒绝包含其它特殊字符的 slug", () => {
    expect(() => resolveContentPath("posts", "foo bar")).toThrow(/非法 slug/);
    expect(() => resolveContentPath("posts", "foo$bar")).toThrow(/非法 slug/);
    expect(() => resolveContentPath("posts", "")).toThrow(/非法 slug/);
  });

  it("接受字母数字 . _ - 组合", () => {
    expect(() => resolveContentPath("posts", "Foo_BAR-1.2")).not.toThrow();
  });
});

describe("listSlugs", () => {
  it("从 content/posts 列出真实 slug，过滤 _template 与隐藏文件", async () => {
    const slugs = await listSlugs("posts");
    // 含 hello-world，不含 _template
    expect(slugs).toContain("hello-world");
    expect(slugs).not.toContain("_template");
    expect(slugs).not.toContain(".DS_Store");
    // 不应有 .mdx 后缀
    for (const s of slugs) {
      expect(s.endsWith(".mdx")).toBe(false);
    }
  });

  it("从 content/works 列出真实 slug", async () => {
    const slugs = await listSlugs("works");
    expect(slugs).toContain("this-blog");
    expect(slugs).not.toContain("_template");
  });
});
