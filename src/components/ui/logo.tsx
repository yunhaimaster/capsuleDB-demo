'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'text' | 'icon'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl'
}

export function Logo({ size = 'md', variant = 'default', className }: LogoProps) {
  if (variant === 'icon') {
    return (
      <div className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        className
      )}>
        {/* Easy Health Logo Icon - 使用原始 SVG 的圖標部分 */}
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full"
          fill="none"
        >
          <defs>
            <style>
              {`.st0 { fill: #849dbc; }
               .st1 { fill: #44bac6; }
               .st2 { fill: #2a588c; }`}
            </style>
          </defs>
          {/* 基於原始 SVG 的 E 和 H 字母設計 */}
          {/* E 字母 - 外層框架 */}
          <rect 
            x="20" y="20" 
            width="160" height="160" 
            rx="20" 
            fill="#2a588c"
          />
          {/* E 字母 - 頂部橫條 */}
          <rect 
            x="40" y="40" 
            width="80" height="20" 
            rx="10" 
            fill="white"
          />
          {/* E 字母 - 中間橫條 */}
          <rect 
            x="40" y="90" 
            width="50" height="20" 
            rx="10" 
            fill="white"
          />
          {/* E 字母 - 底部橫條 */}
          <rect 
            x="40" y="140" 
            width="80" height="20" 
            rx="10" 
            fill="white"
          />
          {/* H 字母 - 左側豎條 */}
          <rect 
            x="100" y="40" 
            width="20" height="120" 
            rx="10" 
            fill="#44bac6"
          />
          {/* H 字母 - 右側豎條 */}
          <rect 
            x="160" y="40" 
            width="20" height="120" 
            rx="10" 
            fill="#44bac6"
          />
          {/* H 字母 - 中間橫條 */}
          <rect 
            x="100" y="90" 
            width="80" height="20" 
            rx="10" 
            fill="#44bac6"
          />
        </svg>
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col', className)}>
        <span className={cn(
          'font-bold text-blue-600 dark:text-blue-400',
          textSizeClasses[size]
        )}>
          Easy
        </span>
        <span className={cn(
          'font-bold text-cyan-400 dark:text-cyan-300',
          textSizeClasses[size]
        )}>
          Health
        </span>
      </div>
    )
  }

  // Default variant - 只顯示圖標
  return (
    <Logo size={size} variant="icon" className={className} />
  )
}
