import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { ExtractionService } from './extraction.service';
import { GraphBuildService } from './graph-build.service';
import { PipelineOrchestrator } from './pipeline.orchestrator';
import { SearchIndexService } from './search-index.service';
import { VectorIndexService } from './vector-index.service';

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
