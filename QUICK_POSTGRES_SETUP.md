# 🚀 快速 PostgreSQL 設置指南

## 方法 1: 使用 Neon (推薦 - 免費線上 PostgreSQL)

### 步驟 1: 註冊 Neon
1. 訪問 [neon.tech](https://neon.tech)
2. 點擊 "Sign Up" 註冊（可用 GitHub 登入）
3. 選擇免費計劃

### 步驟 2: 創建數據庫
1. 點擊 "Create Project"
2. 項目名稱：`easypack-capsule-db`
3. 選擇離您最近的區域
4. 點擊 "Create Project"

### 步驟 3: 獲取連接字符串
1. 在項目儀表板中，點擊 "Connection Details"
2. 複製 "Connection String"
3. 格式類似：`postgresql://username:password@host/database?sslmode=require`

### 步驟 4: 更新環境變數
將連接字符串設置為 `DATABASE_URL`：

```bash
# 在 .env 文件中
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

## 方法 2: 使用本地 Docker (如果您有 Docker)

### 快速啟動
```bash
# 運行設置腳本
./setup-postgresql.sh
```

### 手動啟動
```bash
# 啟動 PostgreSQL
docker-compose -f docker-compose.postgres.yml up -d

# 設置環境變數
echo 'DATABASE_URL="postgresql://easypack:easypack123@localhost:5432/capsuledb"' > .env.local
```

## 方法 3: 使用 Vercel Postgres (用於部署)

1. 在 Vercel Dashboard 中創建 Postgres 數據庫
2. 獲取連接字符串
3. 設置為環境變數

## 完成設置後

```bash
# 生成 Prisma 客戶端
npx prisma generate

# 運行數據庫遷移
npx prisma migrate dev --name init_postgresql

# 啟動開發服務器
npm run dev
```

## 驗證設置

訪問 `http://localhost:3000/api/test-db` 檢查數據庫連接狀態。
