# EasyPack 膠囊配方管理系統

一個專為保健品公司設計的內部生產管理系統，用於膠囊配方的建檔與生產記錄管理。

## 功能特色

### 配方建檔模組
- ✅ 新增/編輯膠囊配方
- ✅ 動態原料條目管理
- ✅ 即時驗證與自動計算
- ✅ 一鍵複製配方清單

### 生產記錄模組
- ✅ 記錄清單檢視與搜尋篩選
- ✅ 多維度排序與分頁
- ✅ 詳細記錄查看
- ✅ CSV 匯出功能
- ✅ 列印友好樣式

### 自動計算功能
- ✅ 單粒總重量自動加總
- ✅ 各原料批次用量計算
- ✅ 智慧單位轉換 (mg/g/kg)
- ✅ 批次總重量合計

## 技術架構

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **後端**: Next.js API Routes + Prisma ORM
- **資料庫**: SQLite (開發) / PostgreSQL (生產)
- **表單驗證**: React Hook Form + Zod
- **UI 組件**: Radix UI + Lucide React
- **匯出功能**: CSV 匯出

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp env.example .env.local
```

編輯 `.env.local` 檔案，設定資料庫連線：

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 3. 初始化資料庫

```bash
# 生成 Prisma 客戶端
npm run db:generate

# 推送資料庫結構
npm run db:push

# 種子測試資料
npm run db:seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 專案結構

```
capsuleDB/
├── prisma/
│   ├── schema.prisma          # 資料庫結構定義
│   └── seed.ts               # 測試資料種子
├── src/
│   ├── app/
│   │   ├── api/              # API 路由
│   │   ├── globals.css       # 全域樣式
│   │   ├── layout.tsx        # 根佈局
│   │   └── page.tsx          # 首頁
│   ├── components/           # React 組件
│   ├── lib/                  # 工具函數
│   └── types/                # TypeScript 類型定義
├── tests/                    # 測試檔案
├── env.example              # 環境變數範例
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 部署指南

### 開發環境
1. 使用 SQLite 資料庫
2. 執行 `npm run dev` 啟動開發伺服器

### 生產環境
1. 設定 PostgreSQL 資料庫
2. 更新 `.env.local` 中的 `DATABASE_URL`
3. 執行 `npm run build` 建置專案
4. 執行 `npm start` 啟動生產伺服器

### Vercel 部署 (推薦)
```bash
# 1. 推送代碼到 GitHub
git push origin main

# 2. 在 Vercel 中導入專案
# 3. 設定環境變數
# 4. 自動部署完成
```

詳細部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## API 端點

- `GET /api/orders` - 取得生產訂單清單
- `POST /api/orders` - 創建新訂單
- `GET /api/orders/[id]` - 取得特定訂單
- `PUT /api/orders/[id]` - 更新訂單
- `DELETE /api/orders/[id]` - 刪除訂單
- `POST /api/orders/export` - 匯出訂單資料

## 測試

```bash
# 執行單元測試
npm test

# 執行 E2E 測試
npm run test:e2e
```

## 功能說明

### 配方建檔
- 支援動態新增/刪除原料條目
- 即時驗證原料品名唯一性
- 自動計算單粒總重量和批次總重量
- 智慧單位轉換顯示

### 生產記錄管理
- 多維度搜尋篩選（客戶名稱、產品代號、日期範圍、生產狀態）
- 分頁顯示與排序功能
- 詳細記錄檢視與編輯
- 一鍵匯出 CSV 格式

### 資料驗證
- 客戶名稱：1-100 字
- 產品代號：1-100 字
- 生產數量：1-5,000,000 粒
- 原料品名：1-100 字，支援中英數、括號、連字符
- 單粒含量：0.00001-10,000 mg，精度至小數點後 5 位

## 授權

MIT License

## 支援

如有問題或建議，請聯繫開發團隊。
