import { Module } from '@nestjs/common';
import { PipelineModule } from '../pipeline/pipeline.module';
import { GraphController } from './graph.controller';

/** 知识图谱查询模块：只读接口，图数据由管线写入 Neo4j */
@Module({
  imports: [PipelineModule],
  controllers: [GraphController],
})
export class GraphModule {}
