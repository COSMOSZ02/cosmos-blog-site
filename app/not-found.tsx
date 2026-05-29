import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-5 py-20 text-center">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        页面没找到
      </h1>
      <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        你访问的链接可能已经失效，或者页面尚未上线。
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        回到首页
      </Link>
    </main>
  );
}
