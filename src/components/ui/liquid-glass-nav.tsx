'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { NavDropdown } from '@/components/ui/nav-dropdown'
import { getMainNavigationLinks, type NavigationLink } from '@/data/navigation'
import { useAuth } from '@/components/auth/auth-provider'

type NavLink = NavigationLink & {
  active?: boolean
}

interface LiquidGlassNavProps {
  logo?: React.ReactNode
  links?: NavLink[]
  className?: string
}

export function LiquidGlassNav({
  logo = <Logo />,
  links = getMainNavigationLinks(),
  className = ''
}: LiquidGlassNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const { logout } = useAuth()

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
        <div className="liquid-glass-nav-brand flex items-center space-x-1 sm:space-x-2">
          <Link 
            href="/" 
            className="liquid-glass-nav-logo"
            aria-label="回到首頁"
          >
            {logo}
          </Link>
          <div className="flex flex-col leading-tight min-w-0">
            <h1 className="text-[11px] sm:text-sm md:text-base lg:text-lg font-bold text-gray-900">
              Easy Health
            </h1>
            <p className="hidden sm:block text-xs md:text-sm text-gray-600">
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
                onClick={(event) => {
                  if (link.label === '登出') {
                    event.preventDefault()
                    logout()
                    setIsMobileMenuOpen(false)
                    setTimeout(() => window.location.assign('/login?logout=true'), 50)
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
                  onClick={(event) => {
                    setIsMobileMenuOpen(false)
                    if (link.label === '登出') {
                      event.preventDefault()
                      logout()
                      setTimeout(() => window.location.assign('/login?logout=true'), 50)
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
