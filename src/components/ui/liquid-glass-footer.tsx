"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

import { useAuth } from '@/components/auth/auth-provider'

interface FooterLink {
  href: string
  label: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface LiquidGlassFooterProps {
  className?: string
}

export function LiquidGlassFooter({ className = '' }: LiquidGlassFooterProps) {
  const { isAuthenticated } = useAuth()
  const [latestWorklogInfo, setLatestWorklogInfo] = useState<string | null>(null)

  const footerSections: FooterSection[] = useMemo(() => {
    const sharedSections: FooterSection[] = [
      {
        title: '訂單管理',
        links: [
          { href: '/orders', label: '訂單列表' },
          { href: '/orders/new', label: '新建訂單' }
        ]
      },
          {
            title: '工具',
            links: [
              { href: '/ai-recipe-generator', label: 'AI配方生成器' },
              { href: '/granulation-analyzer', label: '製粒分析工具' },
              { href: '/work-orders', label: '工作單生成' }
            ]
          },
      {
        title: '系統',
        links: [
          { href: '/', label: '首頁' },
          { href: '/history', label: '版本歷史' }
        ]
      }
    ]

    const accountSection: FooterSection = isAuthenticated
      ? {
          title: '帳戶',
          links: [{ href: '/login?logout=true', label: '登出' }]
        }
      : {
          title: '帳戶',
          links: [{ href: '/login', label: '登入' }]
        }

    return [...sharedSections, accountSection]
  }, [isAuthenticated])

  useEffect(() => {
    const fetchLatestWorklog = async () => {
      try {
        const response = await fetch('/api/worklogs?limit=1')
        if (response.ok) {
          const data = await response.json()
          const latest = data.worklogs?.[0]
          if (latest) {
            const relative = formatDistanceToNow(new Date(latest.workDate), {
              addSuffix: true,
              locale: zhTW
            })
            setLatestWorklogInfo(`${relative} 填報 · ${latest.order?.productName || '未指派訂單'}`)
          }
        }
      } catch (error) {
        console.error('載入最新工時失敗:', error)
      }
    }

    fetchLatestWorklog()
  }, [])

  return (
    <footer className={`liquid-glass-footer ${className}`}>
      <div className="liquid-glass-footer-content">
        {/* 公司信息 */}
        <div className="liquid-glass-footer-brand">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8">
            <img 
              src="/images/EasyHealth_Logo_only.svg" 
              alt="Easy Health Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Easy Health</h3>
            <p className="text-sm text-gray-600">膠囊配方管理系統</p>
          </div>
        </div>
          <p className="text-sm text-gray-600 max-w-xs">
            專業的膠囊灌裝工廠代工管理系統，提供AI驅動的配方生成和生產管理解決方案。
          </p>
          {latestWorklogInfo && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white/50 text-[11px] text-indigo-600">
              <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <span>最新工時：{latestWorklogInfo}</span>
            </div>
          )}
        </div>

        {/* 導航鏈接 */}
        <div className="liquid-glass-footer-links">
          {footerSections.map((section, index) => (
            <div key={index} className="liquid-glass-footer-section">
              <h4 className="liquid-glass-footer-title">{section.title}</h4>
              <ul className="liquid-glass-footer-list">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="liquid-glass-footer-link"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 版權信息 */}
      <div className="liquid-glass-footer-bottom">
        <div className="liquid-glass-footer-bottom-content">
          <p className="text-sm text-gray-600">
            © 2025 Easy Health. 保留所有權利。
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              隱私政策
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              服務條款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
