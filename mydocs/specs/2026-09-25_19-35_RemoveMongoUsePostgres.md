# Remove MongoDB, Consolidate on PostgreSQL

- **Task**: 移除 MongoDB，文档正文改存 PostgreSQL
- **Depth**: deep（数据模型 + 基建变更）
- **Status**: Done（已验证）

---

## 1. 核心目标

移除 MongoDB 依赖，把 `document_content` 正文存储迁到 PostgreSQL，使 `kh_document` 与其正文回到同一数据库、同一事务边界内。

**非目标（明确排除）**：
- 不改 Elasticsearch 职责（全文检索 `kh_document`、向量 `kh_chunk` 保持不变）
- 不改 Neo4j 图谱、RAG 管线逻辑、MQ 消息结构
- 不改 API 出参与前端
- 不做 N+1 查询优化（见 §7 遗留）

---

## 2. 背景与证据

### Mongo 现在承担什么

只有 **1 个 collection** `document_content`（`init-scripts/mongodb/01-init.js`）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | ObjectId | 对应 `kh_document.content_id` |
| `documentId` | string | 唯一索引，反向指回 `kh_document.id` |
| `content` | Markdown 正文 | |
| `contentLength` / `contentSummary` / `version` / `deleted` | 标量 | |

**零 Mongo 特性**：无嵌套文档、无数组、无 aggregation、无 GridFS、无 change stream、无事务。

Mongo 在两个"通常需要文档库"的场景里**都没参与**：

- 全文检索 → Elasticsearch `kh_document`（`pipeline/search-index.service.ts` 负责搬运）
- 向量检索 → Elasticsearch `kh_chunk` dense_vector（`pipeline/vector-index.service.ts`）

### 保留它的真实成本

1. **跨库无事务**：`document.service.ts:92-138` 创建文档必须"先写 Mongo 拿 ObjectId → 再写 PG → PG 失败就手工物理删 Mongo"补偿。合库后可归入单事务。
2. **`content_id` 是跨库代孕键**：它不是业务字段，只是"Mongo 那条记录的地址"。唯一职责是跨库寻址。
3. **关系双向冗余**：`kh_document.content_id` ↔ `document_content.documentId`，两头互指，任一头已够。
4. **基建开销**：2 个容器（`mongodb` + `mongo-express`，`docker-compose.yml:39-75`）、1 套 ORM（`@nestjs/mongoose` + `mongoose`）、2 处连接生命周期、1 套备份恢复。
5. **存储细节泄漏进关系模型**：`content_id VARCHAR NOT NULL UNIQUE`（`init-scripts/postgresql/01-init.sql:8`）。

### 改动面

真正碰 Mongo 的只有 **2 个文件、约 10 个调用点**：

- `document.service.ts` — 6 处（create / findOne / update×2 / remove / loadContent）
- `pipeline.orchestrator.ts:186,201` — 加载正文供管线使用

### `content_id` 消费方（全仓库已确认）

仅 `document.service.ts`、`pipeline.orchestrator.ts`、`document.entity.ts`、两个 init 脚本。
前端不读、API 不据此分支、无其他业务依赖 → **可安全删除**。

### 用户已确认

- `volumes/mongo/` 内**只有开发数据**，无需迁移脚本
- 路线图**无**"存异构 / 无 schema 解析产物"需求 → 移除后无未来阻塞
- `kh_ai_session` / `kh_ai_message` **无需保留**，随 PG 卷一并清空（不 `pg_dump`）

---

## 3. Done Contract

**完成条件**（全部满足才算完成）：

1. `pnpm build` 通过
2. 全仓库无 `mongoose` / `@nestjs/mongoose` / `MONGO_URI` / `mongo` 残留（init 脚本、compose、README、env、源码、依赖）
3. 后端在**没有 Mongo 容器**的情况下能正常启动
4. 文档全链路跑通：create → findOne → update → publish → archive → saveAsDraft → remove
5. 触发管线 INDEX 后，ES `kh_document` 中存在该文档且 `content` 字段有值（证明能从 PG 读到正文）
6. 创建文档时 PG 只产生一次写入事务，**不存在**补偿删除逻辑
7. `kh_document_content.document_id` 上存在 FK 约束（指向 `kh_document.id`，`ON DELETE CASCADE`）

**证明方式**：`pnpm build` 输出 + 实际调用接口的响应 + ES 查询结果

**仍未完成的情形**：只要还残留任一 mongoose import、MONGO_URI 配置、mongo 容器或 `volumes/mongo` 依赖，即视为未完成。

