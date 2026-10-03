import { Global, Module } from '@nestjs/common';
import { RustfsService } from './rustfs.service';

/** 全局对象存储模块：导出 RustfsService（S3 兼容） */
@Global()
@Module({
  providers: [RustfsService],
  exports: [RustfsService],
})
export class StorageModule {}
