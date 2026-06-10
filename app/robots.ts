import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

/**
 * `app/robots.ts` —— 构建期生成 `/robots.txt`。
 *
 * 当前策略：全开放（无 disallow）。原因：
 * - 站点全部页面都是公开内容，没有 admin / 私有 API 路由
 * - sitemap 已显式声明，不需要再 disallow 来"引导"爬虫
 *
 * `host` 字段帮助某些爬虫识别"主域"，对未来切换自定义域时也能给出权威信号。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
