import Link from 'next/link'

interface RssArticleListProps {
  items: Array<{
    id: string
    title: string
    link: string
    publishedAt: string | null
    sourceTitle: string
    description?: string
  }>
  loading?: boolean
  error?: string | null
}

export function RssArticleList({ items, loading, error }: RssArticleListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="liquid-glass-card liquid-glass-card-subtle p-4 animate-pulse">
            <div className="h-4 bg-white/70 rounded w-1/2 mb-3" />
            <div className="h-3 bg-white/60 rounded w-2/3 mb-2" />
            <div className="h-3 bg-white/50 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="liquid-glass-card liquid-glass-card-subtle p-4 border border-red-100 bg-red-50/60 text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="liquid-glass-card liquid-glass-card-subtle p-6 text-center text-sm text-slate-500">
        尚未選取 RSS 來源或目前沒有更新。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="block">
          <article className="liquid-glass-card liquid-glass-card-interactive liquid-glass-card-subtle p-4 hover:border-indigo-200 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                {item.title}
              </h4>
              <span className="text-[11px] text-indigo-600 bg-indigo-50/70 border border-indigo-100 rounded-full px-2 py-0.5">
                {item.sourceTitle}
              </span>
            </div>
            {item.description && (
              <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                {item.description.replace(/(<([^>]+)>)/gi, '')}
              </p>
            )}
            {item.publishedAt && (
              <div className="mt-3 text-[11px] text-slate-400">
                {new Intl.DateTimeFormat('zh-TW', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(item.publishedAt))}
              </div>
            )}
          </article>
        </Link>
      ))}
    </div>
  )
}

