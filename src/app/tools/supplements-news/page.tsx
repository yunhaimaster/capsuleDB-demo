'use client'

import { useEffect, useState } from 'react'

import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { RssFeedSelector } from '@/components/news/rss-feed-selector'
import { RssArticleList } from '@/components/news/rss-article-list'
import { RSS_SOURCES } from '@/data/rss-sources'
import { cn } from '@/lib/utils'

interface ApiResponse {
  items: Array<{
    id: string
    title: string
    link: string
    publishedAt: string | null
    sourceId: string
    sourceTitle: string
    description?: string
  }>
  feeds: Array<{ id: string; title: string }>
  error?: string
}

export default function SupplementsNewsPage() {
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>(RSS_SOURCES.slice(0, 8).map((source) => source.id))
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const fetchArticles = async () => {
      if (selectedFeeds.length === 0) {
        setData({ items: [], feeds: [] })
        setError(null)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('feeds', selectedFeeds.join(','))
        params.set('limit', '60')

        const response = await fetch(`/api/rss/news?${params.toString()}`, {
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error('載入新聞失敗，請稍後再試。')
        }

        const json = await response.json()
        setData(json)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error(err)
          setError('載入新聞失敗，請稍後再試。')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()

    return () => {
      controller.abort()
    }
  }, [selectedFeeds])

  return (
    <div className="min-h-screen logo-bg-animation flex flex-col">
      <LiquidGlassNav />

      <main className="flex-1 pt-28 sm:pt-24 pb-16 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">
        <section className="liquid-glass-card liquid-glass-card-refraction liquid-glass-card-interactive p-6 md:p-8">
          <div className="liquid-glass-content flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 border border-purple-300/40 text-purple-700 text-xs font-semibold px-3 py-1">
                <span className="inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                Supplements News
              </div>
              <h1 className="text-xl font-semibold text-slate-900">保健品產業新聞聚合</h1>
              <p className="text-sm text-slate-600">
                選擇想追蹤的 RSS 來源，快速掌握營養補充品與保健食品市場的最新資訊。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="px-3 py-1 rounded-full bg-white/70 border border-white/60">已選 {selectedFeeds.length} / 10</span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-200 text-indigo-600 font-medium">
                即時更新
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 sm:gap-6">
          <div className="liquid-glass-card liquid-glass-card-subtle p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">選擇新聞來源</h2>
              <button
                type="button"
                className={cn(
                  'text-xs font-medium px-3 py-1 rounded-full border',
                  selectedFeeds.length === 0
                    ? 'border-white/50 text-slate-400'
                    : 'border-indigo-200 text-indigo-600'
                )}
              >
                已選 {selectedFeeds.length} 項
              </button>
            </div>
            <RssFeedSelector selectedIds={selectedFeeds} onChange={setSelectedFeeds} />
          </div>

          <div className="liquid-glass-card liquid-glass-card-interactive p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">最新文章</h2>
              {data?.feeds && data.feeds.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  共 {data.items?.length || 0} 則 · {data.feeds.map((feed) => feed.title).join('、')}
                </span>
              )}
            </div>
            <RssArticleList items={data?.items ?? []} loading={loading} error={error} />
          </div>
        </section>
      </main>

      <LiquidGlassFooter className="mt-auto" />
    </div>
  )
}

