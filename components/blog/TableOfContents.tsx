import type { TocItem } from "@/lib/toc";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  items: TocItem[];
  /**
   * 渲染形态：
   * - `collapsible`：用 `<details>` / `<summary>` 折叠，适合移动端 / 窄屏
   * - `static`：直接渲染列表 + "目录"标题，适合桌面 sticky 容器
   */
  variant: "collapsible" | "static";
  /** 外层容器的额外 className，调用方负责定位（sticky / fixed / margin） */
  className?: string;
}

/**
 * 文章目录 / Table of Contents。
 *
 * - server component：纯展示，无交互
 * - 列表为空时整体不渲染，避免出现"目录"标题但下面是空的
 * - 后续如要做"当前阅读位置高亮"，再改造为 client + IntersectionObserver
 */
export function TableOfContents({
  items,
  variant,
  className,
}: TableOfContentsProps) {
  if (items.length === 0) return null;

  if (variant === "collapsible") {
    return (
      <nav aria-label="文章目录" className={className}>
        <details>
          <summary className="cursor-pointer select-none list-none text-sm font-medium uppercase tracking-wider text-zinc-500 marker:hidden dark:text-zinc-400 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1">
              目录
              <span aria-hidden className="text-zinc-400 dark:text-zinc-500">
                ▾
              </span>
            </span>
          </summary>
          <TocList items={items} className="mt-3" />
        </details>
      </nav>
    );
  }

  return (
    <nav aria-label="文章目录" className={className}>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        目录
      </h2>
      <TocList items={items} />
    </nav>
  );
}

function TocList({
  items,
  className,
}: {
  items: TocItem[];
  className?: string;
}) {
  return (
    <ol className={cn("space-y-2 text-sm", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn("leading-snug", item.level === 3 && "pl-3")}
        >
          <a
            href={`#${item.id}`}
            className="text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
