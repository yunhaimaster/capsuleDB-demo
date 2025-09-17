#!/bin/bash

echo "🚀 膠囊配方管理系統 - 快速設定"
echo "=================================="

# 檢查 Node.js 是否已安裝
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js (版本 18 或以上)"
    exit 1
fi

# 檢查 npm 是否已安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 請先安裝 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安裝"

# 安裝依賴
echo "📦 安裝專案依賴..."
npm install

# 複製環境變數檔案
if [ ! -f .env.local ]; then
    echo "⚙️  設定環境變數..."
    cp env.example .env.local
    echo "✅ 已創建 .env.local 檔案"
else
    echo "✅ .env.local 檔案已存在"
fi

# 生成 Prisma 客戶端
echo "🗄️  初始化資料庫..."
npm run db:generate

# 推送資料庫結構
npm run db:push

# 種子測試資料
echo "🌱 載入測試資料..."
npm run db:seed

echo ""
echo "🎉 設定完成！"
echo ""
echo "啟動開發伺服器："
echo "  npm run dev"
echo ""
echo "然後開啟瀏覽器訪問："
echo "  http://localhost:3000"
echo ""
echo "其他可用指令："
echo "  npm test          # 執行測試"
echo "  npm run build     # 建置專案"
echo "  npm start         # 啟動生產伺服器"
echo ""
