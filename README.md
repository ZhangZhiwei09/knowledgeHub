# knowledgeHub

知识库平台，pnpm monorepo 前后端分离。后端基于 NestJS 提供文档管理、RAG 检索问答、知识图谱与团队协作 API；前端基于 React + Ant Design。

## 技术栈

**后端** — NestJS + TypeScript，按模块划分

| 能力 | 选型 |
| --- | --- |
| 关系型存储 | PostgreSQL（`pgvector` 扩展，向量检索） via TypeORM |
| 文档内容 | MongoDB via Mongoose |
| 缓存 / 验证码 | Redis |
| 异步任务 | RabbitMQ（文档发布后触发 RAG / KG / ES 索引） |
| 全文检索 | Elasticsearch（IK 分词，不可用时跳过写入） |
| 知识图谱 | Neo4j |
| 对象存储 | RustFS（S3 兼容） |
| 鉴权 | JWT + Passport，全局守卫默认拒绝 |
| 邮件 | `@nestjs-modules/mailer` + nodemailer |

**前端** — React + Vite + Ant Design + ECharts，开发端口 `5173`，`/api` 反向代理到后端 `3000`。

## 目录结构

```
knowledgeHub/
├── apps/
│   ├── backend/                 # NestJS 服务
│   │   ├── src/
│   │   │   ├── ai/              # RAG 检索问答、会话、混合检索 + 重排
│   │   │   ├── auth/            # 注册登录、JWT、邮箱激活、密码重置、RBAC 守卫
│   │   │   ├── common/          # 雪花 ID、通用工具
│   │   │   ├── document/        # 文档 CRUD、发布审核
│   │   │   ├── graph/           # 知识图谱查询
│   │   │   ├── mq/              # RabbitMQ 生产/消费
│   │   │   ├── pipeline/        # 文档解析 → 分块 → 向量化流水线
│   │   │   ├── redis/           # Redis 客户端封装
│   │   │   ├── search/          # Elasticsearch 搜索
│   │   │   ├── storage/         # RustFS 对象存储
│   │   │   ├── team/            # 团队与成员
│   │   │   ├── types/           # 环境变量 / 模块声明
│   │   │   └── user/            # 用户
│   │   ├── test/                # e2e 测试
│   │   └── .env.example         # 环境变量模板
│   └── frontend/                # React 前端
├── elasticsearch/               # 带 IK 插件的 ES 镜像构建
├── init-scripts/                # postgres / mongodb 初始化脚本
└── docker-compose.yml           # 全部基础设施
```

## 快速开始

### 0. 前置要求

- Node.js >= 18
- pnpm
- Docker Desktop

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动基础设施

```bash
docker compose up -d
```

首次启动会拉取镜像并执行 `init-scripts/` 下的初始化脚本。ES 需要本地构建带 IK 分词的镜像，耗时较长。等各容器 `healthy` 后再进行下一步。

### 3. 配置环境变量

```bash
cp apps/backend/.env.example apps/backend/.env
```

按需填写。**最小可启动**只需默认值；以下能力不配 Key 会降级或跳过：

- `EMBEDDING_API_KEY` / `DASHSCOPE_API_KEY` — 不配则向量化不可用
- `OPENAI_API_KEY` — 知识图谱 LLM 抽取（必填，不配则抽取报错）
- `RERANK_API_KEY` — 重排，不配走 RRF 降级
- `MAIL_*` — 邮件发送

### 4. 启动后端

```bash
pnpm dev:backend          # = nest start --watch，监听 3000
```

生产构建：

```bash
pnpm build:backend
node apps/backend/dist/main
```

### 5. 启动前端

```bash
cd apps/frontend && pnpm dev
```

## 服务端口

| 服务 | 端口 | 说明 |
| --- | --- | --- |
| 后端 API | 3000 | `PORT` 可改 |
| 前端 dev | 5173 | 代理 `/api` → `127.0.0.1:3000` |
| PostgreSQL | 5432 | pgvector，库 `knowledge_hub` |
| pgAdmin | 8088 | `admin@admin.com` / `admin` |
| MongoDB | 27017 | 库 `knowledge_hub` |
| mongo-express | 8081 | `me_admin` / `me_123456` |
| Redis | 6379 | |
| RedisInsight | 5540 | |
| RabbitMQ | 5672 / 15672 | `guest` / `guest`，15672 为管理台 |
| Elasticsearch | 9200 | |
| Kibana | 5601 | |
| RustFS | 9000 / 9001 | `rustfsadmin` / `rustfsadmin`，9001 为控制台 |
| Neo4j | 7474 / 7687 | `neo4j` / `12345678`，7474 为浏览器 |

