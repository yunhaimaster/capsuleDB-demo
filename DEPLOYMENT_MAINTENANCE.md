# 🚀 部署與維護指南

## 📋 目錄
1. [部署概述](#部署概述)
2. [Vercel 部署](#vercel-部署)
3. [環境配置](#環境配置)
4. [數據庫管理](#數據庫管理)
5. [監控與日誌](#監控與日誌)
6. [維護任務](#維護任務)
7. [故障排除](#故障排除)
8. [安全維護](#安全維護)

---

## 🌐 部署概述

### 部署架構
```
GitHub Repository
       ↓
   Vercel Platform
       ↓
  PostgreSQL Database
       ↓
   OpenRouter AI API
```

### 技術棧
- **前端**: Next.js 14, React 18, TypeScript
- **部署平台**: Vercel
- **數據庫**: PostgreSQL (生產), SQLite (開發)
- **AI 服務**: OpenRouter API
- **域名**: easypack-capsule-management.vercel.app

---

## ⚡ Vercel 部署

### 自動部署設置

#### 1. 連接 GitHub 倉庫
1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "New Project"
3. 選擇 GitHub 倉庫: `yunhaimaster/easypack-capsule-management`
4. 配置項目設置

#### 2. 構建配置
```json
// vercel.json (可選)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

#### 3. 環境變數設置
在 Vercel Dashboard → Project Settings → Environment Variables 中設置：

```bash
# 數據庫
DATABASE_URL=postgresql://username:password@host:port/database

# AI 服務
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions

# 應用配置
NEXT_PUBLIC_APP_URL=https://easypack-capsule-management.vercel.app
NODE_ENV=production
```

### 手動部署
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署到生產環境
vercel --prod

# 查看部署狀態
vercel ls
```

### 部署檢查清單
- [ ] 環境變數已正確設置
- [ ] 數據庫連接正常
- [ ] AI API 密鑰有效
- [ ] 構建無錯誤
- [ ] 所有頁面可正常訪問
- [ ] API 端點響應正常

---

## 🔧 環境配置

### 開發環境 (.env.local)
```bash
# 數據庫 (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# AI 服務
OPENROUTER_API_KEY=your-development-api-key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions

# 應用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 生產環境 (Vercel)
```bash
# 數據庫 (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# AI 服務
OPENROUTER_API_KEY=your-production-api-key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions

# 應用配置
NEXT_PUBLIC_APP_URL=https://easypack-capsule-management.vercel.app
NODE_ENV=production
```

### 環境變數管理
```bash
# 檢查環境變數
vercel env ls

# 添加環境變數
vercel env add VARIABLE_NAME

# 刪除環境變數
vercel env rm VARIABLE_NAME

# 拉取環境變數到本地
vercel env pull .env.local
```

---

## 🗄️ 數據庫管理

### PostgreSQL 設置

#### 1. 創建數據庫
```sql
-- 創建數據庫
CREATE DATABASE easypack_capsule_management;

-- 創建用戶
CREATE USER easypack_user WITH PASSWORD 'secure_password';

-- 授權
GRANT ALL PRIVILEGES ON DATABASE easypack_capsule_management TO easypack_user;
```

#### 2. 數據庫遷移
```bash
# 本地遷移
npx prisma migrate dev

# 生產環境遷移
npx prisma migrate deploy

# 重置數據庫 (謹慎使用)
npx prisma migrate reset
```

#### 3. 數據庫備份
```bash
# 備份數據庫
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢復數據庫
psql $DATABASE_URL < backup_file.sql
```

### Prisma 管理
```bash
# 生成 Prisma 客戶端
npx prisma generate

# 查看數據庫狀態
npx prisma db pull

# 推送 schema 變更
npx prisma db push

# 打開 Prisma Studio
npx prisma studio
```

---

## 📊 監控與日誌

### Vercel 監控
1. **Analytics**: 查看訪問統計
2. **Functions**: 監控 API 函數執行
3. **Speed Insights**: 性能監控
4. **Error Tracking**: 錯誤追蹤

### 應用監控
```typescript
// 性能監控組件 (開發環境)
import { PerformanceMonitor } from '@/components/ui/performance-monitor'

// 錯誤邊界
import ErrorBoundary from '@/components/ui/error-boundary'

// 使用示例
<ErrorBoundary>
  <PerformanceMonitor />
  <App />
</ErrorBoundary>
```

### 日誌記錄
```typescript
// API 錯誤日誌
console.error('API 錯誤:', {
  endpoint: '/api/orders',
  method: 'POST',
  error: error.message,
  timestamp: new Date().toISOString()
})

// 性能日誌
console.log('頁面載入時間:', performance.now())
```

### 健康檢查
```typescript
// 創建健康檢查端點
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    ai: await checkAI(),
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(checks)
}
```

---

## 🔄 維護任務

### 日常維護 (每日)
- [ ] 檢查應用運行狀態
- [ ] 查看錯誤日誌
- [ ] 監控 API 響應時間
- [ ] 檢查數據庫連接

### 週期維護 (每週)
- [ ] 檢查依賴包更新
- [ ] 運行安全掃描
- [ ] 檢查數據庫性能
- [ ] 備份重要數據

### 月度維護 (每月)
- [ ] 更新依賴包
- [ ] 檢查安全漏洞
- [ ] 優化數據庫查詢
- [ ] 清理舊日誌文件

### 季度維護 (每季度)
- [ ] 代碼重構評估
- [ ] 架構優化
- [ ] 用戶反饋分析
- [ ] 功能規劃

### 維護腳本
```bash
#!/bin/bash
# maintenance.sh

echo "開始維護任務..."

# 檢查應用狀態
curl -f https://easypack-capsule-management.vercel.app/api/health

# 備份數據庫
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 檢查依賴更新
npm outdated

# 運行測試
npm test

echo "維護任務完成"
```

---

## 🔧 故障排除

### 常見問題

#### 1. 部署失敗
**症狀**: Vercel 部署失敗
**原因**: 
- 環境變數缺失
- 構建錯誤
- 依賴問題

**解決方案**:
```bash
# 檢查構建日誌
vercel logs

# 本地測試構建
npm run build

# 檢查環境變數
vercel env ls
```

#### 2. 數據庫連接失敗
**症狀**: 應用無法連接數據庫
**原因**:
- DATABASE_URL 錯誤
- 數據庫服務不可用
- 網絡問題

**解決方案**:
```bash
# 測試數據庫連接
npx prisma db pull

# 檢查數據庫狀態
npx prisma migrate status

# 重新部署遷移
npx prisma migrate deploy
```

#### 3. AI API 錯誤
**症狀**: AI 功能不工作
**原因**:
- API 密鑰過期
- API 配額用完
- 網絡問題

**解決方案**:
```bash
# 檢查 API 密鑰
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models

# 更新 API 密鑰
vercel env add OPENROUTER_API_KEY
```

#### 4. 性能問題
**症狀**: 應用響應慢
**原因**:
- 數據庫查詢慢
- 大量數據處理
- 網絡延遲

**解決方案**:
```typescript
// 優化數據庫查詢
const orders = await prisma.productionOrder.findMany({
  take: 10, // 限制結果數量
  include: {
    ingredients: true
  },
  orderBy: {
    createdAt: 'desc'
  }
})

// 添加緩存
const cachedData = await redis.get('orders:recent')
if (cachedData) {
  return JSON.parse(cachedData)
}
```

### 錯誤代碼參考
- `BUILD_ERROR`: 構建失敗
- `RUNTIME_ERROR`: 運行時錯誤
- `DATABASE_ERROR`: 數據庫錯誤
- `AI_SERVICE_ERROR`: AI 服務錯誤
- `VALIDATION_ERROR`: 數據驗證錯誤

---

## 🔒 安全維護

### 安全檢查清單
- [ ] 環境變數安全存儲
- [ ] API 密鑰定期輪換
- [ ] 數據庫訪問控制
- [ ] HTTPS 強制使用
- [ ] 輸入數據驗證
- [ ] 錯誤信息不洩露敏感數據

### API 密鑰管理
```bash
# 輪換 API 密鑰
vercel env rm OPENROUTER_API_KEY
vercel env add OPENROUTER_API_KEY

# 檢查密鑰使用情況
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/auth/key
```

### 數據保護
```typescript
// 敏感數據加密
import crypto from 'crypto'

function encryptData(data: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

// 數據驗證
import { z } from 'zod'

const orderSchema = z.object({
  customerName: z.string().min(1).max(100),
  productionQuantity: z.number().positive()
})
```

### 安全監控
```typescript
// 記錄可疑活動
function logSecurityEvent(event: string, details: any) {
  console.warn('安全事件:', {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: getClientIP()
  })
}

// 速率限制
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100 // 限制每個 IP 100 次請求
})
```

---

## 📈 性能優化

### 前端優化
```typescript
// 代碼分割
const LazyComponent = React.lazy(() => import('./HeavyComponent'))

// 圖片優化
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority
/>

// 緩存策略
export const revalidate = 3600 // 1 小時
```

### 後端優化
```typescript
// 數據庫查詢優化
const orders = await prisma.productionOrder.findMany({
  select: {
    id: true,
    customerName: true,
    productName: true,
    createdAt: true
  },
  take: 20,
  orderBy: {
    createdAt: 'desc'
  }
})

// 響應緩存
const cacheKey = `orders:${JSON.stringify(filters)}`
const cached = await redis.get(cacheKey)
if (cached) {
  return JSON.parse(cached)
}
```

### 監控指標
- **響應時間**: < 500ms (API), < 2s (頁面)
- **錯誤率**: < 1%
- **可用性**: > 99.9%
- **數據庫查詢**: < 100ms

---

## 📞 支持與聯繫

### 緊急聯繫
- **技術支持**: Victor
- **部署問題**: 檢查 Vercel Dashboard
- **數據庫問題**: 檢查 PostgreSQL 服務

### 有用資源
- [Vercel 文檔](https://vercel.com/docs)
- [Next.js 文檔](https://nextjs.org/docs)
- [Prisma 文檔](https://www.prisma.io/docs)
- [PostgreSQL 文檔](https://www.postgresql.org/docs)

### 維護日誌模板
```
日期: 2025-09-29
維護人員: Victor
任務: 例行維護
執行項目:
- [ ] 檢查應用狀態
- [ ] 備份數據庫
- [ ] 更新依賴
問題記錄:
- 無問題
下次維護: 2025-10-06
```

---

*最後更新: 2025年9月30日*
