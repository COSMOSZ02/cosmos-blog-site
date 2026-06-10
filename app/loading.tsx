/**
 * 全局 loading 骨架屏。
 *
 * 触发时机：
 * - 客户端导航 `<Link>` 时，如果路由 chunk 尚未就绪
 * - 未来任何动态路由（非 SSG）渲染过程中
 *
 * 当前所有路由都是 SSG，多数情况下用户感受不到这个组件 ——
 * 它的主要价值是兜底：让"卡白屏 → 显示页面"的过渡有一个克制的中间态。
 *
 * 设计取舍：
 * - 不模拟任何具体页面布局，因为它会被多种路由复用
 * - 用 `animate-pulse` 而不是 shimmer：克制、不抢注意力
 * - 占位条颜色用 `bg-zinc-200/70 dark:bg-zinc-800/70`，与全站分隔线同色
 * - 高度与首屏内容大致同高，避免出现"骨架屏短，加载完后内容把页面撑长"的跳动
 */
export default function Loading() {
  return (
    <main
      role="status"
      aria-label="加载中"
      aria-busy="true"
      className="mx-auto w-full max-w-3xl px-5 py-10"
    >
      <div className="animate-pulse space-y-8">
        {/* 模拟 H1 */}
        <div className="space-y-3">
          <div className="h-7 w-2/3 rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-4 w-1/3 rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>

        {/* 模拟正文段落 */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-4 w-[92%] rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-4 w-[80%] rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-[88%] rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-4 w-full rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-4 w-[70%] rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>

        {/* 模拟列表项分隔 */}
        <div className="space-y-4 border-t border-zinc-200/70 pt-6 dark:border-zinc-800/70">
          <div className="h-5 w-1/2 rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-5 w-2/5 rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>
      </div>

      {/* 屏幕阅读器额外提示 */}
      <span className="sr-only">页面加载中，请稍候。</span>
    </main>
  );
}