---

## 4. 设计决策

### 4.1 保持"元数据 / 正文"分表，不合并进 `kh_document`

新增 `kh_document_content`，而非把 `content text` 加进 `kh_document`。

**理由**：`findAll` 列表查询不该拖着大字段。PG 虽不会读未 SELECT 的 TOAST 列，但分表让意图显式，且能让本次改动保持"换存储、不改结构"的最小形态 —— `document.service.ts` 的代码形状几乎不动。

### 4.2 `document_id` 直接做主键，不引入 `id`

1:1 关系下不需要代理键：

```ts
@PrimaryColumn({ name: 'document_id', type: 'bigint', transformer: bigintTransformer })
documentId: string;
```

- `kh_document.content_id` **删除**（连同其 UNIQUE 约束与索引）
- 外键即 `kh_document_content.document_id → kh_document.id`
- 省掉一列、一个索引、一层间接

### 4.3 `create` 收进单事务，**父表先行**

```ts
await this.em.transaction(async (tx) => {
  // 1. 先插父表 kh_document（FK 依赖：child 必须先有父行）
  const saved = await tx.save(tx.create(DocumentEntity, { id, ... }));
  // 2. 再插子表 kh_document_content
  await tx.save(tx.create(DocumentContentEntity, { documentId: id, content, ... }));
  return saved;
});
```

- **顺序不可反**：FK 在同事务内为 `NOT DEFERRABLE`（PG 默认），child 先插会立即撞约束
- 原代码"先写 Mongo 以获取 ObjectId"的依赖已消失（雪花 ID 由 `nextSnowflakeId()` 提前生成），故父表先行无任何实现障碍
- **删除** `document.service.ts:134-138` 的补偿删除（catch 里 `contentModel.deleteOne`）
- MQ 投递（`safePublish`）与 ES/图谱索引**保持在事务之外** —— 外部副作用不应进事务，维持现状语义

### 4.4 建 FK：`kh_document_content.document_id → kh_document(id) ON DELETE CASCADE`

**现有 schema 的实际分野**（不是"有无 FK"，而是"建在哪类表"）：

| 建了 FK | 未建 FK（仅注释箭头） |
|---|---|
| `kh_user_role` → user/role（`:78-79`） | `kh_document_review.document_id`（`:35`） |
| `kh_role_permission` → role/permission（`:127-128`） | `kh_document.category_id/team_id/author_id/create_by/update_by` |
| `kh_user_permission` → user/permission（`:135-136`） | `kh_team.leader_id`（`:191`） |
| `kh_team_member` → team/user（`:203-204`） | `kh_ai_session.user_id`（`:226`） |
| **`kh_ai_message.session_id` → `kh_ai_session(id)` CASCADE（`:236`）** | |

分野：**FK 建在「纯关联表 / 强从属明细表」上；主业务表 `kh_document` 的引用留松。**
`kh_document_review` 无 FK 是**有意的** —— 它是审计历史，文档没了也应留存。

`kh_document_content` 属前者：它是文档自身的正文（非审计记录），与 `kh_ai_message → kh_ai_session` **形状完全相同**（正文表 + PK=FK），而该处作者建了 FK 且带 CASCADE。

**选 FK 的理由**：

1. 有最贴近的同类先例（`:236`）
2. **零额外索引成本** —— `document_id` 已是 PK 带唯一索引；PG 不为 FK 在子表另建索引，父表删除检查走 PK 索引
3. **本次重构唯一能赚回完整性的点** —— 删掉 `content_id` 后应用层成唯一关联来源。今日 Mongo 的 `documentId` 唯一索引至少保证"一条正文只属一个文档"；不建 FK 又不补等价约束，**合库后比现在更松**
4. **不干扰软删** —— FK 只约束"指向不存在的行"，`deleted = true` 的行依然存在。CASCADE 仅物理 DELETE 时触发，当前 `remove()` 是软删故平时不动，价值是将来管理端硬删不留孤儿正文

**不建 FK 的代价**（备选）：写入顺序功能上无所谓，但 DB 层无任何关联约束。

**本次不动**：`kh_document_review.document_id` 等既有松散引用保持原状（既有债，不属本次范围）。

---

## 5. 实施计划

### Step 1 — PG schema

