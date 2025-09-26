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
        {/* Easy Health Logo Icon - 基於實際設計的 SVG */}
        <svg 
          viewBox="0 0 40 40" 
          className="w-full h-full"
          fill="none"
        >
          {/* E 形狀 - 外層框架 (深藍色) */}
          <rect 
            x="4" y="4" 
            width="32" height="32" 
            rx="6" 
            fill="#1e40af"
          />
          {/* E 形狀 - 頂部橫條 */}
          <rect 
            x="8" y="8" 
            width="16" height="3" 
            rx="1.5" 
            fill="white"
          />
          {/* E 形狀 - 中間橫條 */}
          <rect 
            x="8" y="18.5" 
            width="10" height="3" 
            rx="1.5" 
            fill="white"
          />
          {/* E 形狀 - 底部橫條 */}
          <rect 
            x="8" y="29" 
            width="16" height="3" 
            rx="1.5" 
            fill="white"
          />
          {/* H 形狀 - 左側豎條 */}
          <rect 
            x="8" y="8" 
            width="3" height="24" 
            rx="1.5" 
            fill="#06b6d4"
          />
          {/* H 形狀 - 右側豎條 */}
          <rect 
            x="21" y="8" 
            width="3" height="24" 
            rx="1.5" 
            fill="#06b6d4"
          />
          {/* H 形狀 - 中間橫條 */}
          <rect 
            x="8" y="18.5" 
            width="16" height="3" 
            rx="1.5" 
            fill="#06b6d4"
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

  // Default variant - icon + text
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <Logo size={size} variant="icon" />
      <Logo size={size} variant="text" />
    </div>
  )
}
