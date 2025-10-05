'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { CalendarDays, Clock3, ArrowUpDown, ArrowUp, ArrowDown, Download, Filter, RefreshCw, Loader2, ChevronDown } from 'lucide-react'

import { WorklogWithOrder } from '@/types'
import { WorklogFilter } from '@/components/worklogs/worklog-filter'
import { LiquidGlassLoading } from '@/components/ui/liquid-glass-loading'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function ResponsiveWorklogsList() {
  const [worklogs, setWorklogs] = useState<WorklogWithOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [filters, setFilters] = useState({
    orderKeyword: '',
    notesKeyword: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 25
  })

  const fetchWorklogs = useCallback(async (newFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      params.set('sortOrder', sortOrder)

      const response = await fetch(`/api/worklogs?${params.toString()}`)
      if (!response.ok) {
        throw new Error('載入工時紀錄失敗')
      }
      const data = await response.json()
      setWorklogs(data.worklogs || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '載入工時紀錄失敗')
    } finally {
      setLoading(false)
    }
  }, [filters, sortOrder])

  useEffect(() => {
    fetchWorklogs()
  }, [fetchWorklogs])

  const handleSearch = (newFilters: Partial<typeof filters>) => {
    const mergedFilters = {
      ...filters,
      ...newFilters,
      page: 1
    }
    setFilters(mergedFilters)
    fetchWorklogs(mergedFilters)
  }

  const handlePageChange = (page: number) => {
    if (!pagination) return
    const updatedFilters = { ...filters, page }
    setFilters(updatedFilters)
    fetchWorklogs(updatedFilters)
  }

  const handleLimitChange = (limit: number) => {
    const updatedFilters = { ...filters, limit, page: 1 }
    setFilters(updatedFilters)
    fetchWorklogs(updatedFilters)
  }

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/worklogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'csv',
          filters: {
            orderKeyword: filters.orderKeyword || undefined,
            notesKeyword: filters.notesKeyword || undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            sortOrder
          }
        })
      })

      if (!response.ok) {
        throw new Error('匯出失敗，請稍後再試')
      }

      const blob = await response.blob()
      const filename = `worklogs-${new Date().toISOString().split('T')[0]}.csv`

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err) {
      console.error('匯出錯誤:', err)
      alert('匯出失敗，請稍後再試')
    }
  }

  const sortIcon = useMemo(() => {
    if (sortOrder === 'asc') return <ArrowUp className="h-3 w-3" />
    if (sortOrder === 'desc') return <ArrowDown className="h-3 w-3" />
    return <ArrowUpDown className="h-3 w-3" />
  }, [sortOrder])

  const formatWorkDate = (value: string) => {
    const date = new Date(value)
    return format(date, 'yyyy/MM/dd (EEE)', { locale: zhTW })
  }

  const pageNumbers = useMemo(() => {
    if (!pagination) return []
    const pages: number[] = []
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(i)
    }
    return pages
  }, [pagination])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <WorklogFilter
          filters={filters}
          onSearch={handleSearch}
          onLimitChange={handleLimitChange}
          loading={loading}
        />
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-[0_10px_30px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            匯出 CSV
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-3xl bg-white/70 backdrop-blur border border-white/60 shadow-[0_15px_45px_rgba(15,32,77,0.12)]">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white/80">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">工時日期</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">訂單</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">工作時段</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">總工時</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">備註</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">載入中...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-red-500">{error}</td>
                </tr>
              ) : worklogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">目前沒有工時紀錄</td>
                </tr>
              ) : (
                worklogs.map((worklog) => (
                  <tr key={worklog.id} className="border-b border-slate-100 hover:bg-white/80 transition-colors">
                    <td className="py-4 px-4 align-top text-sm text-slate-800 font-semibold text-slate-900">
                      {formatWorkDate(worklog.workDate)}
                    </td>
                    <td className="py-4 px-4 align-top text-sm text-slate-800">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">{worklog.order?.productName || '未指派訂單'}</span>
                        <span className="text-xs text-slate-500">客戶：{worklog.order?.customerName || '未填寫'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-sm text-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-900">
                          <Clock3 className="h-4 w-4 text-slate-500" />
                          {worklog.startTime} - {worklog.endTime}
                        </div>
                        <div className="text-xs text-slate-500">人數：{worklog.headcount} 人</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-sm text-slate-800">
                      <span className="font-semibold text-slate-900">{worklog.calculatedWorkUnits.toFixed(1)} 工時</span>
                    </td>
                    <td className="py-4 px-4 align-top text-sm text-slate-800">
                      <div className="max-w-xs text-sm text-slate-600 leading-relaxed">
                        {worklog.notes ? worklog.notes : <span className="text-slate-400">無備註</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
            <span>
              第 {pagination.page} / {pagination.totalPages} 頁 · 共 {pagination.total} 筆工時紀錄
            </span>
            <div className="flex items-center gap-2">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                    pageNumber === pagination.page
                      ? 'border-indigo-400 bg-indigo-500/10 text-indigo-700'
                      : 'border-white/60 bg-white/50 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="py-12">
            <LiquidGlassLoading title="載入工時" message="正在整理最新工時紀錄" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-sm text-red-600">
            {error}
          </div>
        ) : worklogs.length === 0 ? (
          <div className="rounded-2xl bg-white/70 border border-white/60 p-6 text-center text-sm text-slate-500">
            目前沒有工時紀錄
          </div>
        ) : (
          worklogs.map((worklog) => (
            <div key={worklog.id} className="liquid-glass-card liquid-glass-card-subtle">
              <div className="liquid-glass-content p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">工時日期</p>
                    <h3 className="text-base font-semibold text-slate-900">
                      {formatWorkDate(worklog.workDate)}
                    </h3>
                  </div>
                  <button
                    onClick={handleSortToggle}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 border border-white/70 text-xs font-medium text-slate-600"
                  >
                    {sortIcon}
                    最新優先
                  </button>
                </div>

                <div className="rounded-2xl bg-white/75 border border-white/60 p-3 space-y-2">
                  <div className="font-medium text-slate-900">{worklog.order?.productName || '未指派訂單'}</div>
                  <div className="text-xs text-slate-500">客戶：{worklog.order?.customerName || '未填寫'}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="rounded-xl bg-white/75 border border-white/60 px-3 py-2">
                    <p className="uppercase tracking-[0.12em] text-[11px] text-slate-400 mb-1">工時範圍</p>
                    <p className="text-sm font-medium text-slate-900">{worklog.startTime} - {worklog.endTime}</p>
                  </div>
                    <div className="rounded-xl bg-white/75 border border-white/60 px-3 py-2">
                    <p className="uppercase tracking-[0.12em] text-[11px] text-slate-400 mb-1">總工時</p>
                    <p className="text-sm font-medium text-slate-900">{worklog.calculatedWorkUnits.toFixed(1)} 工時</p>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-indigo-500/15 via-indigo-400/10 to-purple-500/15 border border-indigo-100 px-3 py-2 text-xs text-indigo-600">
                  <p className="font-medium">備註</p>
                  <p className="mt-1 text-xs leading-relaxed text-indigo-700">
                    {worklog.notes ? worklog.notes : '無備註'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                  pageNumber === pagination.page
                    ? 'border-indigo-400 bg-indigo-500/10 text-indigo-700'
                    : 'border-white/60 bg-white/50 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

