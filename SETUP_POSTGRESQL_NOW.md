# 🚀 立即設置 PostgreSQL

## 步驟 1: 獲取免費 PostgreSQL 數據庫

### 選項 A: Neon (推薦)
1. 訪問 [neon.tech](https://neon.tech)
2. 用 GitHub 登入
3. 創建項目：`easypack-capsule-db`
4. 複製連接字符串

### 選項 B: Supabase
1. 訪問 [supabase.com](https://supabase.com)
2. 創建新項目
3. 在 Settings → Database 獲取連接字符串

## 步驟 2: 更新環境變數

編輯 `.env` 文件，將 `DATABASE_URL` 替換為您的 PostgreSQL 連接字符串：

```bash
# 將這行：
DATABASE_URL="file:./prisma/prisma/dev.db"

# 替換為：
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

## 步驟 3: 運行數據庫遷移

```bash
# 生成 Prisma 客戶端
npx prisma generate

# 運行數據庫遷移
npx prisma migrate dev --name init_postgresql

# 啟動開發服務器
npm run dev
```

## 步驟 4: 驗證設置

訪問 `http://localhost:3000/api/test-db` 檢查數據庫連接。

## 如果遇到問題

1. **檢查連接字符串格式**：確保以 `postgresql://` 開頭
2. **檢查網絡連接**：確保可以訪問數據庫主機
3. **檢查 SSL 設置**：某些服務需要 `?sslmode=require`

## 快速測試命令

```bash
# 測試數據庫連接
npx prisma db push

# 查看數據庫狀態
npx prisma studio
```
