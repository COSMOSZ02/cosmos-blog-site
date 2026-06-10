# Cosmos Blog Site · 迭代开发计划（ROADMAP）

> 本文件是后续开发的**单一来源（single source of truth）**。所有迭代任务从此处取，新任务也写到这里。  
> 用户会随时手动修改本文件以调整范围 / 优先级 / 验收标准，AI 在执行前请以**当前文件最新内容为准**。
>
> - 创建时间：2026-05-29
> - 当前版本：v1.0（基于 2026-05-29 的全面评估）
> - 维护方式：用户手动编辑 + AI 在每次迭代结束后追加进度

---

## 0. 项目背景

> 本节由用户填写，AI 在制定方案、做技术选型、写文案时应**始终参考本节内容**。  
> 留空字段请保留占位符 `_(待补充)_`，AI 不要自行猜测。

- **项目定位**：个人网站，主要展示个人信息、博客和摄影作品集，后续可能会追加更多内容
- **作者 / 站长简介**：_(待补充)_
- **内容方向（会写哪些主题）**：前端开发、科普、风光/天文摄影
- **设计基调 / 视觉偏好**：简约线条风格
- **部署环境与域名**：_(待补充)_
- **非目标（明确不做的事）**：_(待补充)_
- **其他补充**：_(待补充)_

---

## 1. 使用约定

1. 任务用 `- [ ]` / `- [x]` 标记进度，AI 完成后**立即勾选**对应项。
2. 每个任务前的 `P0-x / P1-x / P2-x / P3-x` 是稳定 ID，调整顺序时**不要改 ID**，便于回溯。
3. 优先级语义：
   - **P0**：阻塞 MVP 演示，必须最先做
   - **P1**：体验打磨，影响"是否像一个完整博客"
   - **P2**：技术债务，影响长期可维护性
   - **P3**：发布与可观测（SEO / OG / CSP / 分析），用户已声明暂缓
4. 如果某项任务被废弃，请改为 `- [~]` 并在后面注明原因，**不要直接删除**，便于查阅历史决策。
5. 用户可以直接在任意任务下追加子任务（缩进 2 空格 + `- [ ]`）。

---

## 2. 当前项目状态速览（截至 2026-05-29）

### 已完成
- Next 16 App Router 路由骨架：`/`、`/blog`、`/blog/[slug]`、`/works`、`/works/[slug]`、`/about`
- 三层错误兜底：`not-found.tsx` / `error.tsx` / `global-error.tsx`
- 内容管线 `lib/mdx.ts`：`server-only` + `React.cache` + 路径穿越校验 + draft 过滤 + 阅读时长
- MDX 编译选项 SSOT `lib/mdx-options.ts`：remark-gfm + rehype-slug + rehype-autolink-headings + rehype-pretty-code（`github-dark-dimmed`）
- 全局导航：`components/layout/{Nav,Footer}.tsx`，Nav 含移动端汉堡菜单
- 站点信息 SSOT：`lib/profile.ts`，Nav / Footer / Home 共享
- 首页"最新文章"模块：取 `getAllContent("posts")` 前 3 条
- TypeScript strict + ESLint 0 warning
- 安全响应头（X-CTO / X-FO / Referrer / Permissions / HSTS）+ 远程图片白名单
- 真实内容样本：`content/posts/hello-world.mdx`、`content/works/this-blog.mdx`

### 未完成 / 已知缺口
- 仅 1 篇真实文章 + 1 件作品（**内容侧**任务，非工程任务）
- TOC 当前阅读位置高亮（IntersectionObserver）尚未实现，作为后续增强
- 尚未购买域名（`NEXT_PUBLIC_SITE_URL` 未填）；当前 `metadataBase` 走 Vercel 自动注入的 `*.vercel.app` 子域
- CSP 处于 Report-Only 观察期；待部署后浏览观察，无违规即切正式头（R5 风险登记）

**整体 MVP 完成度估算：迭代 1 + 2 + 3 + 4 全部 P0/P1/P2/P3 任务收尾，约 100%**

完整评估详见对话历史中的"项目全面评估报告"，本文件只保留**可执行的任务清单**。

---

