@echo off
REM EasyPack PostgreSQL 設置腳本 (Windows)
echo 🚀 開始設置 EasyPack PostgreSQL 環境...

REM 檢查 Docker 是否安裝
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未安裝，請先安裝 Docker Desktop
    echo 📥 下載地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM 檢查 Docker Compose 是否可用
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安裝
    pause
    exit /b 1
)

echo ✅ Docker 環境檢查通過

REM 創建 .env 文件
echo 📝 創建 PostgreSQL 環境配置...
(
echo # PostgreSQL Database Configuration
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/capsuledb"
echo.
echo # App Configuration
echo NEXT_PUBLIC_APP_NAME="EasyPack 膠囊配方管理系統"
echo NEXT_PUBLIC_APP_VERSION="2.0.0"
echo.
echo # API Configuration
echo NEXT_PUBLIC_APP_URL="https://easypack-capsule-management.vercel.app"
echo OPENROUTER_API_URL="https://openrouter.ai/api/v1/chat/completions"
echo OPENROUTER_API_KEY="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"
echo.
echo # Production Settings
echo NODE_ENV="production"
) > .env

echo ✅ .env 文件創建完成

REM 啟動 PostgreSQL 容器
echo 🐘 啟動 PostgreSQL 容器...
docker-compose up -d postgres

REM 等待 PostgreSQL 啟動
echo ⏳ 等待 PostgreSQL 啟動...
timeout /t 10 /nobreak >nul

REM 檢查容器狀態
docker-compose ps postgres | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 容器啟動成功
) else (
    echo ❌ PostgreSQL 容器啟動失敗
    docker-compose logs postgres
    pause
    exit /b 1
)

REM 安裝依賴
echo 📦 安裝項目依賴...
npm install

REM 生成 Prisma 客戶端
echo 🔧 生成 Prisma 客戶端...
npx prisma generate

REM 運行數據庫遷移
echo 🗄️ 運行數據庫遷移...
npx prisma migrate deploy

echo 🎉 PostgreSQL 設置完成！
echo.
echo 📊 服務狀態:
echo   - PostgreSQL: http://localhost:5432
echo   - pgAdmin: http://localhost:5050 (admin@easypack.com / admin)
echo.
echo 🚀 啟動開發服務器:
echo   npm run dev
echo.
echo 🔍 數據庫管理:
echo   npx prisma studio
echo.
echo 📋 可用的 Docker 命令:
echo   docker-compose up -d          # 啟動所有服務
echo   docker-compose down           # 停止所有服務
echo   docker-compose logs postgres  # 查看 PostgreSQL 日誌
echo   docker-compose restart        # 重啟服務

pause
