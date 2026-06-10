interface JsonLdProps {
  /** 待嵌入的 JSON-LD 数据对象（或对象数组）。`undefined` 字段会被 JSON.stringify 自动跳过。 */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * 在页面里嵌入 `<script type="application/ld+json">`。
 *
 * - server component：构建期渲染，零运行时成本
 * - 内容来自仓库内的 helper（`lib/structured-data.ts`），
 *   没有用户输入，`dangerouslySetInnerHTML` 在此安全
 * - 不格式化（`JSON.stringify(data)` 不传第三参），节省 HTML 字节
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