- 新增 `apps/backend/src/document/entities/document-content.entity.ts`
  - `@Entity('kh_document_content')`
  - `document_id` bigint PK（`bigintTransformer`）—— PK 兼 FK，无需额外索引
  - `content` text、`content_length` int、`content_summary` text、`version` int、`deleted` boolean
  - `created_at` / `updated_at`（`@CreateDateColumn` / `@UpdateDateColumn`）
  - 实体侧**只声明裸列**，不引入 `@OneToOne` / `@ManyToOne` relation 装饰器（沿用仓库现有风格：DB 层用 FK 约束，TypeORM 侧不建 relation 图）
- 删除 `apps/backend/src/document/schemas/document-content.schema.ts`
- `document.entity.ts`：移除 `contentId` 字段（`:25-27`）
- `init-scripts/postgresql/01-init.sql`：新增 `kh_document_content` 建表（含 §4.4 的 FK + CASCADE）；`kh_document` 删除 `content_id` 列

### Step 2 — Service 层

- `document.service.ts`：`@InjectModel` / `contentModel` → `this.em`；6 处调用点改写
  - `loadContent(contentId)` → `loadContent(documentId)`（`:569`）
  - 查询条件 `{ _id: doc.contentId, deleted: false }` → `{ where: { documentId: doc.id, deleted: false } }`
  - `$inc: { version: 1 }` → 读取后 `version += 1` 再 save
  - `create` 改为单事务（§4.3）
- `pipeline.orchestrator.ts:186,201`：`contentModel.findOne` → `em.findOne(DocumentContentEntity, ...)`；移除 `:3-4,11-12,38-39` 的 mongoose import 与注入

### Step 3 — Module / 依赖清理

- `document.module.ts`、`pipeline.module.ts`：移除 `MongooseModule.forFeature`
- `app.module.ts`：移除 `MongooseModule` import 与 `forRootAsync`（`:4,81-89`）
- `apps/backend/package.json`：移除 `mongoose`、`@nestjs/mongoose`；`pnpm install`
- `apps/backend/.env.example`：移除 `MONGO_URI`（`:10-11`）

### Step 4 — 基建清理

- `docker-compose.yml`：移除 `mongodb` + `mongo-express` 服务（`:39-75`）
- 删除 `init-scripts/mongodb/`、`volumes/mongo/`
- `README.md`：移除 MongoDB 行（`:12,47,113,133`）与 mongo-express 端口（`:114`）

### Step 5 — 本地库重置：**Mongo 与 PG 必须一起清**

**关键耦合**：本次要 drop `kh_document.content_id`。若保留现有 `kh_document` 行、只换掉 Mongo，这些行在新表里没有对应正文，而 `content_id` 一 drop 就**再无线索**找回 → 产生一批 `status = Published` 但正文为空的文档，且会被当作已发布参与 ES 索引，`findOne` 返回 `content: ''`。**这是最难查的一类脏数据，必须避免。**

三个自洽选项，本次取 A：

| | 做法 | 结论 |
|---|---|---|
| **A（采用）** | Mongo + PG 一起清空重建 | 从零开始，无半残数据 |
| B | 保留 PG + 写 Mongo→PG 正文迁移脚本 | 用户已否（无需迁移） |
| C | 保留 PG + 手工 ALTER、不迁正文 | 留下空正文文档，不推荐 |

```bash
docker compose down
rm -rf volumes/postgres volumes/mongo
docker compose up -d
```

**重建后自动恢复**（`init-scripts/postgresql` 挂载于 `/docker-entrypoint-initdb.d`，`docker-compose.yml:14`，删卷后 init script 自动重跑）：

- 用户：`admin` / `reviewer` / `user`，密码均 `123456`（`:93-97`）
- 角色：`ROLE_ADMIN` / `ROLE_REVIEWER` / `ROLE_USER`（`:86-90`）
- 权限树 + 角色权限关联（`:141-182`）
- 团队：技术中心 / 后端开发组（`:211-214`）

**不可恢复**：开发期创建的文档（随 Mongo 一并弃）、`kh_ai_session` / `kh_ai_message` 会话记录（运行时数据）。

> ✅ 用户确认：AI 会话无需保留，直接双卷清空。

---

## 6. 风险