## 3. 迭代 1 · 让网站"看起来像一个网站"（P0，1-2 个工作日）

> 目标：随便给人看一眼，不会觉得是空壳。

- [x] **P0-1** 新建 `components/layout/Nav.tsx` + `Footer.tsx`，在 `app/layout.tsx` 中引入
  - Nav：Logo/Brand → `/`，链接 `/blog` `/works` `/about`，移动端汉堡菜单（client component）
  - Footer：站点 © + 社交链接（与首页 socials 复用同一份 source）
- [x] **P0-2** 抽 `lib/profile.ts`，把首页假数据搬过去；让 Footer / Nav / Home 共享同一个 source of truth
- [x] **P0-3** 安装并配置 `@tailwindcss/typography`（Tailwind 4 用法是在 `globals.css` 里 `@plugin`），让详情页 `prose` 真正生效
- [x] **P0-4** 抽 `lib/mdx-options.ts` 作为 MDX 编译选项的单一来源，给两个详情页的 `<MDXRemote>` 接上 `options={mdxOptions}`：
  - `remarkPlugins: [remarkGfm]`
  - `rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }], [rehypePrettyCode, { theme: "github-dark-dimmed", keepBackground: false }]]`
  - **不抽 `<MDXContent />` 组件**：blog（长文）与 works（摄影 / 项目）是两种不同的内容形态，未来注入的 MDX 组件、容器样式都会分化，过早抽组件会强行收敛差异（YAGNI）。两个详情页各自保留一行 `<MDXRemote ... />` 即可。
- [x] **P0-5** 写 2 篇真实 mdx 用于验收：
  - `content/posts/hello-world.mdx`（含 H2/H3、列表、代码块、引用、表格、图片）— 验收 P0-3、P0-4
  - `content/works/this-blog.mdx`（介绍这个博客本身）— 自我闭环
- [x] **P0-6** 首页加"最新 3 篇文章"模块：用 `getAllContent("posts")` 取前 3 条
- [x] **P0-7** 删掉 `styles/` 空目录（或在里面建实际样式文件，二选一）

**完成标准**：能用一台陌生设备打开站点，感受到"这是一个完整的小博客，有作者介绍 / 导航 / 文章 / 作品 / 兜底页"。

---

## 4. 迭代 2 · 内容体验打磨（P1，2-3 个工作日）

- [x] **P1-1** `app/about/page.tsx` 改为读 `content/about.mdx`，复用 `mdxOptions` 渲染。新增 `getSinglePage(name)` 走单页路径，不污染 `posts/works` collection 抽象。
- [x] **P1-2** 日期统一格式化为 `YYYY年MM月DD日`（月日两位补零）：抽 `lib/date.ts` 的 `formatDate`，未引入 `date-fns/format`（用原生 `Date`，保留 `<time dateTime={iso}>` 用于 a11y/SEO）。已接入 home / blog / works 列表 + blog / works 详情。
- [x] **P1-3** 列表页按年份分组：抽 `lib/date.ts` 的 `groupByYear`（用 `Map` 保插入顺序，无需重新排序）。blog / works 列表都改为左侧 sticky 年份 + 右侧 divide-y 列表的双列布局，移动端自动堆叠。
- [x] **P1-4** 暗黑模式手动切换 · **三档（light / dark / system），默认 light**：
  - `globals.css` 用 `@custom-variant dark (&:where(.dark, .dark *))`（Tailwind 4 类切换）
  - 颜色 SSOT：`lib/theme.ts` 导出 `themeTokens`，每个颜色形如 `{ light, dark }`；`compileThemeCss()` 编译为 `:root { --x } / :root.dark { --x }`
  - `components/theme/`：
    - `ThemeStyles.tsx`（server）注入颜色变量
    - `ThemeScript.tsx` 在 `<head>` 同步执行 FOUC 防护脚本
    - `ThemeProvider.tsx` 用 `useSyncExternalStore` 订阅 localStorage + matchMedia（避开 React 19 `set-state-in-effect` 规则）
    - `ThemeToggle.tsx` 三档循环按钮，已接入 Nav 右侧
  - `<html>` 加 `suppressHydrationWarning`（dark class 由内联脚本注入，是预期内的差异）
