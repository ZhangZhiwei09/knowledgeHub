import { Module } from '@nestjs/common';
import { PipelineModule } from '../pipeline/pipeline.module';
import { AiChatService } from './ai-chat.service';
import { AiStreamService } from './ai-stream.service';
import { AiController } from './ai.controller';
import { ChatSessionService } from './chat-session.service';
import { HybridRetrievalService } from './hybrid-retrieval.service';
import { RerankerService } from './reranker.service';
import { WebSearchService } from './web-search.service';

/**
 * AI 模块：RAG 检索、同步/流式对话、会话管理。
 * - 检索依赖 PipelineModule（向量/关键词索引）
 * - 建索引不在此模块
 */
@Module({
  imports: [PipelineModule],
  controllers: [AiController],
  providers: [
    AiChatService,
    AiStreamService,
    ChatSessionService,
    HybridRetrievalService,
    RerankerService,
    WebSearchService,
  ],
})
export class AiModule {}
