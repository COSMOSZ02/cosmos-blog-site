This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project Introduction

这是一个基于 Next.js 的个人网站，使用 TypeScript 编写。

## Project Structure

```
cosmos-blog-site/
├── app/                          # Next.js App Router（路由层）
│   ├── layout.tsx                # 根布局：字体 / 主题 / Nav / Footer / metadata / 分析
│   ├── page.tsx                  # 首页（hero + 最新文章 + 入口卡片）
│   ├── globals.css               # Tailwind v4 + @custom-variant dark + theme 变量映射
│   ├── loading.tsx               # 全局骨架屏
│   ├── not-found.tsx             # 全站 404
│   ├── error.tsx                 # 路由段错误边界
│   ├── global-error.tsx          # 根级崩溃兜底
│   ├── opengraph-image.tsx       # 站点根动态 OG 图（next/og）
│   ├── sitemap.ts                # /sitemap.xml（构建期生成）
│   ├── robots.ts                 # /robots.txt
│   ├── about/page.tsx            # 关于（读 content/about.mdx）
│   ├── blog/
│   │   ├── page.tsx              # 文章列表（按年份分组）
│   │   └── [slug]/page.tsx       # 文章详情（SSG + TOC + JSON-LD）
│   └── works/
│       ├── page.tsx              # 作品列表（按年份分组）
│       └── [slug]/page.tsx       # 作品详情（SSG + JSON-LD）
│
├── content/                      # ✨ 所有内容的源（mdx）
│   ├── about.mdx                 # 单页内容
│   ├── posts/                    # 博客文章
│   │   ├── _template.mdx         # 模板（以 _ 开头，自动跳过）
│   │   └── hello-world.mdx
│   └── works/                    # 作品集
│       ├── _template.mdx
│       └── this-blog.mdx
│
├── components/
│   ├── ui/                       # 通用组件
│   │   ├── BackLink.tsx          # "← 返回 X"
│   │   └── JsonLd.tsx            # <script type="application/ld+json">
│   ├── layout/                   # 站点骨架
│   │   ├── Nav.tsx               # 顶部导航（含移动端汉堡 + 主题切换）
│   │   └── Footer.tsx
│   ├── theme/                    # 主题切换体系
│   │   ├── ThemeProvider.tsx     # useSyncExternalStore 订阅 localStorage / 系统偏好
│   │   ├── ThemeToggle.tsx       # 三档循环按钮（light/dark/system）
│   │   ├── ThemeScript.tsx       # <head> 内联 FOUC 防护脚本
│   │   └── ThemeStyles.tsx       # 注入颜色 token CSS 变量
│   └── blog/
│       └── TableOfContents.tsx   # 详情页目录（collapsible / static 双形态）
│
├── lib/                          # 工具函数（多为 server-only）
│   ├── mdx.ts                    # 内容读取 / 解析 / 路径穿越防护 / 阅读时长
│   ├── mdx-options.ts            # MDXRemote 编译选项（remark/rehype 插件）SSOT
│   ├── content-schema.ts         # zod front-matter schema + 错误格式化
│   ├── toc.ts                    # 从 mdx 提取 H2/H3（与 rehype-slug 同款 id 算法）
│   ├── date.ts                   # formatDate（YYYY年MM月DD日）/ groupByYear
│   ├── profile.ts                # 站点 / 作者 / 导航 / 社交信息 SSOT
│   ├── site.ts                   # 站点 URL 解析链（getSiteUrl / absoluteUrl）
│   ├── theme.ts                  # 颜色 token SSOT + compileThemeCss
│   ├── structured-data.ts        # JSON-LD helper（BlogPosting / CreativeWork）
│   ├── utils.ts                  # cn() 类名合并
│   └── *.test.ts                 # vitest 单测（content-schema / mdx）
│
├── types/shims.d.ts              # gray-matter / reading-time 最小类型声明
├── .github/workflows/ci.yml      # GitHub Actions：lint → tsc → test → build
├── AGENTS.md                     # AI 协作规范（含 components 命名约定）
├── ROADMAP.md                    # 迭代开发计划（单一来源）
├── next.config.ts                # 远程图片白名单 + 安全响应头（含 CSP Report-Only）
├── vitest.config.mts             # 测试配置（server-only stub + @/ 别名）
├── eslint.config.mjs
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

## 环境变量与部署

### 站点 URL 解析链

`metadataBase` / OG / sitemap 等需要 absolute URL 的地方，统一从 `lib/site.ts` 的 `getSiteUrl()` 获取，按下面的优先级解析：

| 优先级 | 变量 | 来源 | 何时填 |
|---|---|---|---|
| 1 | `NEXT_PUBLIC_SITE_URL` | 你手动填 | 买了域名后在 Vercel Project → Environment Variables 加（如 `https://cosmos.example.com`） |
| 2 | `VERCEL_PROJECT_PRODUCTION_URL` | Vercel 自动注入 | production 部署的稳定子域（不带协议） |
| 3 | `VERCEL_URL` | Vercel 自动注入 | preview / branch 部署的临时子域 |
| 4 | `http://localhost:3000` | 兜底 | 本地开发 |

