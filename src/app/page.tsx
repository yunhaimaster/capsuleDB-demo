'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, BarChart3, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-8">

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 md:p-3 bg-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-base md:text-lg font-semibold text-indigo-700">新增配方</CardTitle>
                <CardDescription className="text-sm md:text-base text-indigo-600">建立新記錄</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
              建立新的膠囊配方記錄，包含原料配置與生產參數
            </p>
            <Link href="/orders/new">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
                開始建立
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-lg font-semibold text-emerald-700">生產記錄</CardTitle>
                <CardDescription className="text-emerald-600">檢視管理</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">
              檢視與管理所有生產記錄，支援搜尋、篩選與編輯
            </p>
            <Link href="/orders">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                查看記錄
              </Button>
            </Link>
          </CardContent>
        </Card>


        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-lg font-semibold text-amber-700">統計報表</CardTitle>
                <CardDescription className="text-amber-600">數據分析</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">
              生產數據分析與統計，提供深入的業務洞察
            </p>
            <Link href="/reports">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                查看報表
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
              核心功能
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-600">
              專為保健品生產管理設計
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <h4 className="text-sm md:text-base font-semibold text-gray-700 flex items-center">
                <span className="mr-2">📋</span>
                配方管理
              </h4>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2 ml-4 md:ml-6">
                <li>• 動態原料配置</li>
                <li>• 自動重量計算</li>
                <li>• 配方複製功能</li>
                <li>• 即時數據驗證</li>
              </ul>
            </div>
            <div className="space-y-2 md:space-y-3">
              <h4 className="text-sm md:text-base font-semibold text-gray-700 flex items-center">
                <span className="mr-2">🔍</span>
                智能搜尋
              </h4>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2 ml-4 md:ml-6">
                <li>• 客戶名稱搜尋</li>
                <li>• 原料名稱搜尋</li>
                <li>• 日期範圍篩選</li>
                <li>• 狀態快速篩選</li>
              </ul>
            </div>
            <div className="space-y-2 md:space-y-3">
              <h4 className="text-sm md:text-base font-semibold text-gray-700 flex items-center">
                <span className="mr-2">📊</span>
                數據分析
              </h4>
              <ul className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2 ml-4 md:ml-6">
                <li>• 原料使用統計</li>
                <li>• 問題追蹤分析</li>
                <li>• CSV 數據匯出</li>
                <li>• 生產狀態監控</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold text-blue-800 flex items-center">
              <span className="mr-2">⚡</span>
              快速操作
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-blue-600">
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Link href="/orders/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm" size="sm">
                  <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  新增配方
                </Button>
              </Link>
              <Link href="/orders">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm" size="sm">
                  <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  檢視記錄
                </Button>
              </Link>
            </div>
            <div className="bg-blue-50 p-3 md:p-4 rounded-xl border border-blue-200">
              <div className="space-y-2 md:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm gap-2">
                  <div>
                    <p className="font-medium text-blue-700">系統狀態</p>
                    <p className="text-green-600">✓ 正常運行</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">版本</p>
                    <p className="text-blue-600">v1.0.0</p>
                  </div>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  最後更新：{new Date().toLocaleDateString('zh-TW')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}