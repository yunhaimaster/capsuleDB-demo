export interface NavigationLink {
  href: string
  label: string
  children?: NavigationLink[]
}

interface NavigationOptions {
  includeLogout?: boolean
}

const BASE_NAVIGATION_LINKS: NavigationLink[] = [
  { href: '/', label: '首頁' },
  {
    href: '/orders',
    label: '訂單',
    children: [
      { href: '/orders', label: '訂單列表' },
      { href: '/orders/new', label: '新建訂單' },
    ],
  },
  {
    href: '/ai-recipe-generator',
    label: 'AI 配方',
    children: [
      { href: '/ai-recipe-generator', label: 'AI 配方生成器' },
      { href: '/ai-recipes', label: 'AI 配方庫' },
      { href: '/work-orders', label: '工作單生成' },
      { href: '/price-analyzer', label: '成本分析' },
      { href: '/product-database', label: '產品資料庫' },
    ],
  },
  { href: '/reports', label: '報表' },
  { href: '/history', label: '更新歷史' },
  { href: '/setup', label: '設置' },
]

const LOGOUT_LINK: NavigationLink = { href: '/login?logout=true', label: '登出' }

export function getMainNavigationLinks(options: NavigationOptions = {}): NavigationLink[] {
  const { includeLogout = true } = options
  const links = [...BASE_NAVIGATION_LINKS]

  if (includeLogout) {
    links.push(LOGOUT_LINK)
  }

  return links
}

export const MAIN_NAVIGATION_LINKS = getMainNavigationLinks()

