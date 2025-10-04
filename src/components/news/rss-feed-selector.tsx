'use client'

import { useMemo } from 'react'

import { RSS_SOURCES, type RssSource } from '@/data/rss-sources'
import { cn } from '@/lib/utils'

interface RssFeedSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  className?: string
}

const CATEGORY_LABELS: Record<RssSource['category'], string> = {
  global: '全球英文媒體',
  official: '官方 / 公協會',
  asia: '亞洲中文',
  insights: '專業觀點'
}

export function RssFeedSelector({ selectedIds, onChange, className }: RssFeedSelectorProps) {
  const grouped = useMemo(() => {
    return RSS_SOURCES.reduce<Record<RssSource['category'], RssSource[]>>((acc, source) => {
      acc[source.category] = acc[source.category] || []
      acc[source.category].push(source)
      return acc
    }, { global: [], official: [], asia: [], insights: [] })
  }, [])

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const handleSelectAll = () => {
    onChange(RSS_SOURCES.map((source) => source.id))
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>RSS 可選最多 10 個來源</span>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:bg-white/90"
          >
            全部選取
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 rounded-full bg-transparent border border-white/40 text-slate-500 hover:bg-white/60"
          >
            清除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([category, sources]) => (
          <div key={category} className="liquid-glass-card liquid-glass-card-subtle p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">{CATEGORY_LABELS[category as RssSource['category']]}</h3>
              <span className="text-[11px] text-slate-400">{sources.length} 項</span>
            </div>
            <div className="space-y-2">
              {sources.map((source) => {
                const checked = selectedIds.includes(source.id)
                const disabled = !checked && selectedIds.length >= 10

                return (
                  <label
                    key={source.id}
                    className={cn(
                      'flex items-start gap-3 rounded-2xl border bg-white/70 px-3 py-2 transition-colors cursor-pointer',
                      checked
                        ? 'border-indigo-200 shadow-[0_6px_16px_rgba(79,70,229,0.12)]'
                        : 'border-white/60 hover:border-indigo-100'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => handleToggle(source.id)}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <span className="truncate">{source.title}</span>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{source.language === 'zh' ? 'ZH' : 'EN'}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed truncate">{source.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

