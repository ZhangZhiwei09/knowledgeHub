# Project Knowledge

跨任务可复用的稳定项目事实。Feature Spec 细节仍在 `mydocs/specs/`。

## 存储拓扑（2026-09-25 起）

| 数据 | 位置 |
|---|---|
| 文档元数据 | PostgreSQL `kh_document` |
| 文档正文 | PostgreSQL `kh_document_content`（`document_id` = PK + FK → `kh_document.id`，`ON DELETE CASCADE`） |
| 全文检索 | Elasticsearch `kh_document` |
| 向量块 | Elasticsearch `kh_chunk` |
| 知识图谱 | Neo4j |

- **已移除 MongoDB**（无 `mongoose` / `MONGO_URI` / mongo 容器）。正文与元数据同库同事务。
- 软删：`kh_document.deleted` 与 `kh_document_content.deleted` 两侧置位；CASCADE 仅在物理 `DELETE` 父行时触发。
- 列表查询不 join 正文表（大字段分表）；合库后的 N+1 批量加载属独立优化，未做。

## 本地基建端口

| 服务 | 宿主机端口 | 说明 |
|---|---|---|
| Docker PostgreSQL | **5433** | 映射 `5433:5432`；本机常有 `postgresql-x64-18` 占 5432 |
| 后端 API | 3000 | |
| 前端 | 5173 | |

环境变量：`apps/backend/.env` 中 `POSTGRES_PORT=5433`。改端口时同步 `docker-compose.yml` 与 `.env`。

## 清卷重建

无迁移框架（`synchronize: false` + 幂等 init）。开发数据可弃时：

```bash
docker compose down
# Windows PowerShell: Remove-Item -Recurse -Force volumes\postgres
docker compose up -d
```

`init-scripts/postgresql/01-init.sql` 会重建表结构与种子：

- 用户 `admin` / `reviewer` / `user`，密码均 `123456`
- 角色 `ROLE_ADMIN` / `ROLE_REVIEWER` / `ROLE_USER`

## 相关 Spec

- `mydocs/specs/2026-09-25_19-35_RemoveMongoUsePostgres.md` — 移除 Mongo、正文迁 PG 的完整决策与验证证据
