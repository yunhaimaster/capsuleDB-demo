# Vercel 部署檢查指南

## 🎯 當前狀態
- ✅ 代碼已推送到 GitHub
- ✅ TypeScript 錯誤已修復
- ✅ 構建應該成功
- ⏳ 等待 Vercel 自動部署完成

## 🔍 檢查部署狀態

### 方法 1: Vercel Dashboard
1. 訪問 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的 `easypack-capsule-management` 項目
3. 檢查最新的部署狀態
4. 如果顯示 "Ready"，點擊 "Visit" 按鈕

### 方法 2: 檢查部署 URL
通常 Vercel 會為每個分支創建預覽 URL：
- **Main 分支**: `https://easypack-capsule-management.vercel.app`
- **Feature 分支**: `https://easypack-capsule-management-git-feature-v2-ai-recipe-generator-[username].vercel.app`

### 方法 3: 等待幾分鐘
- Vercel 部署通常需要 2-5 分鐘
- 如果剛剛推送，請稍等片刻

## 🚀 部署完成後的步驟

### 1. 運行數據庫遷移
```bash
# 替換為實際的 Vercel URL
curl -X POST https://your-actual-url.vercel.app/api/migrate-simple
```

### 2. 檢查遷移結果
應該看到類似這樣的回應：
```json
{
  "success": true,
  "message": "v2.0 表創建成功",
  "createdTables": ["ai_recipes", "ingredient_prices", ...],
  "totalTables": 7
}
```

### 3. 測試功能
- 訪問主頁查看 v2.0 功能卡片
- 測試 AI 配方生成器
- 測試價格分析器
- 測試工作單生成
- 測試配方資料庫

## 🛠️ 如果部署失敗

### 檢查環境變量
在 Vercel 項目設置中確保有：
```
DATABASE_URL=postgresql://username:password@host:port/database
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 檢查構建日誌
1. 在 Vercel Dashboard 中查看構建日誌
2. 如果有錯誤，根據錯誤信息修復

### 手動觸發部署
1. 在 Vercel Dashboard 中點擊 "Redeploy"
2. 或者推送一個小的更改觸發重新部署

## 📞 需要幫助？

如果遇到問題，請提供：
1. Vercel Dashboard 中的錯誤信息
2. 構建日誌截圖
3. 實際的 Vercel URL

## 🎉 成功後的下一步

1. **測試所有 v2.0 功能**
2. **創建 Pull Request** 合併到 main 分支
3. **設置生產環境變量**
4. **用戶培訓和文檔**
