'use client'

import { RSS_SOURCES } from '@/data/rss-sources'
import { cn } from '@/lib/utils'

export interface RssSource {
  id: string
  title: string
  description: string
  url: string
  origin: string
  language: 'zh'
}

export const RSS_SOURCES: RssSource[] = [
  {
    id: 'cfs-hk',
    title: '香港食物安全中心',
    description: '食安中心發佈的食品安全風險警示與召回資訊',
    url: 'https://www.cfs.gov.hk/tc_chi/rss/rss.xml',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'nmpa-notice',
    title: '國家藥監局通知公告',
    description: '保健食品註冊審批、政策解讀與風險警示',
    url: 'https://www.nmpa.gov.cn/rss/notice.xml',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'nutraingredients-cn',
    title: 'NutraIngredients-Asia 中文版',
    description: '亞洲保健食品與功能性食品產業新聞',
    url: 'https://cn.nutraingredients-asia.com/rss',
    origin: '亞洲',
    language: 'zh'
  },
  {
    id: '21food',
    title: '中國食品商務網',
    description: '食品及保健品市場趨勢、企業動態與數據分析',
    url: 'https://www.21food.cn/rss',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'chc-association',
    title: '中國保健協會',
    description: '協會公告、行業標準與政策解讀',
    url: 'https://www.chc.org.cn/rss',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'hktdc-health',
    title: '香港貿發局．健康及養生產品',
    description: '健康產品展會資訊與香港市場洞察',
    url: 'https://hkmb.hktdc.com/rss/Industry/Health.xml',
    origin: '香港',
    language: 'zh'
  },
  {
    id: 'cnsoc',
    title: '中國營養學會',
    description: '學術會議公告與營養研究成果',
    url: 'http://www.cnsoc.org.cn/rss/news.xml',
    origin: '中國內地',
    language: 'zh'
  },
  {
    id: 'hk01-health',
    title: '香港01 健康養生',
    description: '香港01 的健康、醫療與養生專題',
    url: 'https://www.hk01.com/rss/channel/health',
    origin: '香港',
    language: 'zh'
  }
]

interface RssFeedSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  className?: string
}

export function RssFeedSelector({ selectedIds, onChange, className }: RssFeedSelectorProps) {
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
            className="px-3 py-1 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:bg白色/90"
          >
            全部選取
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 rounded-full bg透明 border border白色/40 text-slate-500 hover:bg白色/60"
          >
            清除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RSS_SOURCES.map((source) => {
          const checked = selectedIds.includes(source.id)
          const disabled = !checked && selectedIds.length >= 10

          return (
            <label
              key={source.id}
              className={cn(
                'flex items-start gap-3 rounded-2xl border bg-white/70 px-4 py-3 transition-colors cursor-pointer shadow-sm',
                checked
                  ? 'border-indigo-200 shadow-[0_6px_20px_rgba(79,70,229,0.15)]'
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
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <span className="truncate">{source.title}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{source.language === 'zh' ? 'ZH' : 'EN'}</span>
                  <span className="text-[10px] text-slate-400">{source.origin}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{source.description}</p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

