import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/** 全局 Redis 模块：导出 RedisService */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
