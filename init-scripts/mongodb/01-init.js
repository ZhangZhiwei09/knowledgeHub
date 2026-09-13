-- MongoDB 初始化脚本 (mongosh 语法)
-- 该脚本会在数据库首次创建时执行（绑定至 /docker-entrypoint-initdb.d）
-- 注意：MONGO_INITDB_DATABASE=knowledge_hub，因此这里 db 指向 knowledge_hub

// 创建示例集合（按需保留或删除）
db.createCollection("documents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "createdAt"],
      properties: {
        title: { bsonType: "string", description: "must be a string and is required" },
        content: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.documents.createIndex({ title: "text", content: "text" });
db.documents.createIndex({ createdAt: -1 });

// 创建专门的 KG 实体存储集合
db.createCollection("kg_entities");
db.kg_entities.createIndex({ name: 1 }, { unique: true });

// 创建向量缓存集合
db.createCollection("embeddings");
db.embeddings.createIndex({ docId: 1 });
