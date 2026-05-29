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
- `/about` 仍是裸占位（迭代 2 会改成 mdx 渲染）
- 列表页日期未本地化、未按年份分组（迭代 2）
- 暗黑模式只跟系统，无手动切换（迭代 2）
- 详情页无 TOC、无 loading 骨架屏（迭代 2）
- `app/layout.tsx` 的 metadata 仍是 `Create Next App`（迭代 4，已声明暂缓）
- 仅 1 篇真实文章 + 1 件作品

**整体 MVP 完成度估算：迭代 1 全部完成，约 70%**

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

- [ ] **P1-1** `app/about/page.tsx` 改为读 `content/about.mdx`，用 `MDXContent` 渲染（让"关于"页也走 MDX 体系）
- [ ] **P1-2** 列表页日期格式化：用 `date-fns` 输出 `2026-05-28 → 2026 年 5 月 28 日` 或 `5 月 28 日, 2026`
- [ ] **P1-3** 列表页按年份分组（`grouped = groupBy(posts, p => p.date.slice(0,4))`）
- [ ] **P1-4** 暗黑模式手动切换：
  - 改 `globals.css` 用 `@variant dark (&:where(.dark, .dark *))`（Tailwind 4 写法）
  - 加 `components/ui/ThemeToggle.tsx`（client）
  - `<head>` 内联无闪烁脚本（受控来源，可用 `dangerouslySetInnerHTML`）
- [ ] **P1-5** 详情页加"目录（TOC）"：从 `rehype-slug` 注入的 id 提取，desktop 右侧 sticky，mobile 折叠
- [ ] **P1-6** 加 `app/loading.tsx`（最小骨架屏）

**完成标准**：内容体验对齐主流个人博客。

---

## 5. 迭代 3 · 技术债务清理（P2，半天到 1 天）

- [ ] **P2-1** 删除 `next.config.ts` 中无效的 `*.cos.ap-*.myqcloud.com` 多段通配（`*.myqcloud.com` 已覆盖）
- [ ] **P2-2** `@types/node` 升到 `^22`，本机 Node 同步升到 22 LTS
- [ ] **P2-3** 把 front-matter 校验改成 `zod` schema（替换 `normalizeFrontMatter`），错误信息更友好
- [ ] **P2-4** 写 `lib/mdx.test.ts`（vitest）：覆盖路径穿越、`draft` 过滤、必填字段缺失、空目录
- [ ] **P2-5** 抽 `app/{blog,works}/[slug]/page.tsx` 公共部分到 `components/blog/ArticleLayout.tsx`，详情页只剩 collection 名称差异
- [ ] **P2-6** 加 `.github/workflows/ci.yml`：`pnpm lint && pnpm tsc --noEmit && pnpm build`
- [ ] **P2-7** 决定 `components/{blog,layout,ui,works}/` 子目录命名规范（建议 PascalCase 文件名 + 小写目录），写在 `AGENTS.md` 末尾

**完成标准**：内部代码可持续迭代，未来加内容/页面不需要复制粘贴。

---

## 6. 迭代 4 · 发布与可观测（P3，1 天，用户已声明暂缓）

- [ ] **P3-1** `app/layout.tsx` `metadata` 改为站点真实信息 + `metadataBase`
- [ ] **P3-2** `app/sitemap.ts`、`app/robots.ts`（Next 16 内置 API）
- [ ] **P3-3** OG 图：`app/opengraph-image.tsx`（动态生成）、`app/{blog,works}/[slug]/opengraph-image.tsx`
- [ ] **P3-4** JSON-LD：详情页 `Article schema`
- [ ] **P3-5** CSP：先 `Content-Security-Policy-Report-Only` 上线观察，再切正式头
- [ ] **P3-6** 接入 `@vercel/speed-insights` 或自托管的轻量分析

---

## 7. 风险登记表（不在迭代任务内，但执行时要留意）

| ID | 风险 | 触发条件 / 影响 | 处置策略 |
|----|------|------|------|
| R1 | `prose` 类不生效 | 详情页正文裸 HTML | P0-3 解决 |
| R2 | 远程图片不在白名单 | `next/image` 运行时报错 | 写文档说明白名单维护方式 |
| R3 | `dynamicParams=false` + 新文章未 rebuild → 404 | 新增内容必须重新构建 | 写入 README "发布流程" 段；后期可改 ISR |
| R4 | 公私环境变量语义混淆 | `NEXT_PUBLIC_*` 会进客户端 bundle | 在 `lib/profile.ts` 里集中读取，注释写清 |

---

## 8. 进度日志（AI 每次完成迭代后追加）

> 格式：`YYYY-MM-DD · 迭代 X · 完成项：P0-1, P0-2 ...  · 备注：...`

- 2026-05-29 · 创建 ROADMAP，迭代尚未开始
- 2026-05-29 · 迭代 1 · 完成项：P0-1, P0-2, P0-3 · 备注：新增 `lib/profile.ts` 作为站点信息单一来源；`components/layout/{Nav,Footer}.tsx` 接入 RootLayout，Nav 含移动端汉堡菜单；安装并通过 `@plugin` 加载 `@tailwindcss/typography`。`pnpm lint` / `tsc --noEmit` / `pnpm build` 全部通过。
- 2026-05-29 · 迭代 1 · 完成项：P0-4, P0-5 · 备注：抽 `lib/mdx-options.ts` 作为 MDX 编译选项 SSOT；评估后**不抽** `<MDXContent />` 组件（blog 长文 vs works 摄影/项目，差异会扩大，YAGNI）。两个详情页接入 `options={mdxOptions}`。新增 `content/posts/hello-world.mdx`（覆盖 H2/H3/列表/代码/引用/表格/图片）与 `content/works/this-blog.mdx`（项目作品自我介绍）。`pnpm build` 输出 9 个静态路由含 `/blog/hello-world` 与 `/works/this-blog`。
- 2026-05-29 · 迭代 1 · 完成项：P0-6, P0-7 · 备注：首页新增"最新文章"区块（最多展示 3 篇 + "查看全部"链接，与 hero 和"去看看"卡片样式区分使用 divide-y 列表风格，更轻盈）；删除空目录 `styles/`，全仓 0 处引用。**迭代 1 全部完成**，`pnpm lint` / `pnpm build` 全绿，9 个静态路由全部正常。

---

## 9. 待讨论 / 待用户确认

- [ ] 暗黑模式（P1-4）是否做手动切换？还是只跟系统？
- [ ] TOC（P1-5）按移动端优先还是桌面优先做？（项目默认无 PC 适配约束，需用户确认）
- [ ] 是否引入 zod（P2-3）？引入后 bundle 会增加约 8KB（gzip）。
- [ ] CI（P2-6）平台用 GitHub Actions 还是 Vercel 自带？

---

> **下次开始**：建议从 **P0-3 + P0-4**（typography + MDX 选项）切入——成本低、视觉收益最大。
