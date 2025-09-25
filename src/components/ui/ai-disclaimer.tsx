'use client'

import { AlertCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AIDisclaimerProps {
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
}

export function AIDisclaimer({ variant = 'default', className = '' }: AIDisclaimerProps) {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        <span>AI 回答僅供參考，請以專業判斷為準</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Alert className={`border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 ${className}`}>
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
          <strong>重要提醒：</strong>AI 提供的建議僅供參考，實際生產決策請以專業知識和經驗為準。
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
        <div className="space-y-1">
          <p><strong>免責聲明：</strong>本 AI 助手提供的建議和分析僅供參考，不應作為生產決策的唯一依據。</p>
          <p className="text-xs">請結合您的專業知識、行業經驗和實際情況進行綜合判斷。如有疑問，建議諮詢相關專業人士。</p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