- [x] **P1-5** 详情页 TOC（仅 blog，works 不接入 —— 摄影/项目无 TOC 需求）：
  - `lib/toc.ts` 的 `extractHeadings()` 从 raw mdx 提取 H2/H3，用 `github-slugger` 保证 id 与 `rehype-slug` 完全一致；处理代码围栏 / markdown 强调标记
  - `components/blog/TableOfContents.tsx` 提供 `variant: "collapsible" | "static"` 两种渲染形态
  - blog 详情页：lg 以下用 collapsible 放在文章上方；lg+ 用 fixed sticky 浮在主体右侧空白处，定位公式 `right-[max(1rem,calc((100vw-48rem)/2-14rem))]`
  - 不做"当前阅读位置高亮"（IntersectionObserver），保持 server component 纯净，后续按需升级
- [x] **P1-6** 全局 `app/loading.tsx`：`animate-pulse` 灰条骨架屏，模拟 H1 + 段落 + 列表项；含 `role="status"` / `aria-busy` / `sr-only` 提示。当前所有路由 SSG，主要用于客户端导航过渡兜底。

**完成标准**：内容体验对齐主流个人博客。

---

## 5. 迭代 3 · 技术债务清理（P2，半天到 1 天）

- [x] **P2-1** 修订 `next.config.ts` 的 `images.remotePatterns`：删除无效的多段通配 `*.cos.ap-*.myqcloud.com`；同时把 `*.myqcloud.com` / `*.aliyuncs.com` / `*.r2.cloudflarestorage.com` 全部改为前缀 `**.` 通配，因为云存储真实域名都是多段子域（单 `*` 只匹配一段，无法命中 `bucket.cos.ap-shanghai.myqcloud.com` 这类域）。加注释说明 `*` vs `**` 区别避免后人改错。
- [x] **P2-2** 升 `@types/node` 到 `^22`（实测 22.19.20）+ `package.json` 加 `engines: { node: ">=20.18" }`。本机 Node 由用户自行升级（任务范围外）。`pnpm install` / `pnpm lint` / `pnpm exec tsc --noEmit` / `pnpm build` 全绿。
- [x] **P2-3** 把 front-matter 校验改成 `zod` schema：新增 `lib/content-schema.ts` 集中两个 schema（article / single-page），类型用 `z.infer<>` 推导（避免 schema/类型漂移）；`parseFrontMatter()` 把 ZodError 格式化为多行可读错误（`校验失败：\n  - <path>: <msg>`）。`lib/mdx.ts` 删除 `normalizeFrontMatter` 与 `getSinglePage` 内联校验。**严格化**：`date` 必须 `YYYY-MM-DD` 格式（`z.iso.date()`）、`tags` 元素必须非空字符串（不再静默过滤）。验证：临时把合法 date 改为非法值，`pnpm build` 准确抛出"校验失败：\n  - date: date 必须是 YYYY-MM-DD 格式"，证明拦截链路通畅。
- [x] **P2-4** 引入 `vitest@^3` 单元测试框架（vitest 4.x 因 rolldown native binding 在 pnpm 严格 hoisting 下失败，降到 3.x）；新增 `vitest.config.mts`（含 `server-only` alias stub 和 `@/` 别名）+ `tests/stubs/server-only.ts`；新增 `pnpm test` / `pnpm test:watch` script。覆盖范围：
  - **`lib/content-schema.test.ts`**（22 用例）：schema 合法/非法路径、date 6 种格式、tags 严格化、draft 缺省、错误信息聚合、`parseFrontMatter` 抛错路径
  - **`lib/mdx.test.ts`**（10 用例）：`isContentFile` 约定、`resolveContentPath` 路径穿越（`../etc/passwd` / `foo/bar` / 特殊字符 / 空 slug）、`listSlugs` 真实 fixtures + 过滤
  - 把 `lib/mdx.ts` 中 `isContentFile` / `resolveContentPath` / `listSlugs` 改为 export（纯函数，零风险）以便单测
  - 不做端到端 `getAllContent` 集成测试，留待内容增多后按需补
