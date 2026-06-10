import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest 配置。
 *
 * 关键点：
 * - **`server-only` alias 替换为空模块**：`lib/mdx.ts` 顶部 `import "server-only"`
 *   是为防止误打到客户端 bundle 用的标记包，运行时无逻辑；测试环境直接走空 stub
 *   避免被它的"必须在 server"运行时检查打断。
 * - **`@/` 路径别名同 tsconfig**：保持单测里的 import 路径与生产代码完全一致。
 * - **环境用默认 node**：所有被测代码都是 Node 运行时（fs / path），不需要 jsdom。
 */
export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: false,
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
