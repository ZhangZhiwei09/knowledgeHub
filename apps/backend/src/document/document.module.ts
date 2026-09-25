import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentReviewService } from './document-review.service';
import { DocumentController } from './document.controller';
import { FileParserService } from './parser/file-parser.service';

/**
 * 文档模块
 * - DocumentService：文档 CRUD + 状态流转（草稿 / 发布 / 归档 / 待审核）
 * - DocumentReviewService：发布审核（提交 / 通过 / 驳回）
 */
@Module({
  controllers: [DocumentController],
  providers: [DocumentService, DocumentReviewService, FileParserService],
  exports: [DocumentService, DocumentReviewService, FileParserService],
})
export class DocumentModule {}
