/**
 * 在 hydration **之前**同步执行的 FOUC 防护脚本。
 *
 * 工作流程：
 * 1. 读 localStorage["theme"]（"light" / "dark" / "system"）。
 * 2. 缺省值 = "light"（项目要求："默认日间，用户可手动切换"）。
 * 3. 当 stored === "system" 时再去查 prefers-color-scheme。
 * 4. 据此给 <html> 加/删 `dark` 类。
 *
 * 安全：脚本内容是常量字符串，不带任何用户输入，使用
 * `dangerouslySetInnerHTML` 注入是安全的。
 *
 * 注意：脚本里 try/catch 包了一切 DOM / Storage 调用，避免：
 * - 隐私模式下 localStorage 抛错
 * - matchMedia 在某些极旧环境不存在
 * 任意一步失败都不会阻塞页面，最坏只是停留在 light 模式。
 */
const SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var mode = stored === "dark" || stored === "light" || stored === "system"
      ? stored
      : "light";
    var resolved = mode;
    if (mode === "system") {
      resolved = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    var root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = resolved;
  } catch (e) { /* noop */ }
})();
`;

export function ThemeScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
  );
}
