# Vercel 環境變數設置指南

## 問題診斷
Vercel 自動部署失敗是因為缺少必要的環境變數。

## 已設置的環境變數
- ✅ DATABASE_URL: 已設置

## 需要設置的環境變數

### 1. OpenRouter API 密鑰
```bash
vercel env add OPENROUTER_API_KEY production
```
輸入您的 OpenRouter API 密鑰

### 2. OpenRouter API URL (可選)
```bash
vercel env add OPENROUTER_API_URL production
```
輸入: `https://openrouter.ai/api/v1/chat/completions`

### 3. 應用程式 URL (可選)
```bash
vercel env add NEXT_PUBLIC_APP_URL production
```
輸入: `https://easypack-capsule-l7f2n2cqt-victor-huis-projects.vercel.app`

## 設置完成後
1. 重新部署: `vercel --prod`
2. 檢查部署狀態: `vercel ls`
3. 測試應用程式功能

## 自動部署設置
確保 GitHub 倉庫的 Webhook 已連接到 Vercel：
1. 前往 Vercel Dashboard
2. 選擇專案
3. 前往 Settings > Git
4. 確認 GitHub 連接正常
5. 啟用自動部署
