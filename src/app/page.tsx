'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Search, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">EasyPack 膠囊配方管理系統</h1>
        <p className="text-muted-foreground">
          專業的保健品內部生產管理解決方案
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">新增配方</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Plus className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4 text-gray-600">
              建立新的膠囊配方記錄
            </CardDescription>
            <Link href="/orders/new">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                新增配方
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">生產記錄</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4 text-gray-600">
              檢視與管理生產記錄
            </CardDescription>
            <Link href="/orders">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <FileText className="mr-2 h-4 w-4" />
                檢視記錄
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-700">搜尋篩選</CardTitle>
            <div className="p-2 bg-violet-100 rounded-lg">
              <Search className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4 text-gray-600">
              快速搜尋特定配方
            </CardDescription>
            <Link href="/orders?search=true">
              <Button className="w-full bg-violet-600 hover:bg-violet-700">
                <Search className="mr-2 h-4 w-4" />
                開始搜尋
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">統計報表</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4 text-gray-600">
              生產統計與分析
            </CardDescription>
            <Link href="/reports">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                <BarChart3 className="mr-2 h-4 w-4" />
                查看報表
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-800">系統特色</CardTitle>
            <CardDescription className="text-gray-600">
              專業的膠囊配方管理功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">配方建檔</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 動態原料條目管理</li>
                <li>• 即時驗證與自動計算</li>
                <li>• 一鍵複製配方清單</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">生產記錄</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 多維度搜尋篩選</li>
                <li>• CSV/PDF 匯出功能</li>
                <li>• 列印友好樣式</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800">快速操作</CardTitle>
            <CardDescription className="text-blue-600">
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/orders/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  新增配方
                </Button>
              </Link>
              <Link href="/orders">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  檢視記錄
                </Button>
              </Link>
            </div>
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <p>最近更新：{new Date().toLocaleDateString('zh-TW')}</p>
              <p>系統版本：v1.0.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
