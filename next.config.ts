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
  // 预留：业务对象存储 / CDN 通配
  { protocol: "https", hostname: "*.myqcloud.com", pathname: "/**" },
  { protocol: "https", hostname: "*.cos.ap-*.myqcloud.com", pathname: "/**" },
  { protocol: "https", hostname: "*.aliyuncs.com", pathname: "/**" },
  { protocol: "https", hostname: "*.r2.cloudflarestorage.com", pathname: "/**" },
];

/**
 * 基础安全响应头。CSP 暂未启用：
 * - 启用前需要先梳理站内全部远程脚本/样式来源，避免误伤。
 * - 如启用，建议先 Report-Only 观察一段时间。
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
