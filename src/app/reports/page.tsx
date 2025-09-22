'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { Construction, BarChart3, Clock } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* 麵包屑導航 */}
      <Breadcrumb
        items={[
          { label: '統計報表', href: '/reports' }
        ]}
      />

      {/* 頁面標題 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl p-6 md:p-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500 rounded-xl">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-800">統計報表</h1>
            <p className="text-amber-700 text-sm md:text-base mt-1">數據分析與統計功能</p>
          </div>
        </div>
      </div>

      {/* 正在設計中卡片 */}
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
              <Construction className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              功能開發中
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              統計報表功能正在設計中，敬請期待
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>預計功能包括：</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>原料使用統計分析</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>生產效率趨勢圖表</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>品質問題追蹤報告</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>成本效益分析</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                如有緊急統計需求，請聯繫 Victor
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 智能 AI 助手 */}
      <SmartAIAssistant />
    </div>
  )
}