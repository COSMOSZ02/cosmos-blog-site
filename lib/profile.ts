/**
 * 站点 / 作者 / 导航 / 社交链接的单一来源（single source of truth）。
 *
 * Nav、Footer、Home 等多处共享本文件，修改这里即可同步更新。
 *
 * 安全提示：本文件只放可公开的数据，不要写入任何密钥 / 私密邮箱。
 */

export type SocialLink = {
  /** 展示文案 */
  label: string;
  /** 跳转地址，外链请使用绝对 URL，邮件用 mailto: */
  href: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type Profile = {
  /** 站点品牌名 / 顶部 logo 文案 */
  brand: string;
  /** 站长姓名（首页 hero 用） */
  name: string;
  /** 简短 handle（如 @cosmos） */
  handle: string;
  /** 头衔 / 身份 */
  title: string;
  /** 所在地 */
  location: string;
  /**
   * 一句话简介（首页 bio 段落，**第一人称视角**）。
   * 用于人对人的展示场景；SEO / 元数据请用 `siteDescription`。
   */
  bio: string;
  /**
   * 站点描述（**第三人称 / 站点视角**），用于 `<meta name="description">`、
   * OG description、sitemap 等 SEO 场景。
   */
  siteDescription: string;
  /**
   * 站点语言。用于 `<html lang>` 与 `openGraph.locale`。
   * 与 `app/layout.tsx` 的 `<html lang="zh-CN">` 保持一致。
   */
  locale: string;
  /**
   * Twitter / X 用户名（不含 @），用于 `twitter:creator` / `twitter:site`。
   * 留空则不输出对应 meta。
   */
  twitterHandle?: string;
  /** 顶部导航 */
  nav: readonly NavLink[];
  /** 社交链接（首页 / Footer 共享） */
  socials: readonly SocialLink[];
  /** Footer 版权起始年份 */
  copyrightStartYear: number;
};

export const profile: Profile = {
  brand: "宇宙",
  name: "宇宙",
  handle: "@cosmos",
  title: "前端工程师 / 独立开发者",
  location: "北京 · Beijing",
  bio: "热爱构建顺手的工具与克制的产品。最近在折腾博客系统、设计系统与一些个人小项目。",
  siteDescription:
    "宇宙的个人空间：前端开发、科普文章与风光 / 天文摄影作品集。一个克制、可读的小博客。",
  locale: "zh_CN",
  twitterHandle: undefined,
  nav: [
    { label: "博客", href: "/blog" },
    { label: "作品", href: "/works" },
    { label: "关于", href: "/about" },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "X", href: "https://x.com/" },
  ],
  copyrightStartYear: 2026,
};
