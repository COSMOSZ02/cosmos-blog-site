import type { NextConfig } from "next";

/**
 * 远程图片白名单：仅允许列表中的 host 通过 next/image 加载。
 * - 通过环境变量 NEXT_PUBLIC_ASSET_HOST 注入对象存储域名（例如 cdn.example.com）。
 * - 兼容常见的 CDN：Cloudflare R2、腾讯云 COS / CDN、阿里云 OSS。
 * - 如需新增，统一在此处维护，避免散落到代码各处。
 */
const assetHost = process.env.NEXT_PUBLIC_ASSET_HOST;

const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  ...(assetHost
    ? [
        {
          protocol: "https" as const,
          hostname: assetHost,
          pathname: "/**",
        },
      ]
    : []),
  // 注意：Next 的 hostname 通配中，单 `*` 只匹配 **一段** 子域；
  // 主流云存储真实域名都是多段子域，例如：
  //   bucketname-12345.cos.ap-shanghai.myqcloud.com
  //   foo.oss-cn-shanghai.aliyuncs.com
  // 因此必须用前缀 `**.`（匹配任意层级子域）。
  // 不要改回单 `*.`，否则白名单看似生效但实际命不中。
  { protocol: "https", hostname: "**.myqcloud.com", pathname: "/**" },
  { protocol: "https", hostname: "**.aliyuncs.com", pathname: "/**" },
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com", pathname: "/**" },
];

/**
 * 内容安全策略（CSP）—— 当前以 **Report-Only** 模式上线观察。
 *
 * 切到正式头的步骤（待完成）：
 * 1. 在 Vercel preview 上访问全部页面，DevTools Console 检查 CSP 违规
 * 2. 若有违规但确实无害，调整下方 directive
 * 3. 把 header key 从 `Content-Security-Policy-Report-Only` 改成 `Content-Security-Policy`
 *
 * 关于本项目的几个 directive 选择理由：
 * - **`'unsafe-inline'`（script + style）必须保留**：
 *   - Next.js 16 RSC 用内联脚本嵌 hydration payload
 *   - `<ThemeStyles />` / `<ThemeScript />` / `<JsonLd />` 都是受控来源的内联块
 *   - 用 nonce 中间件方案能干掉 `'unsafe-inline'`，但会强制路由切到 dynamic，
 *     与本项目"全 SSG"的核心架构冲突，因此**有意保留**
 * - **`img-src https:`** 而不是逐 host 白名单：
 *   - mdx 内容里直接写的 `<img src="...">` 不走 next/image，受 CSP 限制
 *   - 逐 host 列表会和 `images.remotePatterns` 重复维护
 *   - `https:` 至少强制 https，对个人博客粒度合适
 * - **`frame-ancestors 'none'`** 与 `X-Frame-Options: SAMEORIGIN` 重复，
 *   保留 X-FO 是为了老浏览器兼容
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * 基础安全响应头。
 *
 * - CSP 当前是 Report-Only，违规仅报告不阻断；
 *   观察期结束后切到正式 `Content-Security-Policy`（见上方 cspDirectives 注释）
 * - X-Frame-Options 与 CSP 的 frame-ancestors 重复，保留是为老浏览器兼容
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
