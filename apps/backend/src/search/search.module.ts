import { Module } from '@nestjs/common';
import { PipelineModule } from '../pipeline/pipeline.module';
import { SearchController } from './search.controller';

/** 全文搜索模块：对外 SearchController，索引能力来自 PipelineModule */
@Module({
  imports: [PipelineModule],
  controllers: [SearchController],
})
export class SearchModule {}
