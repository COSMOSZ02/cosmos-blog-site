import Link from "next/link";

interface BackLinkProps {
  /** 跳转目标，例如 `/blog`、`/works` */
  href: string;
  /** 链接展示文案，例如"返回列表"。前导 ← 由组件统一注入。 */
  text: string;
}

/**
 * 详情页头部的"← 返回 X"链接。
 *
 * 设计取舍：
 * - 抽出成组件**不是**因为代码很长（只有 4 行），而是因为：
 *   - "← 返回 X" 是站内多个详情页共享的视觉惯用语，应该有统一样式来源
 *   - 未来加 `/notes/[slug]`、`/talks/[slug]` 时直接 `<BackLink href text>` 一行解决
 * - 不抽 `<ArticleLayout>` 包装整个详情页：blog（长文 + TOC + 阅读时长）与
 *   works（图文作品集）演进路径会明显分化，过早合并会引入大量"开关 prop"。
 *
 * 视觉：低对比度灰文字 + hover 转深色，与 nav/footer 的链接风格一致。
 */
export function BackLink({ href, text }: BackLinkProps) {
  return (
    <nav className="mb-6 text-sm">
      <Link
        href={href}
        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← {text}
      </Link>
    </nav>
  );
}
