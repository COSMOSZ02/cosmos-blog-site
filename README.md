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

## Project Structure Planning

cosmos-blog-site/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 首页（你是谁）
│   ├── about/page.tsx            # 简历详情
│   ├── blog/
│   │   ├── page.tsx              # 文章列表
│   │   └── [slug]/page.tsx       # 文章详情
│   ├── works/                    # 作品集
│   │   ├── page.tsx              # 作品列表
│   │   └── [slug]/page.tsx       # 作品详情
│   └── api/
│       └── download/route.ts     # 文件下载代理（可选）
│
├── content/                      # ✨ 所有内容的源
│   ├── posts/                    # 博客文章 .mdx
│   │   ├── 2026-05-28-hello.mdx
│   │   └── ...
│   └── works/                    # 作品集 .mdx
│       └── photo-shenzhen.mdx
│
├── components/                   # UI 组件
│   ├── ui/                       # 通用组件
│   ├── BlogCard.tsx
│   └── WorkCard.tsx
│
├── lib/                          # 工具函数
│   ├── mdx.ts                    # MDX 处理
│   └── storage.ts                # 对象存储 URL 拼接
│
├── public/                       # 小静态资源（favicon、logo）
│   └── ...
│
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json

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