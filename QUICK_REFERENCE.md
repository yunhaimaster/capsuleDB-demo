# ⚡ 快速參考指南

## 📋 目錄
1. [常用命令](#常用命令)
2. [文件結構](#文件結構)
3. [樣式類速查](#樣式類速查)
4. [API 端點速查](#api-端點速查)
5. [組件速查](#組件速查)
6. [故障排除速查](#故障排除速查)

---

## 🚀 常用命令

### 開發命令
```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建項目
npm run build

# 類型檢查
npm run type-check

# 代碼檢查
npm run lint

# 測試
npm test
```

### 數據庫命令
```bash
# 生成 Prisma 客戶端
npx prisma generate

# 運行遷移
npx prisma migrate dev

# 推送 schema
npx prisma db push

# 打開 Prisma Studio
npx prisma studio

# 重置數據庫
npx prisma migrate reset
```

### Git 命令
```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "描述"

# 推送到 GitHub
git push origin main

# 查看狀態
git status

# 查看日誌
git log --oneline
```

### Vercel 命令
```bash
# 安裝 CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel --prod

# 查看環境變數
vercel env ls

# 拉取環境變數
vercel env pull .env.local
```

---

## 📁 文件結構

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API 路由
│   │   ├── ai/                  # AI 相關 API
│   │   ├── orders/              # 訂單 API
│   │   └── ingredients/         # 原料 API
│   ├── orders/                  # 訂單頁面
│   ├── reports/                 # 報表頁面
│   └── globals.css              # 全局樣式
├── components/                   # React 組件
│   ├── ui/                      # 基礎 UI 組件
│   ├── ai/                      # AI 組件
│   ├── forms/                   # 表單組件
│   ├── orders/                  # 訂單組件
│   └── auth/                    # 認證組件
├── hooks/                       # 自定義 Hooks
├── lib/                         # 工具函數
└── types/                       # 類型定義
```

---

## 🎨 樣式類速查

### 液態玻璃卡片
```css
.liquid-glass-card                    /* 基礎卡片 */
.liquid-glass-card-brand              /* 品牌色卡片 */
.liquid-glass-card-elevated           /* 高級卡片 */
.liquid-glass-card-interactive        /* 互動卡片 */
.liquid-glass-card-refraction         /* 折射效果 */
.liquid-glass-content                 /* 卡片內容容器 */
```

### 圖標容器
```css
.icon-container                       /* 基礎容器 */
.icon-container-blue                  /* 藍色漸變 */
.icon-container-red                   /* 紅色漸變 */
.icon-container-green                 /* 綠色漸變 */
.icon-container-yellow                /* 黃色漸變 */
.icon-container-purple                /* 紫色漸變 */
```

### 響應式間距
```css
.page-content-spacing                 /* 頁面內容間距 */
.card-spacing                         /* 卡片間距 */
```

### 背景動畫
```css
.brand-logo-pattern-bg                /* 品牌 Logo 背景 */
.floating-shapes                      /* 浮動形狀 */
.floating-orbs                        /* 浮動球體 */
.floating-dots                        /* 浮動點 */
```

### 響應式斷點
```css
sm: (640px+)                          /* 小屏幕 */
md: (768px+)                          /* 中等屏幕 */
lg: (1024px+)                         /* 大屏幕 */
xl: (1280px+)                         /* 超大屏幕 */
2xl: (1536px+)                        /* 2K 屏幕 */
```

---

## 🔌 API 端點速查

### AI API
```
POST /api/ai/chat                     # AI 聊天對話
POST /api/ai/parse-recipe             # 配方解析
POST /api/ai/assess-risk              # 風險評估
POST /api/ai/translate                # 文本翻譯
```

### 訂單 API
```
GET    /api/orders                    # 獲取訂單列表
POST   /api/orders                    # 創建訂單
GET    /api/orders/[id]               # 獲取訂單詳情
PUT    /api/orders/[id]               # 更新訂單
DELETE /api/orders/[id]               # 刪除訂單
GET    /api/orders/export             # 導出訂單
GET    /api/orders/options            # 獲取篩選選項
```

### 其他 API
```
GET    /api/ingredients/stats         # 原料統計
POST   /api/migrate                   # 數據庫遷移
GET    /api/test-db                   # 數據庫測試
```

---

## 🧩 組件速查

### 基礎組件
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
```

### 液態玻璃組件
```typescript
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero'
```

### AI 組件
```typescript
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { AIThinkingIndicator } from '@/components/ui/ai-thinking-indicator'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'
```

### 表單組件
```typescript
import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { LinkedFilter } from '@/components/ui/linked-filter'
```

### 工具組件
```typescript
import ErrorBoundary from '@/components/ui/error-boundary'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
```

---

## 🔧 故障排除速查

### 常見錯誤

#### 構建失敗
```bash
# 檢查 TypeScript 錯誤
npm run type-check

# 檢查 linting 錯誤
npm run lint

# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

#### 數據庫錯誤
```bash
# 檢查連接
npx prisma db pull

# 重新生成客戶端
npx prisma generate

# 重置數據庫
npx prisma migrate reset
```

#### 部署錯誤
```bash
# 檢查構建日誌
vercel logs

# 檢查環境變數
vercel env ls

# 本地測試構建
npm run build
```

#### AI API 錯誤
```bash
# 測試 API 密鑰
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models

# 檢查配額
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/auth/key
```

### 性能問題
```typescript
// 數據庫查詢優化
const orders = await prisma.productionOrder.findMany({
  take: 10,
  select: {
    id: true,
    customerName: true,
    productName: true
  }
})

// 緩存響應
const cacheKey = `orders:${JSON.stringify(filters)}`
const cached = await redis.get(cacheKey)
```

---

## 📝 代碼模板

### 新頁面模板
```typescript
'use client'

import { useState, useEffect } from 'react'
import { LiquidGlassHero } from '@/components/ui/liquid-glass-hero'

export default function MyPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 初始化邏輯
  }, [])

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <div className="page-content-spacing">
        <div className="max-w-7xl mx-auto space-y-6">
          <LiquidGlassHero
            title="頁面標題"
            description="頁面描述"
          />
          
          <div className="liquid-glass-card">
            <div className="liquid-glass-content">
              {/* 內容 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 新 API 端點模板
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 處理邏輯
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('API 錯誤:', error)
    
    return NextResponse.json({
      success: false,
      error: '錯誤信息'
    }, { status: 500 })
  }
}
```

### 新組件模板
```typescript
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps {
  className?: string
  children?: React.ReactNode
}

export function MyComponent({ 
  className, 
  children 
}: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  )
}
```

---

## 🔑 環境變數速查

### 必需變數
```bash
DATABASE_URL=postgresql://...         # 數據庫連接
OPENROUTER_API_KEY=sk-or-...         # AI API 密鑰
OPENROUTER_API_URL=https://...       # AI API URL
NEXT_PUBLIC_APP_URL=https://...      # 應用 URL
NODE_ENV=production                  # 環境模式
```

### 可選變數
```bash
ENCRYPTION_KEY=your-key              # 加密密鑰
REDIS_URL=redis://...                # Redis 連接
SENTRY_DSN=https://...               # 錯誤追蹤
```

---

## 📊 監控指標

### 關鍵指標
- **響應時間**: < 500ms (API), < 2s (頁面)
- **錯誤率**: < 1%
- **可用性**: > 99.9%
- **數據庫查詢**: < 100ms

### 監控工具
- Vercel Analytics
- Vercel Speed Insights
- Performance Monitor 組件
- Error Boundary 組件

---

## 📞 緊急聯繫

### 聯繫方式
- **技術支持**: Victor
- **部署問題**: Vercel Dashboard
- **數據庫問題**: PostgreSQL 服務商

### 有用鏈接
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/yunhaimaster/easypack-capsule-management)
- [Prisma Studio](https://www.prisma.io/studio)
- [OpenRouter Dashboard](https://openrouter.ai/keys)

---

*最後更新: 2025年9月30日*
