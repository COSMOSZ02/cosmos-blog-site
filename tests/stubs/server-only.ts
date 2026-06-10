/**
 * Stub for the `server-only` package in test environment.
 *
 * `server-only` 在 React Server Components 中是一个 marker：被它 import 的模块
 * 一旦混入客户端 bundle 就会构建失败。运行时本身没有逻辑（仅暴露一个会抛错的函数）。
 *
 * Vitest 跑在 Node 环境，没有 RSC 边界，所以用空模块替换最安全。
 */
export {};
