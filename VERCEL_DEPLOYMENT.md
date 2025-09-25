# Vercel 部署配置

## 環境變數設置

在 Vercel 項目設置中，需要配置以下環境變數：

### 必需的環境變數

1. **DATABASE_URL**
   - 值：你的 PostgreSQL 數據庫連接字符串
   - 格式：`postgresql://username:password@host:port/database`

2. **DIRECT_URL** (可選，用於連接池)
   - 值：與 DATABASE_URL 相同
   - 格式：`postgresql://username:password@host:port/database`

3. **OPENROUTER_API_KEY**
   - 值：你的 OpenRouter API 密鑰

### 推薦的數據庫服務

- **Vercel Postgres** (推薦)
- **PlanetScale**
- **Supabase**
- **Neon**

### 部署步驟

1. 在 Vercel 項目設置中添加環境變數
2. 確保 DATABASE_URL 指向 PostgreSQL 數據庫
3. 重新部署項目

### 本地開發

本地開發使用 SQLite，不需要額外配置。只需運行：

```bash
npm run dev
```

### 故障排除

如果部署失敗，檢查：
1. DATABASE_URL 是否正確設置
2. 數據庫是否可訪問
3. Prisma schema 是否與數據庫匹配
