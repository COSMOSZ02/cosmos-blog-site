/**
 * 主题颜色 token 配置 —— 单一来源（single source of truth）。
 *
 * 设计原则：
 * - **只放在两个模式下"必须不同"的颜色**。Tailwind 的 zinc/blue 等色板已经
 *   在 utility class 里通过 `dark:` variant 切换，重复定义只会造成混乱。
 * - 这里的每一个 token 都会被编译为 CSS 变量 `--<token>`，注入到 `:root`（亮）
 *   与 `.dark`（暗）下，可以用 `var(--<token>)` 在样式里引用，
 *   或在 Tailwind 类里用 `bg-[var(--background)]` 等任意值语法引用。
 *
 * 增删步骤：
 * 1. 在 `themeTokens` 添加一行：`{ name: { light: "#xxx", dark: "#xxx" } }`
 * 2. 立即可在样式中使用 `var(--<name>)`
 * 3. 改值后无需改任何 CSS，只要刷新页面（或重跑 dev server）
 *
 * 注意：不要在这里放品牌强色 / 长尾灰阶 —— 那种用 Tailwind 的 zinc-{N} 即可，
 * 此文件只关心"主题切换"语义。
 */

export type ThemeMode = "light" | "dark";

/** CSS 变量名约定：仅小写 + 连字符；不要写 `--` 前缀，编译时自动添加。 */
export type ThemeTokenName =
  | "background"
  | "foreground"
  | "muted"
  | "muted-foreground"
  | "border"
  | "accent";

/** 一个 token 在两个模式下的颜色值。 */
export type ThemeTokenValue = Record<ThemeMode, string>;

export const themeTokens: Record<ThemeTokenName, ThemeTokenValue> = {
  /** 页面主背景。 */
  background: { light: "#ffffff", dark: "#0a0a0a" },
  /** 页面主前景（正文颜色）。 */
  foreground: { light: "#171717", dark: "#ededed" },
  /** 弱化背景（卡片底色 / 代码块内嵌背景等）。 */
  muted: { light: "#f4f4f5", dark: "#18181b" },
  /** 弱化前景（次要文字 / 时间戳）。 */
  "muted-foreground": { light: "#71717a", dark: "#a1a1aa" },
  /** 1px 分隔线。 */
  border: { light: "#e4e4e7", dark: "#27272a" },
  /** 强调色（链接 hover、关键交互）；保持中性，跟"简约线条风格"。 */
  accent: { light: "#171717", dark: "#fafafa" },
};

/**
 * 把 token 对象编译为 CSS 文本：
 *
 * ```css
 * :root {
 *   --background: #ffffff;
 *   ...
 * }
 * :root.dark {
 *   --background: #0a0a0a;
 *   ...
 * }
 * ```
 *
 * 这段字符串会被 `<ThemeStyles />` 注入到 `<style>` 标签里，
 * 与 globals.css 共同生效。放在内联 style 而不是 globals.css 的好处：
 * - 类型安全：TS 改 token 即时生效
 * - 不需要构建期生成 .css，所有改动通过 React 渲染走完整管线
 */
export function compileThemeCss(): string {
  const lightDecls: string[] = [];
  const darkDecls: string[] = [];

  for (const [name, value] of Object.entries(themeTokens)) {
    lightDecls.push(`  --${name}: ${value.light};`);
    darkDecls.push(`  --${name}: ${value.dark};`);
  }

  return [
    `:root {\n${lightDecls.join("\n")}\n}`,
    `:root.dark {\n${darkDecls.join("\n")}\n}`,
  ].join("\n");
}
