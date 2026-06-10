<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Components 命名与组织规范

### 目录约定

| 目录 | 收什么 | 例 |
|---|---|---|
| `components/ui/` | 通用、与业务领域无关的小 UI 单元（按钮、链接、Toggle、Toast 等） | `BackLink.tsx` |
| `components/layout/` | 站点骨架级组件（Nav、Footer、Sidebar 等） | `Nav.tsx`、`Footer.tsx` |
| `components/theme/` | 主题相关（颜色 token 注入、Provider、Toggle 等） | `ThemeProvider.tsx`、`ThemeToggle.tsx` |
| `components/<route>/` | 某个具体路由专属组件，目录名与路由段一致 | `components/blog/TableOfContents.tsx` |

二级目录**必须**全小写。每个组件**必须**：

1. 文件名 PascalCase，与组件名一致：`Nav.tsx` ↔ `export function Nav()`
2. 用**命名导出**（`export function Foo()`），不用 `export default` —— 方便 grep / 重构 / IDE 跳转
3. 一个文件一个组件；私有子组件可同文件存在但不导出
4. **不**用 `.client.tsx` / `.server.tsx` 后缀 —— `"use client"` 指令本身已在文件顶部表达意图，后缀冗余

### client vs server component

- 默认 server component。需要交互 / 浏览器 API / hooks 时才加 `"use client"`。
- 跨边界传 prop 时遵守 RSC 规则：server → client 只能传可序列化值。

### 何时新增二级目录

- 当某个新功能群体的组件 > 1 个时，建二级目录（避免一个文件就开新目录）
- 路由专属组件**首选** `components/<route>/`，而不是 `app/<route>/_components/`，因为后者会被某些 Next 工具误判

