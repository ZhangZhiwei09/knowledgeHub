import { Controller, Get, Query } from '@nestjs/common';
import { GraphBuildService } from '../pipeline/graph-build.service';
import {
  GraphOverviewDto,
  GraphQueryDto,
  GraphSearchDto,
} from './dto/graph-query.dto';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { PermissionCode } from '../common/constants/permissions';

/**
 * 知识图谱查询接口：全景 / 搜索 / 节点 / 边。
 * 只读；建图由管线 MQ 消费完成，此处委托 GraphBuildService。
 */
@Controller('graph')
@RequirePermission(PermissionCode.search)
export class GraphController {
  constructor(private readonly graph: GraphBuildService) {}

  /** 全景：文档 / 实体 / 标签 + 统计，供前端力导向图 */
  @Get('overview')
  overview(@Query() query: GraphOverviewDto) {
    return this.graph.getOverview({
      keyword: query.keyword,
      entityType: query.entityType,
      from: query.from,
      to: query.to,
      docLimit: query.docLimit,
    });
  }

  /** 按关键词搜实体 / 文档 / 块节点 */
  @Get('search')
  search(@Query() query: GraphSearchDto) {
    return this.graph.searchGraph(query.keyword, query.limit ?? 50);
  }

  /** 知识实体节点 */
  @Get('nodes')
  listNodes(@Query() query: GraphQueryDto) {
    return this.graph.listNodes(query.type, query.limit ?? 200);
  }

  /** 实体间 RELATED_TO 边 */
  @Get('edges')
  listEdges(@Query() query: GraphQueryDto) {
    return this.graph.listEdges(query.limit ?? 500);
  }
}
