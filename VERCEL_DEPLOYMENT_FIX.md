# Vercel 部署修復指南

## 問題描述
Vercel 部署時出現 `PrismaClientInitializationError`，錯誤信息：
```
the URL must start with the protocol 'file:'
```

## 問題原因
- 本地開發使用 SQLite，但 Vercel 生產環境需要使用 PostgreSQL
- Prisma schema 配置不匹配環境

## 解決方案

### 1. 更新 Prisma Schema
已將 `prisma/schema.prisma` 中的 provider 從 `sqlite` 改為 `postgresql`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. 修復 API 路由
已更新以下 API 路由以支持 PostgreSQL：
- `src/app/api/ai/price-analysis/route.ts` - 添加 `mode: 'insensitive'`
- `src/app/api/database/recipes/route.ts` - 添加 `mode: 'insensitive'`

### 3. Vercel 環境變量設置
在 Vercel 控制台中設置以下環境變量：

```
DATABASE_URL=postgresql://username:password@host:port/database
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. 數據庫遷移
在 Vercel 部署後，需要運行數據庫遷移：

```bash
# 在 Vercel 函數中或本地連接 Vercel 數據庫
npx prisma migrate deploy
```

### 5. 本地開發配置
為了支持本地開發，建議：

1. 創建 `.env.local` 文件（本地開發）：
```
DATABASE_URL="file:./prisma/prisma/dev.db"
```

2. 創建 `.env.production` 文件（生產環境）：
```
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 6. 部署步驟
1. 確保 Vercel 項目設置了正確的環境變量
2. 推送代碼到 GitHub
3. Vercel 會自動部署
4. 部署成功後，訪問應用測試功能

## 注意事項
- 本地開發仍可使用 SQLite
- 生產環境必須使用 PostgreSQL
- 確保 Vercel 數據庫連接字符串正確
- 首次部署後可能需要手動運行數據庫遷移

## 測試
部署完成後，測試以下功能：
- [ ] 主頁 v2.0 功能卡片
- [ ] AI 配方生成器
- [ ] 價格分析器
- [ ] 工作單生成
- [ ] 配方資料庫
- [ ] 導航菜單
