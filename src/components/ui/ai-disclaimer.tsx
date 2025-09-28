'use client'

import { AlertTriangle } from 'lucide-react'

export function AIDisclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-800">
          <p className="font-medium mb-1">⚠️ AI 免責聲明</p>
          <p className="leading-relaxed">
            AI 助手提供的分析和建議僅供參考，不構成專業建議。請務必：
          </p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>驗證所有技術數據和計算結果</li>
            <li>諮詢專業人員進行最終確認</li>
            <li>根據實際情況調整建議</li>
            <li>AI 回應可能存在錯誤或不完整</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function AIDisclaimerCompact() {
  return (
    <div className="bg-amber-50/50 border border-amber-200/50 rounded-md p-2 mb-3">
      <div className="flex items-center space-x-1.5">
        <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-medium">免責聲明：</span>
          AI 分析僅供參考，請驗證後使用
        </p>
      </div>
    </div>
  )
}