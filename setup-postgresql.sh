#!/bin/bash

echo "🐘 EasyPack PostgreSQL 設置腳本"
echo "================================"

# 檢查是否已安裝 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝。請先安裝 Docker Desktop"
    echo "   下載地址: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker 已安裝"

# 檢查是否已安裝 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝"
    exit 1
fi

echo "✅ Docker Compose 已安裝"

# 啟動 PostgreSQL 容器
echo "🚀 啟動 PostgreSQL 容器..."
docker-compose -f docker-compose.postgres.yml up -d

# 等待數據庫啟動
echo "⏳ 等待數據庫啟動..."
sleep 10

# 檢查容器狀態
if docker ps | grep -q "easypack-postgres"; then
    echo "✅ PostgreSQL 容器運行中"
else
    echo "❌ PostgreSQL 容器啟動失敗"
    exit 1
fi

# 設置環境變數
echo "📝 設置環境變數..."
cat > .env.local << EOF
# PostgreSQL Database
DATABASE_URL="postgresql://easypack:easypack123@localhost:5432/capsuledb"

# App Configuration
NEXT_PUBLIC_APP_NAME="EasyPack 膠囊配方管理系統"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Configuration
OPENROUTER_API_URL="https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY=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
EOF

echo "✅ 環境變數已設置到 .env.local"

# 生成 Prisma 客戶端
echo "🔧 生成 Prisma 客戶端..."
npx prisma generate

# 運行數據庫遷移
echo "📊 運行數據庫遷移..."
npx prisma migrate dev --name init_postgresql

echo ""
echo "🎉 PostgreSQL 設置完成！"
echo ""
echo "📋 數據庫信息："
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: capsuledb"
echo "   Username: easypack"
echo "   Password: easypack123"
echo ""
echo "🚀 現在可以運行: npm run dev"
echo ""
echo "🔧 管理命令："
echo "   停止數據庫: docker-compose -f docker-compose.postgres.yml down"
echo "   重啟數據庫: docker-compose -f docker-compose.postgres.yml restart"
echo "   查看日誌: docker-compose -f docker-compose.postgres.yml logs"