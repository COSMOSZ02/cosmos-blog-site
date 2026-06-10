import { ImageResponse } from "next/og";

/**
 * 站点根 Open Graph 图（动态生成，构建期 prerender）。
 *
 * 设计取舍：
 * - **不加载中文字体**：satori 默认 Inter 仅支持拉丁字符；要渲染"宇宙"等
 *   中文字符需要 fetch ~500KB+ 的子集字体，违反本任务"中范围"的成本边界。
 *   因此 OG 文案用拉丁字符（`cosmos.`）—— 简约线条风格本就适合极简英文版式。
 * - 1200×630 是 OG 标准尺寸，社交平台缩略图按这个比例裁剪（如 X、微信公众号、LinkedIn）。
 * - 配色与 light 主题对齐：白底 + 深字 + 1px 灰边线 —— 即使社交平台是暗色主题，
 *   高对比度反而更醒目；不试图跟用户的 dark mode（OG 是单图，无主题概念）。
 *
 * 路由：被 Next 16 编译为 `/opengraph-image`，自动注入到根 metadata 的 `og:image`。
 */

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "cosmos · personal site";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#ffffff",
          color: "#171717",
          // 1px 内边线 —— 简约线条风格的视觉签名
          border: "1px solid #e4e4e7",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* 顶部：handle */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#71717a",
            letterSpacing: "0.02em",
          }}
        >
          @cosmos
        </div>

        {/* 中部：品牌大字 + 句点（视觉锚点） */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: "192px",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            cosmos
          </span>
          <span
            style={{
              fontSize: "192px",
              fontWeight: 600,
              color: "#a1a1aa",
              lineHeight: 1,
            }}
          >
            .
          </span>
        </div>

        {/* 底部：领域三联 + 站点 URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: "26px",
            color: "#52525b",
          }}
        >
          <div style={{ display: "flex" }}>
            frontend &nbsp;·&nbsp; writing &nbsp;·&nbsp; photography
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              color: "#a1a1aa",
            }}
          >
            personal site
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
