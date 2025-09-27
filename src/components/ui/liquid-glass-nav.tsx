'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

interface NavLink {
  href: string
  label: string
  active?: boolean
}

interface LiquidGlassNavProps {
  logo?: React.ReactNode
  links?: NavLink[]
  className?: string
}

export function LiquidGlassNav({
  logo = <Logo />,
  links = [
    { href: '/', label: '首頁' },
    { href: '/orders', label: '訂單' },
    { href: '/orders/new', label: '新建' }
  ],
  className = ''
}: LiquidGlassNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Auto-detect active link based on current pathname
  const processedLinks = links.map(link => ({
    ...link,
    active: pathname === link.href || 
            (link.href !== '/' && pathname.startsWith(link.href)) ||
            (link.href === '/' && pathname === '/')
  }))

  // Intersection Observer for scroll-based transparency
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  return (
    <nav
      ref={navRef}
      className={`liquid-glass-nav ${isScrolled ? 'scrolled' : ''} ${className}`}
      role="navigation"
      aria-label="主要導航"
    >
      <div className="liquid-glass-nav-content">
        {/* Logo and Brand Section - Left side */}
        <div className="flex items-center space-x-3 mr-auto">
          <Link 
            href="/" 
            className="liquid-glass-nav-logo"
            aria-label="回到首頁"
          >
            {logo}
          </Link>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-gray-900">
              Easy Health
            </h1>
            <p className="text-xs text-gray-600">
              膠囊配方管理系統
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links - Right side */}
        <div className="liquid-glass-nav-links">
          {processedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`liquid-glass-nav-link ${link.active ? 'active' : ''}`}
              onClick={() => {
                if (link.label === '登出') {
                  localStorage.removeItem('isAuthenticated')
                }
              }}
              aria-current={link.active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>

    </nav>
  )
}

// Hook for managing scroll-based navigation state
export function useScrollNav() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { isScrolled }
}
