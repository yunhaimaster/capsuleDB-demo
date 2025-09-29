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
- 變數名：`DATABASE_URL`
- 值：從步驟 2 複製的連接字符串

## 4. 本地開發設置

創建 `.env.local` 文件：
```
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

## 5. 運行數據庫遷移

```bash
npx prisma migrate dev
npx prisma generate
```
