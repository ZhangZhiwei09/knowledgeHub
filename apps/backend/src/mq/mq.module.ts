import { Global, Module } from '@nestjs/common';
import { PipelineModule } from '../pipeline/pipeline.module';
import { DocumentPipelineConsumer } from './document-pipeline.consumer';
import { DocumentPipelinePublisher } from './document-pipeline.publisher';
import { RabbitMqService } from './rabbitmq.service';

/**
 * 消息队列模块（全局）：连接、文档管线发布与消费。
 * 发布失败不回滚文档状态（见 Publisher 注释）。
 */
@Global()
@Module({
  imports: [PipelineModule],
  providers: [
    RabbitMqService,
    DocumentPipelinePublisher,
    DocumentPipelineConsumer,
  ],
  exports: [RabbitMqService, DocumentPipelinePublisher],
})
export class MqModule {}
