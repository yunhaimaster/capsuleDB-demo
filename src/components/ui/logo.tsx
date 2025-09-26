'use client'

import { cn } from '@/lib/utils'

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
        {/* Easy Health Logo Icon - SVG version */}
        <svg 
          viewBox="0 0 40 40" 
          className="w-full h-full"
          fill="none"
        >
          {/* E shape - outer frame */}
          <rect 
            x="2" y="2" 
            width="36" height="36" 
            rx="8" 
            stroke="currentColor" 
            strokeWidth="2"
            fill="none"
          />
          {/* E shape - top bar */}
          <rect 
            x="6" y="6" 
            width="20" height="4" 
            rx="2" 
            fill="currentColor"
          />
          {/* H shape - bottom bar */}
          <rect 
            x="6" y="30" 
            width="20" height="4" 
            rx="2" 
            fill="currentColor"
            className="text-cyan-400"
          />
          {/* E shape - middle bar */}
          <rect 
            x="6" y="18" 
            width="12" height="4" 
            rx="2" 
            fill="currentColor"
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