- [x] **P2-5（降级版）** 评估后**不抽** `<ArticleLayout>` 大组件 —— 原 ROADMAP 描述"详情页只剩 collection 名称差异"与现实不符（blog 有 TOC + readingTime，works 有 cover 倾向但无 TOC，演进路径会进一步分化），过早合并会引入大量"开关 prop"。仅抽 `components/ui/BackLink.tsx`（4 行视觉惯用语 → 通用组件），blog/works 详情页接入。这一改动为未来新增 detail 页（notes / talks）打基础，不强行收敛差异。
- [x] **P2-6** 新增 `.github/workflows/ci.yml`：单 job `verify`，按 install (frozen-lockfile) → lint → tsc --noEmit → test → build 顺序执行（**比原 ROADMAP 多了 `pnpm test`**，因 P2-4 已引入 vitest）。触发：push master + 任意 PR。`concurrency` 自动取消同 ref 的过期 run 节省 quota。Node 22 + pnpm 8.15.6 与本机 / `engines.node` 对齐。本地完整模拟 CI 链路通过。
- [x] **P2-7** `AGENTS.md` 追加 "Components 命名与组织规范" 一节：明确目录边界（ui / layout / theme / `<route>`）、PascalCase 文件名 + 命名导出 + 不用 `.client/.server` 后缀 + 何时新建二级目录。同时删除已无意义的 `components/.gitkeep`（4 个二级目录已实际存在）。零代码改动 / 不引入 lint 强制规则（约定 + Code review 即可）。

**完成标准**：内部代码可持续迭代，未来加内容/页面不需要复制粘贴。

---

## 6. 迭代 4 · 发布与可观测（P3，已完成）

- [x] **P3-1** 完整 metadata 体系：
  - 前置 `lib/site.ts`：`getSiteUrl()` 解析链 `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `http://localhost:3000`，未购域名不会卡住
  - 扩 `lib/profile.ts`：新增 `siteDescription`（站点视角，与 hero 用的第一人称 `bio` 区分）、`locale: "zh_CN"`、`twitterHandle`
  - `app/layout.tsx` 根 metadata：`metadataBase` + `title.template` (`%s · 宇宙`) + applicationName + authors + 默认 OG/Twitter + `robots: index, follow`
  - 静态子页面 `/blog`、`/works` 直接 `export const metadata`；`/about` 用 `generateMetadata` 从 `content/about.mdx` front-matter 推导
  - 详情页 `/blog/[slug]`、`/works/[slug]` 用 `generateMetadata({ params })`，含 `og:type=article` + `article:published_time` + `article:tag`
  - README 追加"环境变量与部署"章节，说明买域名前后的切换路径
  - 验证：实际 HTML 含完整 `<title>` / canonical / og:* / twitter:* / article:tag 等 meta
- [x] **P3-2** `app/sitemap.ts` + `app/robots.ts`（Next 16 metadata file convention，构建期编译为 `/sitemap.xml` / `/robots.txt`）：
  - sitemap 包含 home + `/blog`、`/works`、`/about` 静态页 + 全部 blog/works 详情；详情页 `lastModified` 取 front-matter date（不取 mtime）
  - `changeFrequency` / `priority` 按页面类型分级（home 1.0 / 列表页 0.8 / about 0.6 / 详情 0.7）
  - robots 全开放（无 admin / 私有路由），含 Host + Sitemap 字段
  - URL 全部经过 `lib/site.ts` 解析链：本地构建用 `localhost:3000`，Vercel 自动切到 `*.vercel.app`，未来配 `NEXT_PUBLIC_SITE_URL` 切自定义域 —— 全部 6 条 URL 验证产物正确
