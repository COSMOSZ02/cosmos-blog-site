// 为缺少官方类型的依赖补齐最小可用声明。
// 仅声明项目实际用到的字段/签名，避免拉取 @types/* 增加体积。

declare module "gray-matter" {
  interface GrayMatterFile {
    data: Record<string, unknown>;
    content: string;
    excerpt?: string;
    orig: Buffer | string;
  }
  function matter(input: string | Buffer): GrayMatterFile;
  export default matter;
}

declare module "reading-time" {
  interface ReadingTimeResults {
    text: string;
    minutes: number;
    time: number;
    words: number;
  }
  function readingTime(text: string): ReadingTimeResults;
  export default readingTime;
}
