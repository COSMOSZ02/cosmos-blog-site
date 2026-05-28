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