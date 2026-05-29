import Link from "next/link";
import { profile } from "@/lib/profile";

/**
 * 首页"去看看"区块的入口卡片。
 * 与顶部 Nav 不同，这里需要补一句简介，所以独立维护一份。
 */
const entries = [
  {
    href: "/blog",
    title: "博客",
    desc: "关于工程、阅读与生活的长文与碎想。",
  },
  {
    href: "/works",
    title: "作品集",
    desc: "做过的产品、写过的代码、按过的快门。",
  },
  {
    href: "/about",
    title: "关于",
    desc: "更详细的简历与联系方式。",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:py-24">
      {/* Hero：身份信息 */}
      <section className="mb-14">
        <p className="mb-3 font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {profile.handle}
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          你好，我是 {profile.name}。
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300">
          {profile.title} · {profile.location}
        </p>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-700 dark:text-zinc-200">
          {profile.bio}
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 入口卡片 */}
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          去看看
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="group flex h-full flex-col rounded-lg border border-zinc-200/70 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
              >
                <span className="flex items-center justify-between text-base font-medium">
                  {e.title}
                  <span
                    aria-hidden
                    className="text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-500"
                  >
                    →
                  </span>
                </span>
                <span className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {e.desc}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
