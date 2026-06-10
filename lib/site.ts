/**
 * 站点 URL 解析 —— 全站绝对 URL 的单一来源。
 *
 * 优先级（高 → 低）：
 *   1. NEXT_PUBLIC_SITE_URL：你买了域名后在 Vercel Project → Environment Variables
 *      手动填入（如 `https://cosmos.example.com`），是最终事实来源。
 *   2. VERCEL_PROJECT_PRODUCTION_URL：Vercel 自动注入的 production 部署稳定 host
 *      （形如 `cosmos-blog-site.vercel.app`，**不带协议**）。
 *   3. VERCEL_URL：Vercel 自动注入的当前部署 host（preview / branch / production 都有，
 *      但优先级低于 production，因为它在 preview 时是临时 host）。
 *   4. http://localhost:3000：本地兜底。
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
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(withProtocol(explicit));

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return `https://${stripTrailingSlash(prod)}`;

  const current = process.env.VERCEL_URL?.trim();
  if (current) return `https://${stripTrailingSlash(current)}`;

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
