import { Body, Controller, Post } from '@nestjs/common';
import { SearchIndexService } from '../pipeline/search-index.service';
import { SearchDocumentsDto } from './dto/search.dto';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { PermissionCode } from '../common/constants/permissions';

/**
 * 全文搜索接口：关键词检索已发布文档（ES kh_document）。
 * 薄封装，实际查询走 SearchIndexService。
 */
@Controller('search')
export class SearchController {
  constructor(private readonly searchIndex: SearchIndexService) {}

  /** 关键词检索已发布文档（ES kh_document） */
  @Post()
  @RequirePermission(PermissionCode.search)
  search(@Body() dto: SearchDocumentsDto) {
    return this.searchIndex.searchDocuments({
      keyword: dto.keyword,
      page: dto.page,
      pageSize: dto.pageSize,
      categoryId: dto.categoryId,
      authorId: dto.authorId,
    });
  }
}
