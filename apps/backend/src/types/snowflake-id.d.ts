/**
 * snowflake-id v1.1.0 未提供 TypeScript 类型声明，此处手动补充。
 * 参考实现：node_modules/snowflake-id/src/snowflake-id.js
 */
declare module 'snowflake-id' {
  export interface SnowflakeIdOptions {
    /** 机器 ID，默认 1（内部对 1023 取模） */
    mid?: number;
    /** 时间偏移量（毫秒），默认 0，用于减小生成的 ID 长度 */
    offset?: number;
  }

  export default class SnowflakeId {
    constructor(options?: SnowflakeIdOptions);

    /** 生成雪花 ID（字符串形式，可直接存入 BIGINT） */
    generate(): string;
  }
}
