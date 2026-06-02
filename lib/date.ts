/**
 * 日期格式化工具集。
 *
 * 全站统一在这里输出展示文案，避免列表页、首页、详情页各写各的。
 *
 * 设计取舍：
 * - 输入约定为 ISO 字符串（front-matter `date` 字段已校验为 string），
 *   解析时用原生 `new Date(input)`，保留时区原样信息。
 * - 实现没有引入 `date-fns/format`，避免 bundle 体积膨胀；
 *   未来若要做更复杂的 locale 切换（如英文站），再切到 `date-fns` 即可。
 * - 输出格式固定为 `YYYY年MM月DD日`（月日两位补零），与作者偏好一致；
 *   `<time dateTime={iso}>` 仍保留 ISO 原值，便于无障碍 / SEO。
 */

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

/**
 * 把 ISO 字符串格式化为 `YYYY年MM月DD日`。
 *
 * 非法或空输入会原样返回，避免渲染期抛错。
 */
export function formatDate(iso: string): string {
  if (!iso) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}年${pad2(d.getMonth() + 1)}月${pad2(d.getDate())}日`;
}

/**
 * 取 ISO 字符串中的年份，用于按年份分组。
 *
 * 直接走 `slice(0, 4)`：front-matter 的 ISO 串前 4 位一定是年份，
 * 比 new Date 解析快得多，且不受时区漂移影响。
 */
export function getYear(iso: string): string {
  return iso.slice(0, 4);
}

/**
 * 按年份把列表分组，**保留输入顺序**。
 *
 * 用 `Map` 而不是 `Record`：
 * - `Map` 保证迭代顺序 = 插入顺序（ECMA-262 spec 保证）；
 * - 调用方传进来的列表已按日期倒序，分组后年份块也自然倒序，无需再排序。
 */
export function groupByYear<T extends { date: string }>(
  items: readonly T[],
): Array<{ year: string; items: T[] }> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const year = getYear(item.date);
    const bucket = map.get(year);
    if (bucket) {
      bucket.push(item);
    } else {
      map.set(year, [item]);
    }
  }
  return Array.from(map, ([year, list]) => ({ year, items: list }));
}