- [x] **P3-3（中范围）** OG 图混合方案：
  - 根 `app/opengraph-image.tsx`：动态生成（next/og + edge runtime），1200×630 简约线条版式 —— 大字 `cosmos.` + 顶部 `@cosmos` + 底部 `frontend · writing · photography`
  - **不加载中文字体**（避免 satori 在 Edge runtime 加载 Noto Sans SC 子集 ~500KB+ 的成本与不稳定），OG 图文案统一用拉丁字符；HTML 中的 `og:title` / `twitter:title` 等文本仍是中文（社媒平台原生支持）
  - 详情页 `og:image`：`generateMetadata` 中接 `cover` 字段 → 有 cover 用文章 / 作品自己的封面，无 cover 不出图（社媒回落到根 OG）
  - 验证：home HTML 含完整 og:image / twitter:image 五件套；blog/works 详情无 cover 时 HTML 无 og:image（设计如此）
  - **不做** `app/{blog,works}/[slug]/opengraph-image.tsx` 动态生成兜底（成本不匹配，留待真有需要再升级）
- [x] **P3-4（中范围）** JSON-LD 结构化数据：
  - `lib/structured-data.ts`：`articleJsonLd(post)` → `BlogPosting` schema；`workJsonLd(work)` → `CreativeWork` schema（摄影 / 项目作品的最自然类型）
  - `components/ui/JsonLd.tsx`：通用 server component，渲染 `<script type="application/ld+json">`
  - blog/works 详情页接入；author 节点复用（共享 Person）；image / keywords 等可选字段缺失时由 `JSON.stringify` 自动跳过
  - `inLanguage` 用 BCP 47 `zh-CN`（与 OG 的 `zh_CN` 区分）
  - **不做** `WebSite` schema（个人站作用很小）、不做 `BreadcrumbList`（站内已有"返回列表"按钮）
  - 验证 HTML：两个详情页 JSON-LD 完整正确，无 cover 时自动省略 image 字段
- [x] **P3-5** CSP Report-Only 上线观察。`next.config.ts` 加 `cspDirectives` 常量（10 条 directive：default/script/style/img/font/connect/frame-ancestors/base-uri/form-action/upgrade-insecure-requests）+ 详细注释说明每条选择理由。运行时验证 6 个安全响应头全部下发：`Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline'; ...`。**关键设计决定**：保留 `'unsafe-inline'`（因 Next 16 RSC + ThemeScript / JsonLd 内联块），不上 nonce 中间件方案（与全 SSG 架构冲突）。下一步：部署后浏览器 DevTools 观察违规，再切到正式 `Content-Security-Policy` 头。
- [x] **P3-6** 接入 `@vercel/analytics` + `@vercel/speed-insights`：在 `app/layout.tsx` 的 `<body>` 末尾、`ThemeProvider` 之外挂 `<Analytics />` + `<SpeedInsights />`。隐私友好（不用 cookie / 不收集 PII）；非 Vercel 平台 / 本地 dev 自动 no-op。README 追加"访客分析"说明 + 顺手补回 P3-1 时丢失的"环境变量与部署"完整章节（含站点 URL 解析链 / 一键部署 / CI / 内容发布流程 / 安全响应头与 CSP）。

---

## 7. 风险登记表（不在迭代任务内，但执行时要留意）

| ID | 风险 | 触发条件 / 影响 | 处置策略 |
|----|------|------|------|
| R1 | `prose` 类不生效 | 详情页正文裸 HTML | P0-3 解决 |
| R2 | 远程图片不在白名单 | `next/image` 运行时报错 | 写文档说明白名单维护方式 |
| R3 | `dynamicParams=false` + 新文章未 rebuild → 404 | 新增内容必须重新构建 | 写入 README "发布流程" 段；后期可改 ISR |
| R4 | 公私环境变量语义混淆 | `NEXT_PUBLIC_*` 会进客户端 bundle | 在 `lib/profile.ts` 里集中读取，注释写清 |
| R5 | CSP 切到正式头时打挂资源 | 现 Report-Only 漏配 directive 在正式头下变拦截 | 部署到 Vercel preview 后浏览各页面观察 DevTools 控制台违规；调整后再切正式头 |

---

## 8. 进度日志（AI 每次完成迭代后追加）

> 格式：`YYYY-MM-DD · 迭代 X · 完成项：P0-1, P0-2 ...  · 备注：...`

