import { profile } from "@/lib/profile";

/**
 * 全站底部。
 *
 * - 纯 server component：无交互、无状态。
 * - 内容来自 `lib/profile.ts`，与 Nav / Home 共享同一份 source of truth。
 */
export function Footer() {
  const year = new Date().getFullYear();
  const start = profile.copyrightStartYear;
  const yearText = year > start ? `${start}–${year}` : `${start}`;

  return (
    <footer className="mt-16 border-t border-zinc-200/70 dark:border-zinc-800/70">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>
          © {yearText} {profile.brand} ·{" "}
          <span className="text-zinc-400 dark:text-zinc-500">
            All rights reserved.
          </span>
        </p>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {profile.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
