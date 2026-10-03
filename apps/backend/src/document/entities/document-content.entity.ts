import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { bigintTransformer } from '../../common/transformers/bigint.transformer';

/**
 * 文档正文（PostgreSQL kh_document_content）
 *
 * 与 kh_document 一对一：document_id 兼主键与外键（→ kh_document.id，ON DELETE CASCADE）。
 * 独立成表而非并入 kh_document，避免列表查询拖拽大字段。
 */
@Entity('kh_document_content')
export class DocumentContentEntity {
  /** 文档 ID，兼主键与 FK（1:1 关系无需代理键） */
  @PrimaryColumn({
    name: 'document_id',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  documentId: string;

  /** Markdown 正文 */
  @Column({ type: 'text', default: '' })
  content: string;

  /** 正文字符数 */
  @Column({ name: 'content_length', type: 'int', default: 0 })
  contentLength: number;

  /** 正文摘要 / 预览 */
  @Column({ name: 'content_summary', type: 'text', default: '' })
  contentSummary: string;

  /** 版本号 */
  @Column({ type: 'int', default: 1 })
  version: number;

  /** 逻辑删除 */
  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  /** 创建时间 */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
