import "server-only";

import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";

import type { MDXRemoteProps } from "next-mdx-remote/rsc";

/**
 * MDX 编译选项的单一来源。
 *
 * 设计取舍：
 * - 此处只放真正"内容稳定且共享"的 remark/rehype 插件配置，
 *   不抽 `<MDXContent />` 组件 —— 因为 blog 与 works 是两种不同的内容形态
 *   （长文 vs 摄影集），未来注入的 MDX 组件、容器样式都会分化，
 *   抽组件会过早收敛差异（YAGNI）。
 * - 详情页只需 `<MDXRemote source={raw} options={mdxOptions} />`，
 *   维持各自的 wrapper（`<article className="prose ...">` 等）即可。
 */

/**
 * rehype-pretty-code 主题配置。
 *
 * - 用 `github-dark-dimmed`：与 GitHub 暗色 UI 一致，亮色页面下也不刺眼。
 * - keepBackground 关闭，让代码块背景跟随 prose 的 `pre` 样式（typography 控制），
 *   避免双重背景在亮 / 暗模式间打架。
 */
const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: "github-dark-dimmed",
  keepBackground: false,
};

/**
 * 标题锚点配置。
 *
 * - `behavior: "wrap"`：让整段标题文本变成可点击锚点，
 *   配合 `rehype-slug` 注入的 `id` 属性，可直接 `#section-name` 跳转，
 *   也方便后续 P1-5 做侧边 TOC。
 */
const autolinkOptions = {
  behavior: "wrap" as const,
  properties: {
    className: ["heading-anchor"],
  },
};

/**
 * 给 `<MDXRemote>` 的 `options` prop 用。
 *
 * 注意：本对象**不要在 client component 中导入**，
 * 它依赖的 plugin 体积很大且只在服务器编译期使用。
 * 文件已 `import "server-only"` 兜底。
 */
export const mdxOptions: NonNullable<MDXRemoteProps["options"]> = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, autolinkOptions],
      [rehypePrettyCode, prettyCodeOptions],
    ],
  },
};
