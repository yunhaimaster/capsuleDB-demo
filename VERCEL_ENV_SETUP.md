# 🔧 Vercel 環境變數設置指南

## 需要在 Vercel 中設置的環境變數

### 1. 登入 Vercel 控制台
- 前往 https://vercel.com/dashboard
- 選擇您的專案：`easypack-capsule-management`

### 2. 設置環境變數
進入 **Settings > Environment Variables**，添加以下變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `OPENROUTER_API_KEY` | `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` | 您的 OpenRouter API 密鑰 |
| `OPENROUTER_API_URL` | `https://openrouter.ai/api/v1/chat/completions` | OpenRouter API 端點 |
| `NEXT_PUBLIC_APP_URL` | `https://easypack-capsule-management.vercel.app` | 應用程式 URL |

### 3. 設置步驟
1. 在 Vercel 專案頁面，點擊 **Settings**
2. 在左側選單中選擇 **Environment Variables**
3. 點擊 **Add New** 按鈕
4. 逐一添加上述三個環境變數
5. 確保所有環境變數都設置為 **Production** 環境

### 4. 重新部署
設置完成後，Vercel 會自動重新部署。您也可以手動觸發部署：
- 前往 **Deployments** 頁面
- 點擊 **Redeploy** 按鈕

## ✅ 驗證設置
設置完成後，AI 助手應該能正常工作。如果仍有問題，請檢查：
1. 環境變數是否正確設置
2. 部署日誌是否有錯誤
3. API 密鑰是否有效

## 📞 聯繫方式
如有問題，請聯繫 Victor（系統管理員）
