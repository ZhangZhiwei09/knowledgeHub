-- PostgreSQL 初始化脚本
-- 启用 pgvector 扩展（向量数据库支持）
CREATE EXTENSION IF NOT EXISTS vector;

-- 如需创建初始表结构，可在下方添加
-- 示例：
-- CREATE TABLE IF NOT EXISTS documents (
--     id BIGSERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     content TEXT,
--     embedding vector(1536),
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
--     USING hnsw (embedding vector_cosine_ops);
