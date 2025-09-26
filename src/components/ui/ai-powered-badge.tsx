'use client'

import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap } from 'lucide-react'

interface AIPoweredBadgeProps {
  variant?: 'default' | 'compact' | 'minimal'
  showIcon?: boolean
  className?: string
}

export function AIPoweredBadge({ 
  variant = 'default', 
  showIcon = true,
  className = '' 
}: AIPoweredBadgeProps) {
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
        {showIcon && <Sparkles className="w-3 h-3" />}
        <span>AI 驅動</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={`inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 ${className}`}
      >
        {showIcon && <Zap className="w-3 h-3" />}
        <span>Powered by DeepSeek Chat v3.1</span>
      </Badge>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 ${className}`}>
      {showIcon && (
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
          Powered by AI
        </span>
        <span className="text-xs text-blue-600 dark:text-blue-400">
          DeepSeek Chat v3.1
        </span>
      </div>
    </div>
  )
}