- 2026-05-29 · 创建 ROADMAP，迭代尚未开始
- 2026-05-29 · 迭代 1 · 完成项：P0-1, P0-2, P0-3 · 备注：新增 `lib/profile.ts` 作为站点信息单一来源；`components/layout/{Nav,Footer}.tsx` 接入 RootLayout，Nav 含移动端汉堡菜单；安装并通过 `@plugin` 加载 `@tailwindcss/typography`。`pnpm lint` / `tsc --noEmit` / `pnpm build` 全部通过。
- 2026-05-29 · 迭代 1 · 完成项：P0-4, P0-5 · 备注：抽 `lib/mdx-options.ts` 作为 MDX 编译选项 SSOT；评估后**不抽** `<MDXContent />` 组件（blog 长文 vs works 摄影/项目，差异会扩大，YAGNI）。两个详情页接入 `options={mdxOptions}`。新增 `content/posts/hello-world.mdx`（覆盖 H2/H3/列表/代码/引用/表格/图片）与 `content/works/this-blog.mdx`（项目作品自我介绍）。`pnpm build` 输出 9 个静态路由含 `/blog/hello-world` 与 `/works/this-blog`。
- 2026-05-29 · 迭代 1 · 完成项：P0-6, P0-7 · 备注：首页新增"最新文章"区块（最多展示 3 篇 + "查看全部"链接，与 hero 和"去看看"卡片样式区分使用 divide-y 列表风格，更轻盈）；删除空目录 `styles/`，全仓 0 处引用。**迭代 1 全部完成**，`pnpm lint` / `pnpm build` 全绿，9 个静态路由全部正常。
- 2026-06-02 · 迭代 2 · 完成项：P1-1, P1-2, P1-3 · 备注：新增 `lib/date.ts`（`formatDate` 输出 `YYYY年MM月DD日`、`getYear`、`groupByYear`），原生 `Date` 实现避免 `date-fns/format` bundle；blog / works 列表改造为"左侧 sticky 年份 + 右侧 divide-y"双列布局，移动端自动堆叠；`/about` 改为读 `content/about.mdx`，新增 `getSinglePage(name)` 走单页路径不污染 collection 抽象。`pnpm lint` / `pnpm build` 全绿。
- 2026-06-02 · 迭代 2 · 完成项：P1-4 · 备注：暗黑模式手动切换，三档（light / dark / system，默认 light）。颜色 SSOT 抽到 `lib/theme.ts` 的 `themeTokens`，结构 `{ name: { light, dark } }`，`compileThemeCss()` 编译为 `:root` / `:root.dark` 的 CSS 变量；`globals.css` 切换为 `@custom-variant dark (&:where(.dark, .dark *))`（删除原 `@media prefers-color-scheme`）；`<head>` 内联 `ThemeScript` 同步注入 dark class，无 FOUC；`ThemeProvider` 用 `useSyncExternalStore` 订阅 localStorage + matchMedia，绕开 React 19 `react-hooks/set-state-in-effect`；`ThemeToggle` 加入 Nav 右侧。`pnpm lint` / `pnpm build` 全绿。
- 2026-06-02 · 迭代 2 · 完成项：P1-5, P1-6 · 备注：新增 `lib/toc.ts` 的 `extractHeadings()`（用 `github-slugger` 与 rehype-slug 同款 id 算法，处理代码围栏 / 强调标记），`components/blog/TableOfContents.tsx` 双 variant（collapsible / static）；blog 详情页 lg+ 浮在主体右侧 sticky，lg 以下 details 折叠；works 不接 TOC（摄影/项目场景）。新增 `app/loading.tsx` 全局骨架屏（animate-pulse 灰条 + a11y）。验证：HTML 中 `id=` 与 TOC `href=` 7 个锚点完全对应。`pnpm lint` / `pnpm build` 全绿。**迭代 2 全部完成。**
- 2026-06-10 · 迭代 3 · 完成项：P2-1 · 备注：修订 `next.config.ts` 的 `remotePatterns`：删除无效多段通配 `*.cos.ap-*.myqcloud.com`；将所有 `*.<host>` 改为 `**.<host>`（Next 的单 `*` 只匹配一段子域，无法命中云存储多段子域如 `bucket.cos.ap-shanghai.myqcloud.com`）。加注释说明 `*` vs `**` 差异。`pnpm lint` / `pnpm build` 全绿。
- 2026-06-10 · 迭代 3 · 完成项：P2-2 · 备注：`@types/node` 从 20.19.41 升级到 22.19.20；`package.json` 新增 `engines: { node: ">=20.18" }`（宽松下限，兼容当前与未来）。本机 Node 升级由用户自行处理。`pnpm lint` + `tsc --noEmit` + `pnpm build` 全绿。
- 2026-06-10 · 迭代 3 · 完成项：P2-3 · 备注：引入 `zod@4.4.3`（仅 server-only 路径使用，客户端 bundle 零影响）；新增 `lib/content-schema.ts` 集中 `articleFrontMatterSchema` / `singlePageFrontMatterSchema`，类型 `z.infer<>` 推导；`parseFrontMatter()` 包装 ZodError 为多行可读错误。删除 `lib/mdx.ts` 的 `normalizeFrontMatter` 与单页内联校验。严格化：`date` 必须 `YYYY-MM-DD`、`tags` 元素必须非空字符串。反向测试：临时改 date 为非法值，build 准确抛出"`校验失败：\n  - date: date 必须是 YYYY-MM-DD 格式`"；`git checkout` 还原后 build 重新通过。
- 2026-06-10 · 迭代 3 · 完成项：P2-4 · 备注：引入 `vitest@^3`（vitest 4 + pnpm 严格 hoisting 有 rolldown native binding 缺失问题，降到 3）；`vitest.config.mts` 走 `.mts` 强制 ESM 加载（避免 vite 7 ESM 与 vitest 3 cjs config loader 在 Node 20.18 下的 ERR_REQUIRE_ESM）；`server-only` alias 替换为空 stub。新增 32 个用例（schema 22 + IO 10）：合法/非法 front-matter、date 严格 ISO、tags 严格化、错误聚合、路径穿越、文件名约定、listSlugs 真实 fixtures。`pnpm test` / `pnpm lint` / `tsc --noEmit` / `pnpm build` 全绿。
- 2026-06-10 · 迭代 3 · 完成项：P2-5（降级版） · 备注：评估后**不抽** `<ArticleLayout>` 大组件（原任务前提"只剩 collection 名称差异"与现实不符），仅抽 `components/ui/BackLink.tsx` —— blog/works 详情页接入。决策理由：blog（长文 + TOC + 阅读时长）与 works（图文作品集，无 TOC）演进路径分化，过早合并会引入开关 prop 复杂度，符合 P0-4 已确立的"不强行收敛差异"原则。32 个测试全绿。
- 2026-06-10 · 迭代 3 · 完成项：P2-6 · 备注：新增 `.github/workflows/ci.yml`（GitHub Actions）。单 job 按 install (frozen-lockfile) → lint → tsc → test → build 顺序执行；触发 push master + PR；`concurrency` 取消重复 run 节省 quota；Node 22 + pnpm 8.15.6 与本机对齐。比原 ROADMAP 描述多了 `pnpm test`（P2-4 引入的 vitest 32 用例）。本地完整模拟链路通过。
- 2026-06-10 · 迭代 3 · 完成项：P2-7 · 备注：`AGENTS.md` 追加 "Components 命名与组织规范" 一节（目录边界 / PascalCase / 命名导出 / 不用 `.client.tsx` 后缀 / 何时新建二级目录）；删除 `components/.gitkeep`。**迭代 3 全部完成** —— 迭代 1+2+3 全部 P0/P1/P2 任务收尾。
- 2026-06-10 · 迭代 4 · 完成项：P3-1 · 备注：完整 metadata 体系。前置 `lib/site.ts` 站点 URL 解析链（适配未购域名场景，Vercel 自动注入兜底）；`lib/profile.ts` 加 `siteDescription` / `locale` / `twitterHandle`；根 layout `metadataBase` + `title.template`；6 个页面（3 静态 + 2 动态详情 + 1 single-page）补 metadata，约束信息从 mdx front-matter / profile 派生不重复硬编码；README 追加"环境变量与部署"章节。验证：HTML 实测含完整 title/canonical/og:*/twitter:*/article:tag。`pnpm lint` / `tsc --noEmit` / `pnpm test` (32) / `pnpm build` 全绿。
- 2026-06-10 · 迭代 4 · 完成项：P3-2 · 备注：`app/sitemap.ts` + `app/robots.ts`（Next 16 metadata file convention）。sitemap 6 条 URL（home + 3 静态 + 全部 blog/works 详情），详情页 lastModified 取 front-matter date；按页面类型分级 priority 与 changeFrequency。robots 全开放，含 Host + Sitemap。验证 prerender 缓存的 .body 文件，URL/字段全部正确，未来切自定义域时 base URL 会跟随 metadataBase 自动切换。
- 2026-06-10 · 迭代 4 · 完成项：P3-3（中范围） · 备注：根 `app/opengraph-image.tsx` 动态生成（next/og + edge runtime），1200×630 简约线条版式（拉丁字符 cosmos. + 三联领域），**不加载中文字体**避开 Edge runtime 字体踩坑；详情页 og:image 走"front-matter cover 优先"策略，无 cover 不出图（社媒回落到根 OG）。修复 P3-1 时 works/[slug] generateMetadata 没保存的小遗漏。验证 home HTML 含完整 og:image 五件套；详情无 cover 时 HTML 确实无 og:image。`pnpm lint` / `tsc --noEmit` / `pnpm build` 全绿。
- 2026-06-10 · 迭代 4 · 完成项：P3-4（中范围） · 备注：JSON-LD 结构化数据。`lib/structured-data.ts` 提供 `articleJsonLd`（BlogPosting）与 `workJsonLd`（CreativeWork）；`components/ui/JsonLd.tsx` 通用 server component。两个详情页接入，author/publisher 复用 Person 节点；inLanguage 用 BCP 47 `zh-CN`；undefined 字段（如无 cover 时的 image）由 JSON.stringify 自动跳过。验证 HTML 注入完整。32 测试 / lint / build 全绿。
- 2026-06-10 · 迭代 4 · 完成项：P3-5 · 备注：`next.config.ts` 添加 `Content-Security-Policy-Report-Only` 头，10 条 directive，含详细注释。**保留** `'unsafe-inline'`：Next 16 RSC + ThemeScript / JsonLd 内联块需要；nonce 方案会与全 SSG 架构冲突。`pnpm start` curl 验证 6 个安全头全部正确下发。R5 风险登记：部署到 Vercel preview 后须浏览观察 DevTools 控制台违规再切正式头。
- 2026-06-10 · 迭代 4 · 完成项：P3-6 · 备注：装 `@vercel/analytics@2.0.1` + `@vercel/speed-insights@2.0.0`，在 `app/layout.tsx` body 末尾挂载。隐私友好（无 cookie / 无 PII）；非 Vercel 平台 / 本地 dev 自动 no-op。顺手补回 P3-1 时丢失的 README "环境变量与部署" 章节（含 URL 解析链、Vercel 一键部署、CI、内容发布流程、安全响应头与 CSP、访客分析 6 节）。**迭代 4 全部完成 —— 全部 4 个迭代 / 26 项任务收尾。**

---

## 9. 待讨论 / 待用户确认

- [x] 暗黑模式（P1-4）是否做手动切换？→ **已确认：做手动切换，三档 light/dark/system，默认 light**（2026-06-02）
- [x] TOC（P1-5）按移动端优先还是桌面优先做？→ **已确认：桌面右侧 sticky 为主，移动端 details/summary 折叠**（2026-06-02）
- [x] 是否引入 zod（P2-3）？→ **已确认：引入**（2026-06-10）。修正：之前估算"bundle +8KB"有误，实际 zod 仅在 `lib/mdx.ts`（server-only）使用，**对客户端 bundle 零影响**。
- [x] CI（P2-6）平台用 GitHub Actions 还是 Vercel 自带？→ **已确认：GitHub Actions**（2026-06-10）。理由：Vercel 自带 CI 只跑 `next build`，无法覆盖 lint / tsc / vitest；二者并存（Actions 跑测试链 + Vercel 跑预览部署）是最佳实践。

---

> **下次开始**：建议从 **P0-3 + P0-4**（typography + MDX 选项）切入——成本低、视觉收益最大。
