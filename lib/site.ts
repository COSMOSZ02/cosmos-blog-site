/**
 * 站点 URL 解析 —— 全站绝对 URL 的单一来源。
 *
 * 优先级（高 → 低）：
 *   1. NEXT_PUBLIC_SITE_URL：显式覆盖（逃生口）。在 Vercel Project →
 *      Environment Variables 手动填入即可临时改写规范 URL，无需改代码。
 *   2. Vercel preview / branch 部署（VERCEL_ENV === "preview"）：用 VERCEL_URL
 *      的临时 host，避免预览部署的 OG / sitemap 错误指向正式域名。
 *   3. 生产环境（NODE_ENV === "production"）：已购买的规范域名 SITE_URL
 *      （`https://cosmoszh.com`），是站点对外的事实 URL。
 *   4. http://localhost:3000：本地开发兜底。
 *
 * 适用场景：
 * - `metadata.metadataBase`（必须 absolute）
 * - `app/sitemap.ts` / `app/robots.ts` 的 URL 字段
 * - OG 图片 / JSON-LD 中的 absolute URL
 *
 * 安全：永远返回带 `https://` 或 `http://` 协议的合法 URL，
 *      即使环境变量为空也不会抛错。
 */

const FALLBACK = "http://localhost:3000";

/** 已购买的生产环境规范域名 —— 站点对外的事实 URL。 */
const SITE_URL = "https://cosmoszh.com";

/** 给可能不带协议的 host 字符串加上 https://，确保结果是完整 URL。 */
function withProtocol(host: string): string {
  if (host.startsWith("http://") || host.startsWith("https://")) return host;
  return `https://${host}`;
}

/**
 * 返回站点 absolute URL（不含尾部斜杠）。
 *
 * 调用频次很低（构建期 metadata / sitemap 才用），无需缓存。
 */
export function getSiteUrl(): string {
  // 1. 显式覆盖（最高优先级，保留逃生口）
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(withProtocol(explicit));

  // 2. Vercel preview / branch 部署：用临时 host，避免规范 URL 指向正式域名
  if (process.env.VERCEL_ENV === "preview") {
    const current = process.env.VERCEL_URL?.trim();
    if (current) return `https://${stripTrailingSlash(current)}`;
  }

  // 3. 生产环境（Vercel production / 自建服务器）：已购域名是规范 URL
  if (process.env.NODE_ENV === "production") return SITE_URL;

  // 4. 本地开发兜底
  return FALLBACK;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

/** 把站内相对路径拼成 absolute URL。 */
export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  if (!pathname.startsWith("/")) return `${base}/${pathname}`;
  return `${base}${pathname}`;
}
