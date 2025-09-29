'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { NavDropdown } from '@/components/ui/nav-dropdown'

interface NavLink {
  href: string
  label: string
  active?: boolean
  children?: NavLink[]
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
    { 
      href: '/orders', 
      label: '訂單管理',
      children: [
        { href: '/orders', label: '訂單列表' },
        { href: '/orders/new', label: '新建訂單' }
      ]
    },
    { 
      href: '/ai-recipe-generator', 
      label: 'AI 配方',
      children: [
        { href: '/ai-recipe-generator', label: 'AI配方生成器' },
        { href: '/work-orders', label: '工作單生成' }
      ]
    },
    { href: '/setup', label: '設置' }
  ],
  className = ''
}: LiquidGlassNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // Mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav
      ref={navRef}
      className={`liquid-glass-nav ${isScrolled ? 'scrolled' : ''} ${className}`}
      role="navigation"
      aria-label="主要導航"
    >
      <div className="liquid-glass-nav-content">
        {/* Logo and Brand Section - Left side */}
        <div className="flex items-center space-x-1 sm:space-x-2 mr-auto">
          <Link 
            href="/" 
            className="liquid-glass-nav-logo"
            aria-label="回到首頁"
          >
            {logo}
          </Link>
          <div className="block">
            <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900">
              Easy Health
            </h1>
            <p className="text-xs text-gray-600 hidden sm:block">
              膠囊配方管理系統
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links - Right side */}
        <div className="liquid-glass-nav-links">
          {processedLinks.map((link) => (
            link.children ? (
              <NavDropdown
                key={link.href}
                label={link.label}
                children={link.children}
                active={link.active}
              />
            ) : (
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
            )
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="liquid-glass-nav-mobile-toggle"
          onClick={handleMobileMenuToggle}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? '關閉選單' : '開啟選單'}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="liquid-glass-nav-mobile">
          {processedLinks.map((link) => (
            <div key={link.href}>
              {link.children ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">
                    {link.label}
                  </div>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="liquid-glass-nav-link block pl-8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href={link.href}
                  className={`liquid-glass-nav-link ${link.active ? 'active' : ''}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    if (link.label === '登出') {
                      localStorage.removeItem('isAuthenticated')
                    }
                  }}
                  aria-current={link.active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

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
