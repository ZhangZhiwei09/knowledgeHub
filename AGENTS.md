# AGENTS.md

面向 AI Agent 的项目入口。先读本文件，再按需打开 `mydocs/` 与代码。

## AI Coding Harness

- 日常中等及以上 coding 任务默认使用 `sdd-riper-one-light`。
- light 默认用户已拆好任务；agent 只做目标复述、最小 spec/micro-spec、checkpoint、validation、handoff。
- `sdd-riper-one` 和 light 共享目标复述、Spec 真相源、checkpoint、approval、validation、reverse sync、handoff 和端到端闭环；区别是 one 的门禁更强、流程更显式、产物密度更高。
- 任务明显过大、边界不清、高风险或需要 codemap/context/频繁阻塞/审计留痕时，建议切到 `sdd-riper-one`。
- 不要裸改：中等以上任务执行前先说明目标、边界、下一步、风险和验证方式。
- 完成必须由测试、日志、运行结果或人工确认等证据证明。
- 不提交本地记忆、trace、密钥（`apps/backend/.env`）、机器私有路径；Feature Spec / 本地笔记默认不主动 `git add`，除非用户明确要求。

## 项目速览

pnpm monorepo：`apps/backend`（NestJS）+ `apps/frontend`（React + Ant Design + Vite）。

| 能力 | 选型 |
| --- | --- |
| 元数据 + 正文 | PostgreSQL（TypeORM，`kh_document` / `kh_document_content`） |
| 全文 / 向量 | Elasticsearch（`kh_document` / `kh_chunk`） |
| 图谱 | Neo4j |
| 异步索引 | RabbitMQ → `pipeline` |
| 缓存 | Redis |
| 对象存储 | RustFS（S3） |
| LLM / Embedding | 默认阿里云百炼 OpenAI 兼容接口（`OPENAI_BASE_URL` 指向 DashScope） |

**已移除 MongoDB。** 正文不在 Mongo；跨库 `content_id` 已删除。

## 必读知识落点

| 文档 | 用途 |
| --- | --- |
| `mydocs/PROJECT_KNOWLEDGE.md` | 跨任务稳定事实（存储拓扑、端口、清卷） |
| `mydocs/specs/` | Feature Spec（任务真相源） |
| `README.md` | 人类向快速开始 |
| `apps/backend/.env.example` | 环境变量清单（真实密钥只写 `.env`） |

## 本地运行

```bash
docker compose up -d
cp apps/backend/.env.example apps/backend/.env   # 填 Key；勿提交 .env
pnpm --filter knowledge-hub-backend start:dev    # :3000
pnpm --filter knowledge-hub-frontend dev         # :5173
```

- Docker PostgreSQL 宿主机端口 **5433**（规避本机 PG 占用 5432）；`.env` 中 `POSTGRES_PORT=5433`。
- 种子用户：`admin` / `reviewer` / `user`，密码 `123456`。
- LLM Key 必须是 **百炼** Key（与 `OPENAI_BASE_URL=...dashscope...` 一致）；DeepSeek Key 直接塞入会 `invalid_api_key`。

## 代码约定（Agent）

- **注释**：中文模块/类级 `/** … */`，放在装饰器或 `export` 正上方；说明职责与边界，不堆行内废话。已有风格见 `document.service.ts`、`pipeline.orchestrator.ts`。
- **改动面**：只改任务需要的文件；不做无关重构。
- **数据**：`synchronize: false`；schema 改 `init-scripts/postgresql/01-init.sql`。开发可弃数据时双卷清空重建（见 Project Knowledge）。
- **正文表**：`kh_document_content.document_id` = PK + FK → `kh_document(id)` `ON DELETE CASCADE`；`create` 事务内**父表先行**；MQ/ES 副作用留在事务外。
- **权限**：后端守卫默认拒绝；公开接口用 `@Public()`。
- **前端 API**：`apps/frontend/src/api/client.ts` 统一带 JWT 与 refresh；页面经 `api/index.ts` 的领域封装调用。

## 高风险动作（先确认）

- 清 `volumes/postgres` / 改端口映射
- 改鉴权、权限码、发布审核开关
- 引入第二套 LLM/Embedding 提供商（需同步 BASE_URL + 模型名 + 向量维度）
- 提交含密钥或 `mydocs` 中未脱敏内容

## 验证习惯

- 后端：`pnpm --filter knowledge-hub-backend build`
- 文档链路：create → findOne → update → publish/审核 → 查 ES `content` 非空
- 对话：确认 `.env` Key 对应当前 `OPENAI_BASE_URL` 提供商后再测 `/ai` 流式接口
