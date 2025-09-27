'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Menu, X, Plus } from 'lucide-react'

interface NavLink {
  href: string
  label: string
  active?: boolean
}

interface LiquidGlassNavProps {
  logo?: React.ReactNode
  links?: NavLink[]
  ctaText?: string
  ctaHref?: string
  ctaIcon?: React.ReactNode
  className?: string
}

export function LiquidGlassNav({
  logo = <Logo />,
  links = [
    { href: '/', label: '首頁' },
    { href: '/orders', label: '訂單管理' },
    { href: '/orders/new', label: '新建訂單' }
  ],
  ctaText = '新建訂單',
  ctaHref = '/orders/new',
  ctaIcon = <Plus className="h-4 w-4" />,
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

  // ResizeObserver for responsive glass effects
  useEffect(() => {
    if (!navRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        if (width < 768 && isMobileMenuOpen) {
          // Close mobile menu on resize to desktop
          setIsMobileMenuOpen(false)
        }
      }
    })

    resizeObserver.observe(navRef.current)
    return () => resizeObserver.disconnect()
  }, [isMobileMenuOpen])

  // Keyboard navigation support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  // Focus management for accessibility
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav
      ref={navRef}
      className={`liquid-glass-nav ${isScrolled ? 'scrolled' : ''} ${className}`}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="主要導航"
    >
      <div className="liquid-glass-nav-content">
        {/* Logo and Brand Section */}
        <div className="flex items-center space-x-3">
          <Link 
            href="/" 
            className="liquid-glass-nav-logo"
            aria-label="回到首頁"
          >
            {logo}
          </Link>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-gray-900">
              Easy Health 膠囊配方管理系統
            </h1>
            <p className="text-xs text-gray-600">
              Easy Health 內部生產管理
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
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

        {/* CTA Button */}
        <Link href={ctaHref} className="liquid-glass-nav-cta">
          {ctaIcon}
          <span className="hidden sm:inline">{ctaText}</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="liquid-glass-nav-mobile-toggle"
          onClick={handleMobileMenuToggle}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? '關閉選單' : '開啟選單'}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="liquid-glass-nav-mobile"
          role="menu"
          aria-label="行動版導航選單"
        >
          {processedLinks.map((link) => (
          <Link
            key={link.href}
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
          ))}
          <Link
            href={ctaHref}
            className="liquid-glass-nav-cta"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {ctaIcon}
            {ctaText}
          </Link>
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
