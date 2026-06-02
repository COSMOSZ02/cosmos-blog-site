"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * 顶部全局导航。
 *
 * - Desktop：水平排布，hover/active 用下划线提示当前路由。
 * - Mobile：右侧汉堡按钮展开下拉菜单，点击菜单项后自动收起。
 *
 * 设计基调：简约线条风格 —— 不使用色块，仅靠 1px 边框 + 文字 hover。
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // 打开菜单时锁定 body 滚动，避免下拉菜单与页面同时滚动
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-[var(--background)]/85 backdrop-blur-md dark:border-zinc-800/70">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-5">
        <Link
          href="/"
          onClick={close}
          className="font-mono text-sm tracking-tight text-zinc-900 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          {profile.brand}
          <span className="text-zinc-400 dark:text-zinc-500">.</span>
        </Link>

        {/* 右侧：desktop nav + 主题切换；mobile 仅展示主题切换 + 汉堡 */}
        <div className="flex items-center gap-1 sm:gap-5">
          <nav aria-label="主导航" className="hidden sm:block">
            <ul className="flex items-center gap-6 text-sm">
              {profile.nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "underline-offset-[6px] transition-colors",
                        active
                          ? "text-zinc-900 underline dark:text-zinc-50"
                          : "text-zinc-500 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ThemeToggle />

          {/* Mobile toggler */}
          <button
            type="button"
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 sm:hidden dark:text-zinc-200 dark:hover:bg-zinc-800/60"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="移动端导航"
          className="border-t border-zinc-200/70 sm:hidden dark:border-zinc-800/70"
        >
          <ul className="mx-auto flex w-full max-w-3xl flex-col px-5 py-2">
            {profile.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block py-3 text-sm transition-colors",
                      active
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

/**
 * 当前路由是否匹配 nav 项。
 * - 精确匹配 `/foo`
 * - 也匹配子路由 `/foo/bar`，避免详情页时父级失高亮
 */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}
