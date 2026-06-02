import { compileThemeCss } from "@/lib/theme";

/**
 * 把 `lib/theme.ts` 中的颜色 token 编译为内联 `<style>` 标签。
 *
 * 设计：
 * - **server component**：编译期一次性生成静态字符串，无运行时开销。
 * - 放在 `<head>` 里（通过 layout 注入 `<body>` 顶部也行；浏览器会等同处理），
 *   保证在任何用 `var(--xxx)` 的样式之前生效。
 * - 内容来源完全可控（来自 `lib/theme.ts` 的常量），不存在 XSS 风险，
 *   `dangerouslySetInnerHTML` 在此安全。
 */
export function ThemeStyles() {
  return (
    <style
      data-theme-tokens=""
      dangerouslySetInnerHTML={{ __html: compileThemeCss() }}
    />
  );
}
