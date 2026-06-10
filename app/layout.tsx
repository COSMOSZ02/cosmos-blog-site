import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ThemeStyles } from "@/components/theme/ThemeStyles";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { profile } from "@/lib/profile";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 根级 metadata。
 *
 * 设计：
 * - `metadataBase`：用 `lib/site.ts` 的解析链。买域名前是 `*.vercel.app`，
 *   买后只需在 Vercel 加 `NEXT_PUBLIC_SITE_URL`，全站自动切换。
 * - `title.template`：子页面只要 `title: "X"` 就自动拼成 `"X · 宇宙"`；
 *   `title.default` 用于根页面（`/`）以及没设 title 的页面。
 * - OG / Twitter 默认值：站点级兜底，详情页可覆盖。
 *   image 留到 P3-3 OG 图任务再补。
 */
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${profile.brand} · ${profile.title}`,
    template: `%s · ${profile.brand}`,
  },
  description: profile.siteDescription,
  applicationName: profile.brand,
  authors: [{ name: profile.name }],
  generator: "Next.js",
  openGraph: {
    type: "website",
    locale: profile.locale,
    siteName: profile.brand,
    title: `${profile.brand} · ${profile.title}`,
    description: profile.siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.brand} · ${profile.title}`,
    description: profile.siteDescription,
    creator: profile.twitterHandle ? `@${profile.twitterHandle}` : undefined,
    site: profile.twitterHandle ? `@${profile.twitterHandle}` : undefined,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      // suppressHydrationWarning：<ThemeScript /> 会在 hydration 前给 <html>
      // 加上 dark class，这是预期内的客户端 / 服务端差异，无需 React 报警。
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeStyles />
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Nav />
          {children}
          <Footer />
        </ThemeProvider>
        {/*
          Vercel Analytics（pageview）+ Speed Insights（Web Vitals）。
          - 都是 client component；放 ThemeProvider 之外避免不必要的 context 依赖
          - 部署到非 Vercel 平台时自动 no-op，不会报错（包内置探测）
          - 本地开发默认不上报，无需手动 disable
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
