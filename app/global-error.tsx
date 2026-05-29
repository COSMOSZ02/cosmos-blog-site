"use client";

// global-error 必须自带 <html> 和 <body>，因为它会替换 root layout。
// 这里保持极简，避免依赖 layout 中的字体/全局样式而再次崩溃。

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: "#fff",
          color: "#171717",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 20px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
            站点遇到严重错误
          </h1>
          <p style={{ fontSize: 14, color: "#525252", maxWidth: 480 }}>
            {error.digest
              ? `错误编号：${error.digest}`
              : "请稍后重试，或刷新页面。"}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              borderRadius: 9999,
              border: "1px solid #d4d4d8",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            再试一次
          </button>
        </div>
      </body>
    </html>
  );
}
