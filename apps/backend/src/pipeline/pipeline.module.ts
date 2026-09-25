import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { ExtractionService } from './extraction.service';
import { GraphBuildService } from './graph-build.service';
import { PipelineOrchestrator } from './pipeline.orchestrator';
import { SearchIndexService } from './search-index.service';
import { VectorIndexService } from './vector-index.service';

/**
 * 知识管线模块：分块 / Embedding / ES 索引 / KG 抽取建图 / 编排器。
 * 无 Controller；由 MQ 消费与 Search/Graph/AI 复用导出服务。
 */
@Module({
  providers: [
    ChunkingService,
    EmbeddingService,
    VectorIndexService,
    SearchIndexService,
    ExtractionService,
    GraphBuildService,
    PipelineOrchestrator,
  ],
  exports: [
    PipelineOrchestrator,
    VectorIndexService,
    SearchIndexService,
    GraphBuildService,
    EmbeddingService,
  ],
})
export class PipelineModule {}
