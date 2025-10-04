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
    label: '訂單管理',
    children: [
      { href: '/orders', label: '訂單列表' },
      { href: '/orders/new', label: '新建訂單' },
    ],
  },
  {
    href: '/worklogs',
    label: '工時紀錄'
  },
  {
    href: '/ai-recipe-generator',
    label: '工具',
    children: [
      { href: '/ai-recipe-generator', label: 'AI 配方生成器' },
      { href: '/granulation-analyzer', label: '製粒分析工具' },
      { href: '/work-orders', label: '工作單生成' }
    ],
  },
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

