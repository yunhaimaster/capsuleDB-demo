'use client'

import Link from 'next/link'

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
  const footerSections: FooterSection[] = [
    {
      title: '系統功能',
      links: [
        { href: '/', label: '首頁' },
        { href: '/orders', label: '訂單管理' },
        { href: '/ai-recipe-generator', label: 'AI配方生成器' },
        { href: '/work-orders', label: '工作單生成' },
        { href: '/setup', label: '數據庫設置' }
      ]
    },
    {
      title: 'AI 配方',
      links: [
        { href: '/ai-recipe-generator', label: 'AI配方生成器' },
        { href: '/ai-recipes', label: 'AI配方庫' },
        { href: '/work-orders', label: '工作單生成' }
      ]
    },
    {
      title: '訂單管理',
      links: [
        { href: '/orders', label: '訂單列表' },
        { href: '/orders/new', label: '新建訂單' }
      ]
    },
    {
      title: '系統設置',
      links: [
        { href: '/setup', label: '數據庫設置' },
        { href: '/login', label: '登入' }
      ]
    }
  ]

  return (
    <footer className={`liquid-glass-footer ${className}`}>
      <div className="liquid-glass-footer-content">
        {/* 公司信息 */}
        <div className="liquid-glass-footer-brand">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EH</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Easy Health</h3>
              <p className="text-sm text-gray-600">膠囊配方管理系統</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 max-w-xs">
            專業的膠囊灌裝工廠代工管理系統，提供AI驅動的配方生成和生產管理解決方案。
          </p>
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
            © 2024 Easy Health. 保留所有權利。
          </p>
          <div className="flex space-x-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              隱私政策
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              服務條款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
