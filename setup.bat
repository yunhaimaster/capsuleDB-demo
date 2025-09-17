@echo off
echo 🚀 膠囊配方管理系統 - 快速設定
echo ==================================

REM 檢查 Node.js 是否已安裝
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 請先安裝 Node.js (版本 18 或以上)
    pause
    exit /b 1
)

REM 檢查 npm 是否已安裝
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 請先安裝 npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安裝

REM 安裝依賴
echo 📦 安裝專案依賴...
npm install

REM 複製環境變數檔案
if not exist .env.local (
    echo ⚙️  設定環境變數...
    copy env.example .env.local
    echo ✅ 已創建 .env.local 檔案
) else (
    echo ✅ .env.local 檔案已存在
)

REM 生成 Prisma 客戶端
echo 🗄️  初始化資料庫...
npm run db:generate

REM 推送資料庫結構
npm run db:push

REM 種子測試資料
echo 🌱 載入測試資料...
npm run db:seed

echo.
echo 🎉 設定完成！
echo.
echo 啟動開發伺服器：
echo   npm run dev
echo.
echo 然後開啟瀏覽器訪問：
echo   http://localhost:3000
echo.
echo 其他可用指令：
echo   npm test          # 執行測試
echo   npm run build     # 建置專案
echo   npm start         # 啟動生產伺服器
echo.
pause
