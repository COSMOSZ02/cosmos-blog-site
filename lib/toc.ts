import "server-only";

import GithubSlugger from "github-slugger";

/**
 * TOC（目录）条目。
 *
 * 仅提取 H2 / H3：
 * - H1 是页面标题（详情页头部已经渲染），不进 TOC
 * - H4+ 通常表示更细碎的小节，列在 TOC 里反而让目录变长难读
 */
export type HeadingLevel = 2 | 3;

export interface TocItem {
  /** 与 rehype-slug 注入到 DOM 上的 `id` 一致；前端跳转用 `#${id}` */
  id: string;
  /** 标题原文（已去除 markdown 强调标记） */
  text: string;
  level: HeadingLevel;
}

/* -------------------------------------------------------------------------- */
/*  解析正则 / 状态机                                                           */
/* -------------------------------------------------------------------------- */

/**
 * 行首 markdown 标题：`## Title` / `### Title`，可选尾部空格 + 可选 `#`。
 * 不处理 setext 风格（`Title\n===`），仓库约定 ATX 写法。
 */
const HEADING_RE = /^(#{2,3})\s+(.+?)\s*#*\s*$/;

/**
 * 代码围栏（` ``` `, `~~~`）。允许指定语言：``` ts，开闭符号必须一致。
 */
const FENCE_RE = /^([`~]{3,})\s*([^\s`~]*)\s*$/;

/**
 * 把 markdown 标题文本里的强调 / 行内代码标记去掉，用于显示。
 *
 * 处理顺序很重要：
 * 1. 先去 [text](url) → text
 * 2. 再去 `code` → code
 * 3. 再去 ** / __ / * / _
 * 4. 最后压缩空白
 */
function stripMarkdownInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url)
    .replace(/`([^`]+)`/g, "$1") // `code`
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    .replace(/__([^_]+)__/g, "$1") // __bold__
    .replace(/(?<![*\\])\*([^*]+)\*/g, "$1") // *italic*
    .replace(/(?<![_\\])_([^_]+)_/g, "$1") // _italic_
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/*  主入口                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * 从 MDX 原文提取 H2 / H3 列表。
 *
 * 关键约束：**id 算法必须与 `rehype-slug` 完全一致**，
 * 否则 TOC 上的链接点击后跳不到正确锚点。
 *
 * `rehype-slug` 内部使用 `github-slugger`，
 * 所以这里也用同一个库 + 每次新建实例（保留同名标题自动加后缀的行为）。
 */
export function extractHeadings(raw: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  let inFence = false;
  let fenceMarker = "";

  const lines = raw.split("\n");
  for (const line of lines) {
    // 1) 处理代码围栏：进入 / 退出后跳过该行
    const fence = line.match(FENCE_RE);
    if (fence) {
      const marker = fence[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0]; // 只关心字符种类
      } else if (marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (inFence) continue;

    // 2) 提取 H2 / H3
    const m = line.match(HEADING_RE);
    if (!m) continue;
    const level = m[1].length === 2 ? 2 : 3;
    const text = stripMarkdownInline(m[2]);
    if (!text) continue;

    items.push({
      id: slugger.slug(text),
      text,
      level: level as HeadingLevel,
    });
  }

  return items;
}