> 若宿主机已占用上述端口（例如本地装有原生 PostgreSQL 占用 5432），可改 `docker-compose.yml` 中的宿主机侧映射，并同步 `apps/backend/.env`。

## 环境变量

完整列表见 `apps/backend/.env.example`，按用途分组：

| 分组 | 变量 |
| --- | --- |
| 服务 | `PORT` |
| PostgreSQL | `POSTGRES_HOST` `POSTGRES_PORT` `POSTGRES_USER` `POSTGRES_PASSWORD` `POSTGRES_DB` |
| MongoDB | `MONGO_URI` |
| 雪花 ID | `SNOWFLAKE_WORKER_ID`（0–1023，分布式各实例需唯一）、`SNOWFLAKE_OFFSET` |
| 对象存储 | `RUSTFS_ENABLED` `RUSTFS_ENDPOINT` `RUSTFS_PUBLIC_URL` `RUSTFS_ACCESS_KEY` `RUSTFS_SECRET_KEY` `RUSTFS_BUCKET` `RUSTFS_REGION` |
| 消息队列 | `RABBITMQ_ENABLED` `RABBITMQ_URL` |
| 分块 | `RAG_CHUNK_SIZE` `RAG_CHUNK_OVERLAP` |
| Embedding | `EMBEDDING_DIMENSION` `EMBEDDING_BASE_URL` `EMBEDDING_MODEL` `EMBEDDING_BATCH_SIZE` `EMBEDDING_API_KEY` |
| 混合检索 / 重排 | `RAG_HYBRID_TOP_K` `RAG_RRF_C` `RAG_RERANK_ENABLED` `RAG_RERANK_MODEL` `RAG_MIN_SCORE` `RERANK_API_KEY` `RERANK_BASE_URL` |
| LLM（KG 抽取） | `OPENAI_API_KEY` `OPENAI_BASE_URL` `MODEL_NAME` `KG_LLM_TIMEOUT_MS` `LLM_ENABLE_THINKING` |
| 检索增强 | `ELASTICSEARCH_ENABLED` `ELASTICSEARCH_NODE` `NEO4J_ENABLED` `NEO4J_URI` `NEO4J_USER` `NEO4J_PASSWORD` |
| 鉴权 | `JWT_SECRET` `JWT_ACCESS_EXPIRES` `JWT_REFRESH_EXPIRES` |
| 邮箱验证 | `REQUIRE_EMAIL_VERIFICATION` `APP_PUBLIC_URL` `MAIL_HOST` `MAIL_PORT` `MAIL_SECURE` `MAIL_USER` `MAIL_PASS` `MAIL_FROM` |
| Redis | `REDIS_HOST` `REDIS_PORT` `REDIS_PASSWORD` `REDIS_DB` |
| 业务开关 | `DOCUMENT_REQUIRE_APPROVAL` |

## 常用脚本

根目录：

| 命令 | 说明 |
| --- | --- |
| `pnpm dev:backend` | 后端 watch 模式 |
| `pnpm build:backend` | 构建后端 |
| `pnpm build` | 构建全部 workspace |

`apps/backend` 内：

| 命令 | 说明 |
| --- | --- |
| `pnpm start:dev` | watch 模式 |
| `pnpm build` | `nest build` |
| `pnpm start:prod` | 运行 `dist/main` |
| `pnpm test` | 单元测试 |
| `pnpm test:e2e` | e2e 测试 |
| `pnpm lint` | ESLint（含 `--fix`） |
| `pnpm format` | Prettier 格式化 |

## 功能模块

- **文档** — 上传、解析（PDF / Word / Excel / PPT / Markdown）、发布审核
- **RAG 问答** — 文档分块向量化，关键词 + 向量混合检索 → RRF 融合 → 重排，支持流式输出
- **知识图谱** — 从文档抽取实体关系写入 Neo4j，提供图谱查询
- **搜索** — Elasticsearch 全文检索
- **团队** — 团队成员与权限
- **鉴权** — JWT + 邮箱激活 + 密码重置，RBAC（角色 / 权限守卫）
