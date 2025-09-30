# Vercel Postgres 設置指南

## 1. 在 Vercel 中設置 Postgres

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的項目
3. 進入 **Storage** 標籤
4. 點擊 **Create Database** → **Postgres**
5. 選擇 **Hobby** 計劃（免費）
6. 創建數據庫

## 2. 獲取連接字符串

1. 在 Vercel Dashboard 中
2. 進入 **Storage** → 您的 Postgres 數據庫
3. 點擊 **Connect** 標籤
4. 複製 **Connection String**

## 3. 設置環境變數

在 Vercel 項目設置中：
- 變數名：`POSTGRES_URL`
- 值：從步驟 2 複製的連接字符串（確保包含 `sslmode=require`）
- 變數名：`DATABASE_URL`
- 值：`$POSTGRES_URL`
- （選用）若啟用 Prisma Accelerate，新增：
  - 變數名：`PRISMA_DATABASE_URL`
  - 值：Prisma Accelerate 提供的 `prisma+postgres://...` 字串

## 4. 本地開發設置

創建 `.env.local` 文件：
```
POSTGRES_URL="postgresql://username:password@host:5432/database?sslmode=require"
DATABASE_URL="${POSTGRES_URL}"

# （選用）Prisma Accelerate
# PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"
```

## 5. 運行數據庫遷移

```bash
# 對本地開發資料庫，也可使用 SQLite (預設)
npx prisma migrate dev
npx prisma generate

# 部署前，在 Vercel CI 或手動執行生產遷移
npx prisma migrate deploy
```