| 风险 | 说明 | 应对 |
|---|---|---|
| **FK 写入顺序** | 建 FK 后事务内 child 先插会立即撞约束（PG 默认 `NOT DEFERRABLE`） | §4.3 强制父表先行；代码审查重点 |
| **清库不配套** | 只清 Mongo 不清 PG → 一批 `content_id` 已 drop 的空正文文档 | §5 Step 5 明确两个卷必须一起清 |
| 事务边界误改 | `safePublish` 若被挪进事务，MQ 失败会回滚文档状态 | §4.3 明确保持在事务外 |
| `content_summary` 类型 | Mongo 侧原为 String，PG 侧原用 `varchar` | 新表用 `text`，语义等价无长度限制 |
| `version` 自增语义 | Mongo `$inc` 原为原子自增 | 单库单行写入，读改写与 `em.save` 等价 |
| 管线读取失败 | `orchestrator` 改错会静默回退成空正文 | 验证步骤 5 必须确认 ES 内 `content` **非空** |
| 全量重扫依赖 | `loadAllPublishedDocuments` 为 N+1 循环 | 本次保持现状（§7），不引入行为变化 |
| 无自动化测试 | 仓库仅有 `app.controller.spec.ts`，无 document 用例 | 验证依赖 build + 运行时冒烟，需人工确认接口响应 |

---

## 7. 遗留 / 后续（本次不做）

- **N+1 查询**：`loadDocumentsByIds`（`:180-195`）与 `loadAllPublishedDocuments`（`:198-207`）仍是循环单查。合库后可用一次 join 取回，属独立优化，不并入本次以保持 diff 可审。
- **`contentSummary` 冗余**：PG 侧 `kh_document.summary` 与正文侧 `content_summary` 存在重复，是否合并可另议。

---

## 8. 验证

1. `pnpm build` 通过
2. 全仓库 grep `mongoose|MONGO_URI|mongodb` 仅剩历史 spec/mydocs，无源码与配置命中
3. `docker compose up -d`（无 mongo 容器）→ 后端正常启动，日志无 Mongo 连接错误
4. 接口冒烟：create → findOne（`content` 正确）→ update（`version` 递增、`content` 更新）→ publish → archive → remove（两侧 `deleted` 均为 true）
5. 触发管线 INDEX → ES `kh_document` 查询该文档，确认 `content` 字段有值
6. FK 已生效：`\d kh_document_content` 显示 `document_id` 的 FK 约束至 `kh_document(id)`
7. FK 正向校验：手动 `INSERT INTO kh_document_content (document_id, ...) VALUES (<不存在的 id>, ...)` 应被拒绝
8. 删除顺序校验：`DELETE FROM kh_document WHERE id = <已有关联正文的 id>`（事务内回滚）应连带清除正文行

---

## 9. Recap Checkpoint

- **当前目标**：移除 MongoDB，正文改存 PG `kh_document_content` — **已由证据证明完成**
- **已完成**：Schema / Service / Module / 依赖 / compose / README / 双卷重建 / build / 冒烟 / FK
- **关键决策**：见上；执行中额外将 Docker PG 宿主机端口改为 **5433**（本机 `postgresql-x64-18` 占 5432）
- **当前边界**：代码与基建改动已落地；无 mongo 残留（仅本 spec 历史叙述）
- **下一步**：无（任务闭环）。可选：把 5433 映射是否永久保留同步进项目长期文档
- **验证风险**：已通过人工冒烟 + ES + FK SQL 校验

---

## 10. Change Log

- 新增 `DocumentContentEntity` / `kh_document_content`（PK=FK CASCADE）
- `DocumentEntity` 删除 `contentId`；`document.service` / `pipeline.orchestrator` 改读 PG
- 移除 `mongoose` / `@nestjs/mongoose` / `MONGO_URI` / mongodb+mongo-express 容器与 init
- `create` 单事务父表先行；删除 Mongo 补偿删除
- Docker Postgres 映射 `5433:5432`，`.env` / README 同步（规避本机 PG 18）

## 11. Validation

| # | 条件 | 结果 |
|---|---|---|
| 1 | `pnpm build` | ✅ |
| 2 | grep 无 mongoose/MONGO_URI/mongodb（源码/配置/依赖） | ✅ 仅剩本 spec |
| 3 | 无 Mongo 容器，后端启动 | ✅ Nest started，日志无 Mongo |
| 4 | create→findOne→update→publish→approve→saveAsDraft→archive→remove | ✅ 两侧 soft-delete `t\|t` |
| 5 | ES `kh_document` content 非空 | ✅ `# Hello PG body v2` |
| 6 | 无补偿删除逻辑 | ✅ create 单事务 |
| 7 | FK CASCADE | ✅ `\d` 可见；孤儿 INSERT 拒绝；DELETE 父行 leftover=0 |

## 12. Resume / Handoff

任务已完成，无需续接。若新开 chat：核心结论是正文已在 `kh_document_content`，Mongo 已移除；本地开发连 PG 用 **5433**。

长期事实已同步至 `mydocs/PROJECT_KNOWLEDGE.md`。

---
