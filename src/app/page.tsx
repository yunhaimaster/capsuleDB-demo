'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Search, BarChart3, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-8">

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-lg font-semibold text-indigo-700">新增配方</CardTitle>
                <CardDescription className="text-indigo-600">建立新記錄</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">
              建立新的膠囊配方記錄，包含原料配置與生產參數
            </p>
            <Link href="/orders/new">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
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

        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-violet-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-lg font-semibold text-violet-700">搜尋篩選</CardTitle>
                <CardDescription className="text-violet-600">快速查找</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">
              快速搜尋與篩選記錄，支援多維度條件查詢
            </p>
            <Link href="/orders">
              <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                開始搜尋
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              系統特色
            </CardTitle>
            <CardDescription className="text-gray-600">
              專業的膠囊配方管理功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <Plus className="h-4 w-4 mr-2 text-indigo-600" />
                配方建檔
              </h4>
              <ul className="text-sm text-gray-600 space-y-2 ml-6">
                <li>• 動態原料條目管理</li>
                <li>• 即時驗證與自動計算</li>
                <li>• 一鍵複製配方清單</li>
                <li>• 智能重量轉換</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                生產記錄
              </h4>
              <ul className="text-sm text-gray-600 space-y-2 ml-6">
                <li>• 多維度搜尋篩選</li>
                <li>• CSV/PDF 匯出功能</li>
                <li>• 列印友好樣式</li>
                <li>• 狀態追蹤管理</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-800 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              快速操作
            </CardTitle>
            <CardDescription className="text-blue-600">
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/orders/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  新增配方
                </Button>
              </Link>
              <Link href="/orders">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  檢視記錄
                </Button>
              </Link>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-blue-700">最近更新</p>
                  <p className="text-blue-600">{new Date().toLocaleDateString('zh-TW')}</p>
                </div>
                <div>
                  <p className="font-medium text-blue-700">系統版本</p>
                  <p className="text-blue-600">v1.0.0</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            最近活動
          </CardTitle>
          <CardDescription>查看最新的生產活動記錄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-4">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">暫無最近活動</p>
            <p className="text-sm text-gray-400">開始建立您的第一個配方記錄</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}