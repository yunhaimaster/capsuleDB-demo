'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Reset animation state when pathname changes
    setIsVisible(false)
    
    // Trigger enter animation after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  )
}

// Staggered animation wrapper for lists
interface StaggeredListProps {
  children: React.ReactNode
  className?: string
}

export function StaggeredList({ children, className }: StaggeredListProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'transition-all duration-300 ease-out',
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4',
                `delay-[${index * 100}ms]`
              )}
            >
              {child}
            </div>
          ))
        : children
      }
    </div>
  )
}

// Slide transition wrapper
interface SlideTransitionProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
}

export function SlideTransition({ 
  children, 
  direction = 'right', 
  className 
}: SlideTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return isVisible ? 'translate-x-0' : 'translate-x-8'
      case 'right':
        return isVisible ? 'translate-x-0' : '-translate-x-8'
      case 'up':
        return isVisible ? 'translate-y-0' : 'translate-y-8'
      case 'down':
        return isVisible ? 'translate-y-0' : '-translate-y-8'
      default:
        return isVisible ? 'translate-x-0' : '-translate-x-8'
    }
  }

  return (
    <div 
      className={cn(
        'transition-all duration-400 ease-out',
        isVisible 
          ? 'opacity-100' 
          : 'opacity-0',
        getTransform(),
        className
      )}
    >
      {children}
    </div>
  )
}

// Scale transition wrapper
interface ScaleTransitionProps {
  children: React.ReactNode
  className?: string
}

export function ScaleTransition({ children, className }: ScaleTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95',
        className
      )}
    >
      {children}
    </div>
  )
}
