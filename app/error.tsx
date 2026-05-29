"use client";

// Error Boundary 必须是 Client Component。
// 仅捕获位于 app/error.tsx 包裹层级以下的渲染错误，
// 根 layout 自身的错误请使用 app/global-error.tsx。

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // 生产环境下，error.message 在 Server Component 抛出时会被脱敏，
    // 仅 digest 可用于跟服务端日志对账。
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-5 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">页面出错了</h1>
      <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        系统遇到了一个意外错误，可以尝试重试，或稍后再来。
      </p>
      {error.digest && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          错误编号：{error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        再试一次
      </button>
    </main>
  );
}