**当前状态**：还未购买域名，自动走 #2 / #3 的 `*.vercel.app` 子域。买域名后只需在 Vercel 加 `NEXT_PUBLIC_SITE_URL`，全站 metadata / sitemap 自动切换。

### Vercel 一键部署

1. push 到 GitHub
2. 在 Vercel 上 Import 仓库（建议关联 `master` 为 production 分支）
3. 不需要任何额外环境变量；首次部署后会自动绑定 `*.vercel.app`
4. 后续买了域名 → 在 Vercel 项目 Domains 里加自定义域 + 在 Environment Variables 加 `NEXT_PUBLIC_SITE_URL`

### CI

GitHub Actions 工作流见 `.github/workflows/ci.yml`：每次 push master / 任意 PR 都会跑 `lint` → `tsc --noEmit` → `test` → `build`。Actions 与 Vercel preview 部署互不影响，二者并存。

### 内容发布流程

文章 / 作品 / about 都是 `content/**/*.mdx` 文件。当前路由用 `dynamicParams = false`，**新增或修改 mdx 后需要 `git push` 触发 Vercel 重新 build 才能生效**（线上是构建期 SSG，不会运行时读文件）。

### 安全响应头与 CSP

`next.config.ts` 注入了 6 条安全响应头（X-CTO / X-FO / Referrer / Permissions / HSTS / **CSP Report-Only**）。CSP 当前为 **Report-Only 观察期**：

1. 部署到 Vercel preview 后，浏览全部页面（`/`、`/blog`、`/blog/[slug]`、`/works`、`/works/[slug]`、`/about`、暗黑切换）
2. DevTools → Console 检查 `[Report Only]` 开头的违规
3. 无违规 → 把 `next.config.ts` 中的 `Content-Security-Policy-Report-Only` 改为 `Content-Security-Policy` 上正式头

### 访客分析（Vercel）

接入两款 Vercel 官方分析（默认零配置 / 隐私友好）：

- **`@vercel/analytics`**：pageview + 来源；**不使用 cookie，不收集 IP / PII**
- **`@vercel/speed-insights`**：Web Vitals（LCP / FID / CLS / TTFB / FCP）

数据看板在 Vercel Project → Analytics / Speed Insights 标签页。

行为：
- 部署到 Vercel 时自动启用（控制台勾选即可，无需额外环境变量）
- 部署到非 Vercel 平台时两个 SDK 自动 no-op，不会报错
- 本地 `pnpm dev` 默认不上报数据，无需手动 disable

如不需要可安全删除：移除 `app/layout.tsx` 中的 `<Analytics />` / `<SpeedInsights />` 与对应 import，再 `pnpm remove @vercel/analytics @vercel/speed-insights`。